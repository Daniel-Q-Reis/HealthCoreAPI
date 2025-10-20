"""
API Views for the Patients bounded context.
"""

from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from . import services
from .models import Patient
from .serializers import PatientSerializer


@extend_schema(tags=["Patients"])
class PatientViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing Patients.
    Provides full CRUD functionality for patient records.
    """

    queryset = Patient.objects.active()
    serializer_class = PatientSerializer
    lookup_field = "id"
    permission_classes = [IsAuthenticated]

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
