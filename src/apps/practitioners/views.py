"""
API Views for the Practitioners bounded context.
"""

from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from . import services
from .models import Practitioner
from .serializers import PractitionerSerializer


@extend_schema(tags=["Practitioners"])
class PractitionerViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing Practitioners.
    """

    queryset = Practitioner.objects.active()
    serializer_class = PractitionerSerializer
    lookup_field = "id"
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        """
        Uses the service layer to create a new practitioner.
        """
        services.register_new_practitioner(**serializer.validated_data)

    def perform_destroy(self, instance):
        """
        Performs a soft delete on the practitioner instance.
        """
        instance.soft_delete()
