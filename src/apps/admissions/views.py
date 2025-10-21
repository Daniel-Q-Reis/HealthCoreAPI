"""
API Views for the Admissions & Beds bounded context.
"""

from drf_spectacular.utils import extend_schema
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from . import services
from .models import Admission, Bed, Ward
from .serializers import (
    AdmissionSerializer,
    BedSerializer,
    CreateAdmissionSerializer,
    WardSerializer,
)


@extend_schema(tags=["Admissions & Beds"])
class AdmissionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for viewing and managing Patient Admissions.
    """

    queryset = Admission.objects.select_related("patient", "bed__ward").filter(
        is_active=True
    )
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create":
            return CreateAdmissionSerializer
        return AdmissionSerializer

    def get_queryset(self):
        # Allow read operations (list, retrieve) to be handled normally
        if self.action in ["list", "retrieve"]:
            return Admission.objects.select_related("patient", "bed__ward").filter(
                is_active=True
            )
        # Return all admissions for create operations
        return Admission.objects.all()

    def create(self, request, *args, **kwargs):
        create_serializer = CreateAdmissionSerializer(data=request.data)
        create_serializer.is_valid(raise_exception=True)
        data = create_serializer.validated_data

        try:
            admission = services.admit_patient_to_ward(
                patient_id=data["patient_id"], ward_id=data["ward_id"]
            )
            response_serializer = AdmissionSerializer(admission)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except (services.PatientNotFoundError, services.BedUnavailableError) as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=["Admissions & Beds"])
class WardViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Ward.objects.prefetch_related("beds").filter(is_active=True)
    serializer_class = WardSerializer
    permission_classes = [IsAuthenticated]


@extend_schema(tags=["Admissions & Beds"])
class BedViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Bed.objects.select_related("ward").filter(is_active=True)
    serializer_class = BedSerializer
    permission_classes = [IsAuthenticated]
