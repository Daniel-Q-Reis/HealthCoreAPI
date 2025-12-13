"""
API Views for Equipment.
"""

from typing import Any

from django.core.exceptions import ValidationError
from drf_spectacular.utils import extend_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from . import services
from .models import (
    Equipment,
)
from .permissions import IsMedicalStaffOrReadOnly
from .serializers import (
    EquipmentIncidentSerializer,
    EquipmentMovementSerializer,
    EquipmentReservationSerializer,
    EquipmentSerializer,
    HandoffSerializer,
    ReportIncidentSerializer,
    ReserveSerializer,
)


class EquipmentViewSet(viewsets.ModelViewSet[Equipment]):
    queryset = Equipment.objects.all()
    serializer_class = EquipmentSerializer
    # CRITICAL: Lock down access to Medical Staff only
    permission_classes = [IsMedicalStaffOrReadOnly]

    @extend_schema(request=HandoffSerializer, responses=EquipmentMovementSerializer)
    @action(detail=True, methods=["post"])
    def handoff(self, request: Any, pk: Any = None) -> Response:
        equipment = self.get_object()
        serializer = HandoffSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        movement = services.record_handoff(
            equipment=equipment, actor=request.user, **serializer.validated_data
        )
        return Response(
            EquipmentMovementSerializer(movement).data, status=status.HTTP_200_OK
        )

    @extend_schema(
        request=ReportIncidentSerializer, responses=EquipmentIncidentSerializer
    )
    @action(detail=True, methods=["post"])
    def incident(self, request: Any, pk: Any = None) -> Response:
        equipment = self.get_object()
        serializer = ReportIncidentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        incident = services.report_incident(
            equipment=equipment, reporter=request.user, **serializer.validated_data
        )
        return Response(
            EquipmentIncidentSerializer(incident).data, status=status.HTTP_201_CREATED
        )

    @extend_schema(request=ReserveSerializer, responses=EquipmentReservationSerializer)
    @action(detail=True, methods=["post"])
    def reserve(self, request: Any, pk: Any = None) -> Response:
        equipment = self.get_object()
        serializer = ReserveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            reservation = services.reserve_equipment(
                equipment=equipment, requester=request.user, **serializer.validated_data
            )
            return Response(
                EquipmentReservationSerializer(reservation).data,
                status=status.HTTP_201_CREATED,
            )
        except ValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
