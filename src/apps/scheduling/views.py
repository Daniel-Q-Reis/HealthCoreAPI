"""
API Views for the Scheduling bounded context.
"""

import json
from typing import Any

from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from src.apps.core.models import IdempotencyKey
from src.apps.core.permissions import IsDoctor

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
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filter appointments based on user role.
        - Patients: See only their own appointments.
        - Staff/Admins: See all.
        """
        user = self.request.user
        queryset = super().get_queryset()

        # If superuser or staff (Doctors/Nurses/Admins), return all
        if (
            user.is_superuser
            or user.groups.filter(name__in=["Doctors", "Nurses", "Admins"]).exists()
        ):
            return queryset

        # Otherwise, filter by patient email (assuming link by email)
        # Note: Ideally we filter by patient.user, but our model might use email link
        return queryset.filter(patient__email=user.email)

    def get_permissions(self) -> list[Any]:
        """
        Customize permissions based on action.
        """
        if self.action in ["update", "partial_update", "destroy"]:
            return [IsAuthenticated(), IsDoctor()]
        # Allow Patients to Create and List (List logic should filter by own appointments ideally)
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        """
        Custom create method to handle appointment booking logic,
        idempotency, and specific error handling.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Extract data from validated serializer
        patient = serializer.validated_data.get("patient")
        slot = serializer.validated_data.get("slot")
        idempotency_key = request.headers.get("Idempotency-Key")

        # Handle potential null patient or slot if validation allows (though serializer should prevent this)
        # Handle potential null patient or slot if validation allows (though serializer should prevent this)
        if not patient:
            # Patient Self-Service Logic:
            # If no patient ID provided (Patient booking for self), try to find Patient by user email
            from src.apps.patients.models import Patient

            patient = Patient.objects.filter(email=request.user.email).first()

            if not patient:
                return Response(
                    {
                        "detail": "No patient profile found for this user. Please contact reception."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if not slot:
            return Response(
                {"detail": "Slot is required."}, status=status.HTTP_400_BAD_REQUEST
            )

        # Check for idempotency key and return previous response if found
        if idempotency_key and request.user.is_authenticated:
            existing_key = IdempotencyKey.objects.filter(
                user=request.user,
                idempotency_key=idempotency_key,
                request_path=request.path,
            ).first()
            if existing_key:
                return Response(
                    json.loads(existing_key.response_body),
                    status=existing_key.response_code,
                )

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
        except Exception as e:
            # Capture other service errors (like Appointment integrity) and return 400
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ... (rest of AppointmentViewSet) ...


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
    permission_classes = [IsAuthenticated]

    # Enable filtering by practitioner and valid booking status
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["practitioner", "is_booked"]

    def get_permissions(self) -> list[Any]:
        """
        Doctors only for create/update/delete.
        All authenticated users for read operations (Patient Portal).
        """
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAuthenticated(), IsDoctor()]
        return [IsAuthenticated()]
