"""
API Views for Clinical Orders & Service Requests.
"""

from typing import Any

from drf_spectacular.utils import extend_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from src.apps.core.permissions import IsMedicalStaff

from . import services
from .models import ClinicalOrder
from .serializers import ClinicalOrderSerializer, CreateClinicalOrderSerializer


@extend_schema(tags=["Clinical Orders"])
class ClinicalOrderViewSet(viewsets.ModelViewSet[ClinicalOrder]):
    """
    API endpoint for managing clinical orders (ServiceRequests).

    Permissions:
    - Medical staff (Doctors, Nurses) can create and manage orders
    - Restricted to medical staff for clinical governance

    FHIR Alignment: Maps to ServiceRequest resource
    """

    queryset = ClinicalOrder.objects.select_related(
        "patient", "requester", "target_department"
    ).filter(is_active=True)
    serializer_class = ClinicalOrderSerializer
    permission_classes = [IsAuthenticated, IsMedicalStaff]
    filterset_fields = [
        "patient",
        "status",
        "priority",
        "target_department",
        "category",
    ]
    search_fields = [
        "code",
        "description",
        "patient__given_name",
        "patient__family_name",
    ]

    def get_serializer_class(self) -> type[Any]:
        if self.action == "create":
            return CreateClinicalOrderSerializer
        return ClinicalOrderSerializer

    def create(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """Create a new clinical order using service layer."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            order = services.create_clinical_order(
                patient_id=serializer.validated_data["patient_id"],
                requester_id=serializer.validated_data["requester_id"],
                code=serializer.validated_data["code"],
                description=serializer.validated_data["description"],
                requested_date=serializer.validated_data["requested_date"],
                category=serializer.validated_data.get("category", "LAB"),
                priority=serializer.validated_data.get("priority", "ROUTINE"),
                target_department_id=serializer.validated_data.get(
                    "target_department_id"
                ),
                reason=serializer.validated_data.get("reason", ""),
                notes=serializer.validated_data.get("notes", ""),
                created_by=request.user,
            )

            response_serializer = ClinicalOrderSerializer(order)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        except services.ServiceValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"])
    def cancel(self, request: Request, pk: Any = None) -> Response:
        """Cancel an order."""
        order = self.get_object()

        try:
            services.cancel_order(order, actor=request.user)
            return Response(
                {"status": "Order cancelled successfully"}, status=status.HTTP_200_OK
            )
        except services.ServiceValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"])
    def complete(self, request: Request, pk: Any = None) -> Response:
        """Mark order as completed."""
        order = self.get_object()

        try:
            services.update_order_status(order, "COMPLETED", actor=request.user)
            return Response(
                {"status": "Order completed successfully"}, status=status.HTTP_200_OK
            )
        except services.ServiceValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
