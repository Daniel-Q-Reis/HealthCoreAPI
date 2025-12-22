"""
API Views for the Patients bounded context.
"""

from typing import Any

from django.db.models import QuerySet
from drf_spectacular.utils import extend_schema
from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated

from src.apps.core.permissions import IsAdmin, IsMedicalStaff

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
    permission_classes = [IsAuthenticated, IsMedicalStaff | IsAdmin]
    filter_backends = [filters.SearchFilter]
    search_fields = ["given_name", "family_name", "mrn", "birth_date"]

    def get_queryset(self) -> QuerySet[Patient]:
        """
        Filter queryset based on user role.

        - Medical staff: See all active patients
        - Admins: See all active patients

        Note: Patient model doesn't have user FK, so all authenticated
        medical staff can see all patients.
        """
        # Medical staff and admins can see all patients
        return Patient.objects.active()

    def perform_create(self, serializer: Any) -> None:
        """
        Overrides the default creation to use the service layer.
        """
        services.register_new_patient(**serializer.validated_data)

    def perform_destroy(self, instance: Patient) -> None:
        """
        Overrides the default destroy to perform a soft delete.
        """
        instance.soft_delete()
