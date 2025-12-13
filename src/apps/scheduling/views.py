"""
API Views for the Scheduling bounded context.
"""

import json
from typing import Any

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
class AppointmentViewSet(viewsets.ModelViewSet[Appointment]):
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

    # OPTIMIZATION: Added select_related to prevent N+1 queries.
    # ORIGINAL LOGIC PRESERVED: filter(is_active=True) is maintained.
    queryset = Appointment.objects.select_related(
        "patient", "practitioner", "slot", "slot__practitioner"
    ).filter(is_active=True)
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated, IsMedicalStaff]

    def get_permissions(self) -> list[Any]:
        """
        Customize permissions based on action.

        - Create/Update/Delete: Doctors only
        - List/Retrieve: Medical staff (Doctors + Nurses)
        """
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAuthenticated(), IsDoctor()]
        return [IsAuthenticated(), IsMedicalStaff()]

    def create(self, request: Any, *args: Any, **kwargs: Any) -> Response:
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

                return Response(response_data, status=key_obj.response_code)
            except IdempotencyKey.DoesNotExist:
                # Key not found - proceed with creation
                pass

        # Validate request data
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        patient = validated_data["patient"]
        slot = validated_data["slot"]

        try:
            # Use book_appointment service
            appointment = services.book_appointment(patient=patient, slot_id=slot.id)

            # Optimization: Re-fetch with relationships to avoid N+1 during serialization of the response
            appointment = self.get_queryset().get(id=appointment.id)

            response_serializer = self.get_serializer(appointment)
            headers = self.get_success_headers(response_serializer.data)
            response = Response(
                response_serializer.data,
                status=status.HTTP_201_CREATED,
                headers=headers,
            )

            # Store idempotency key if provided
            if idempotency_key and request.user.is_authenticated:
                try:
                    IdempotencyKey.objects.create(
                        user=request.user,
                        idempotency_key=idempotency_key,
                        request_path=request.path,
                        response_code=response.status_code,
                        response_body=json.dumps(response_serializer.data),
                    )
                except Exception:
                    # Ignore if concurrent request already created the key
                    pass

            return response
        except services.SlotUnavailableError as e:
            # Return 400 with detail message for unavailable slots
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def perform_destroy(self, instance: Appointment) -> None:
        """
        Soft delete appointment.
        """
        instance.soft_delete()

    @action(
        detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsDoctor]
    )
    def cancel(self, request: Any, pk: int | None = None) -> Response:
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
class SlotViewSet(viewsets.ModelViewSet[Slot]):
    """
    API endpoint for managing Slots.

    Permissions:
    - Doctors can create and manage slots
    - Medical staff can view slots
    """

    # OPTIMIZATION: Added select_related for practitioner.
    # ORIGINAL LOGIC PRESERVED: filter(is_active=True) is maintained.
    queryset = Slot.objects.select_related("practitioner").filter(is_active=True)
    serializer_class = SlotSerializer
    permission_classes = [IsAuthenticated, IsMedicalStaff]

    def get_permissions(self) -> list[Any]:
        """
        Doctors only for create/update/delete.
        Medical staff for read operations.
        """
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAuthenticated(), IsDoctor()]
        return [IsAuthenticated(), IsMedicalStaff()]
