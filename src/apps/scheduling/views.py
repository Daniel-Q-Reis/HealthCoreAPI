"""
API Views for the Scheduling bounded context.
"""

import json

from django.http import JsonResponse
from drf_spectacular.utils import extend_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from src.apps.core.models import IdempotencyKey
from src.apps.core.permissions import IsDoctor, IsMedicalStaff

from . import services
from .models import Appointment, Slot
from .serializers import AppointmentSerializer, SlotSerializer


@extend_schema(tags=["Scheduling"])
class AppointmentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing Appointments.

    Permissions:
    - Doctors can create, view, and modify all appointments
    - Nurses can view appointments (read-only)

    Business rules:
    - Prevents double-booking of practitioners
    - Validates slot availability
    - Implements idempotency for create operations
    - Automatically sets practitioner from slot
    """

    queryset = Appointment.objects.filter(is_active=True)
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated, IsMedicalStaff]

    def get_permissions(self):
        """
        Customize permissions based on action.

        - Create/Update/Delete: Doctors only
        - List/Retrieve: Medical staff (Doctors + Nurses)
        """
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAuthenticated(), IsDoctor()]
        return [IsAuthenticated(), IsMedicalStaff()]

    def create(self, request, *args, **kwargs):
        """
        Override create to handle:
        1. Idempotency (check for duplicate Idempotency-Key)
        2. Service exceptions (convert to proper HTTP responses)
        3. Automatic practitioner assignment from slot
        """
        # Check for idempotency key
        idempotency_key = request.headers.get("Idempotency-Key")
        if idempotency_key and request.user.is_authenticated:
            try:
                # Check if this key was already processed
                key_obj = IdempotencyKey.objects.get(
                    user=request.user, idempotency_key=idempotency_key
                )
                # Return cached response
                try:
                    response_data = (
                        json.loads(key_obj.response_body)
                        if key_obj.response_body
                        else {}
                    )
                except (json.JSONDecodeError, TypeError):
                    response_data = {}

                return JsonResponse(
                    response_data, status=key_obj.response_code, safe=False
                )
            except IdempotencyKey.DoesNotExist:
                # Key not found - proceed with creation
                pass

        # Validate request data
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        patient = serializer.validated_data.get("patient")
        slot = serializer.validated_data.get("slot")

        try:
            # Use book_appointment service
            appointment = services.book_appointment(patient=patient, slot_id=slot.id)

            # Serialize the created appointment
            output_serializer = self.get_serializer(appointment)
            headers = self.get_success_headers(output_serializer.data)

            response = Response(
                output_serializer.data, status=status.HTTP_201_CREATED, headers=headers
            )

            # Store idempotency key if provided
            if idempotency_key and request.user.is_authenticated:
                try:
                    IdempotencyKey.objects.create(
                        user=request.user,
                        idempotency_key=idempotency_key,
                        request_path=request.path,
                        response_code=response.status_code,
                        response_body=json.dumps(output_serializer.data),
                    )
                except Exception:
                    # Ignore if concurrent request already created the key
                    pass

            return response

        except services.SlotUnavailableError as e:
            # Return 400 with detail message for unavailable slots
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def perform_destroy(self, instance):
        """
        Soft delete appointment.
        """
        instance.soft_delete()

    @action(
        detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsDoctor]
    )
    def cancel(self, request, pk=None):
        """
        Cancel an appointment.

        Only doctors can cancel appointments.
        """
        appointment = self.get_object()
        appointment.soft_delete()
        return Response(
            {"detail": "Appointment cancelled successfully."}, status=status.HTTP_200_OK
        )


@extend_schema(tags=["Scheduling"])
class SlotViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing Slots.

    Permissions:
    - Doctors can create and manage slots
    - Medical staff can view slots
    """

    queryset = Slot.objects.filter(is_active=True)
    serializer_class = SlotSerializer
    permission_classes = [IsAuthenticated, IsMedicalStaff]

    def get_permissions(self):
        """
        Doctors only for create/update/delete.
        Medical staff for read operations.
        """
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAuthenticated(), IsDoctor()]
        return [IsAuthenticated(), IsMedicalStaff()]
