"""
API Views for the Practitioners bounded context.
"""

from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.serializers import Serializer

from src.apps.core.permissions import IsAdmin

from . import services
from .models import Practitioner
from .serializers import PractitionerSerializer


@extend_schema(tags=["Practitioners"])
class PractitionerViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing Practitioners.

    Permissions:
    - Admin only - requires human validation of professional credentials
    - Ensures proper verification of medical licenses and qualifications
    """

    queryset = Practitioner.objects.active()
    serializer_class = PractitionerSerializer
    lookup_field = "id"
    permission_classes = [IsAdmin]

    def perform_create(self, serializer: Serializer) -> None:
        """
        Uses the service layer to create a new practitioner.
        """
        services.register_new_practitioner(**serializer.validated_data)

    def perform_destroy(self, instance: Practitioner) -> None:
        """
        Performs a soft delete on the practitioner instance.
        """
        instance.soft_delete()
