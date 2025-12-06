"""
API Views for Pharmacy.
"""

from drf_spectacular.utils import extend_schema
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response

from . import services
from .models import Dispensation, Medication
from .serializers import (
    CreateDispensationSerializer,
    DispensationSerializer,
    MedicationSerializer,
)


class IsMedicalStaff(permissions.BasePermission):
    """
    Custom permission to only allow medical staff (Doctors/Nurses) to modify inventory.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated

        # Check if user is in 'Doctors' or 'Nurses' group
        # This assumes Groups are set up. For MVP, we'll check is_staff as fallback or group presence.
        return request.user.is_authenticated and (
            request.user.is_staff
            or request.user.groups.filter(name__in=["Doctors", "Nurses"]).exists()
        )


@extend_schema(tags=["Pharmacy"])
class MedicationViewSet(viewsets.ModelViewSet):
    queryset = Medication.objects.filter(is_active=True)
    serializer_class = MedicationSerializer
    permission_classes = [
        permissions.IsAuthenticated
    ]  # Read allowed for all auth users

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsMedicalStaff()]
        return super().get_permissions()


@extend_schema(tags=["Pharmacy"])
class DispensationViewSet(viewsets.ModelViewSet):
    queryset = Dispensation.objects.select_related(
        "medication", "patient", "practitioner"
    ).filter(is_active=True)
    serializer_class = DispensationSerializer
    permission_classes = [IsMedicalStaff]  # Only medical staff can dispense

    @extend_schema(request=CreateDispensationSerializer)
    def create(self, request, *args, **kwargs):
        serializer = CreateDispensationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            dispensation = services.dispense_medication(**data)
            response_serializer = DispensationSerializer(dispensation)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except services.PharmacyError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
