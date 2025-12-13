"""
API Views for Pharmacy.
"""

from typing import Any

from drf_spectacular.utils import extend_schema
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.request import Request
from rest_framework.response import Response

from src.apps.core.permissions import IsMedicalStaff

from . import ai_service, services
from .models import Dispensation, Medication
from .serializers import (
    CreateDispensationSerializer,
    DispensationSerializer,
    MedicationSerializer,
)


@extend_schema(tags=["Pharmacy"])
class MedicationViewSet(viewsets.ModelViewSet[Medication]):
    queryset = Medication.objects.filter(is_active=True)
    serializer_class = MedicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self) -> list[Any]:
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsMedicalStaff()]
        return list(super().get_permissions())


@extend_schema(tags=["Pharmacy"])
class DispensationViewSet(viewsets.ModelViewSet[Dispensation]):
    queryset = Dispensation.objects.select_related(
        "medication", "patient", "practitioner"
    ).filter(is_active=True)
    serializer_class = DispensationSerializer
    permission_classes = [IsMedicalStaff]

    @extend_schema(request=CreateDispensationSerializer)
    def create(self, request: Any, *args: Any, **kwargs: Any) -> Response:
        serializer = CreateDispensationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            dispensation = services.dispense_medication(**data)
            response_serializer = DispensationSerializer(dispensation)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except services.PharmacyError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=["Pharmacy AI"],
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "medication_name": {"type": "string", "example": "Metformin"},
                "patient_context": {
                    "type": "string",
                    "example": "65-year-old with Type 2 diabetes",
                },
            },
            "required": ["medication_name"],
        }
    },
    responses={200: {"description": "Drug information response"}},
)
@api_view(["POST"])
@permission_classes([IsMedicalStaff])
def drug_info_view(request: Request) -> Response:
    """
    AI-powered drug information assistant.

    Provides comprehensive drug information including interactions,
    dosages, side effects, and contraindications.

    Requires IsMedicalStaff permission.
    """
    medication_name = request.data.get("medication_name")
    patient_context = request.data.get("patient_context", "")

    if not medication_name:
        return Response(
            {"error": "medication_name is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    result = ai_service.get_drug_information(
        medication_name=medication_name,
        patient_context=patient_context,
    )

    if not result.success:
        return Response(
            {"error": result.error_message},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    return Response(
        {
            "medication_name": result.medication_name,
            "information": result.information,
            "model_used": result.model_used,
        },
        status=status.HTTP_200_OK,
    )
