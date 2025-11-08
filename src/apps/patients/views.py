"""
API Views for the Patients bounded context.
"""

from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from src.apps.core.permissions import IsMedicalStaff

from . import services
from .models import Patient
from .serializers import PatientSerializer


@extend_schema(tags=["Patients"])
class PatientViewSet(viewsets.ModelViewSet):
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
    permission_classes = [IsAuthenticated, IsMedicalStaff]

    def get_queryset(self):
        """
        Filter queryset based on user role.

        - Medical staff: See all active patients
        - Admins: See all active patients

        Note: Patient model doesn't have user FK, so all authenticated
        medical staff can see all patients.
        """
        # Medical staff and admins can see all patients
        return Patient.objects.active()

    def perform_create(self, serializer):
        """
        Overrides the default creation to use the service layer.
        """
        services.register_new_patient(**serializer.validated_data)

    def perform_destroy(self, instance):
        """
        Overrides the default destroy to perform a soft delete.
        """
        instance.soft_delete()
