"""
API Views for the Patients bounded context.
"""

from typing import Any, cast

from django.contrib.auth.models import AbstractBaseUser
from django.db.models import QuerySet
from drf_spectacular.utils import extend_schema
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from . import services
from .models import Patient
from .serializers import PatientSerializer


@extend_schema(tags=["Patients"])
class PatientViewSet(viewsets.ModelViewSet[Patient]):
    """
    API endpoint for managing Patients.

    Permissions:
    - Medical staff (Doctors, Nurses) can access all patient records
    - Admins can access all patient records

    HIPAA Compliance:
    This endpoint implements role-based access control per HIPAA
    Security Rule requirements for protected health information (PHI).
    """

    queryset = Patient.objects.active()
    serializer_class = PatientSerializer
    lookup_field = "id"
    lookup_field = "id"
    permission_classes = [IsAuthenticated]  # Relaxed from [IsMedicalStaff | IsAdmin]
    filter_backends = [filters.SearchFilter]
    search_fields = ["given_name", "family_name", "mrn", "birth_date"]

    def get_queryset(self) -> QuerySet[Patient]:
        """
        Filter queryset based on user role.

        - Medical staff/Admins: See all active patients
        - Patients: See only their own record (matched by email)
        """
        user = self.request.user

        # Admin or Medical Staff -> Full Access
        if (
            user.is_superuser
            or user.groups.filter(name__in=["Doctors", "Nurses", "Admins"]).exists()
        ):
            return Patient.objects.active()

        # Regular User -> Own Profile Only
        # Cast to get email attribute (authenticated users only reach here)
        authenticated_user = cast(AbstractBaseUser, user)
        return Patient.objects.active().filter(
            email=getattr(authenticated_user, "email", "")
        )

    def perform_create(self, serializer: Any) -> None:
        """
        Overrides the default creation to use the service layer.
        For regular users, forced to use their own email.
        """
        data = serializer.validated_data
        user = self.request.user

        # If not staff, enforce email match
        is_staff = (
            user.is_superuser
            or user.groups.filter(name__in=["Doctors", "Nurses", "Admins"]).exists()
        )
        if not is_staff:
            # Cast to get email attribute
            authenticated_user = cast(AbstractBaseUser, user)
            data["email"] = getattr(authenticated_user, "email", "")

        services.register_new_patient(**data)

    @action(detail=False, methods=["get", "post"], url_path="me")
    def me(self, request: Any) -> Response:
        """
        Endpoint for the current user to get or create their patient profile.
        GET: Returns current profile if exists.
        POST: Creates profile if missing.
        """
        # clear any cached properties if any, strict DB lookup
        patient = Patient.objects.active().filter(email=request.user.email).first()

        if request.method == "GET":
            if not patient:
                return Response(
                    {"detail": "Profile not found"}, status=status.HTTP_404_NOT_FOUND
                )
            serializer = self.get_serializer(patient)
            return Response(serializer.data)

        if request.method == "POST":
            if patient:
                return Response(
                    self.get_serializer(patient).data, status=status.HTTP_200_OK
                )

            # Prepare data
            data = request.data.copy()
            data["email"] = request.user.email  # Force email linkage

            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)

            # Fetch the newly created
            new_patient = (
                Patient.objects.active().filter(email=request.user.email).first()
            )
            return Response(
                self.get_serializer(new_patient).data, status=status.HTTP_201_CREATED
            )

        # Fallback for unsupported methods (should not reach here due to decorator)
        return Response(
            {"detail": "Method not allowed"}, status=status.HTTP_405_METHOD_NOT_ALLOWED
        )
