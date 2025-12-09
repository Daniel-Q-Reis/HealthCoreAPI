"""
API Views for the Shifts & Availability bounded context.
"""

from typing import Any

from drf_spectacular.utils import extend_schema
from rest_framework import status, viewsets
from rest_framework.request import Request
from rest_framework.response import Response

from src.apps.core.permissions import IsMedicalStaff

from . import services
from .models import Shift
from .serializers import ShiftSerializer


@extend_schema(tags=["Shifts & Availability"])
class ShiftViewSet(viewsets.ModelViewSet):
    """
    API endpoint for viewing and creating Practitioner Shifts.

    Permissions:
    - Medical staff (Doctors, Nurses) can manage their shifts
    - Restricted to medical staff for operational integrity

    Note: Future enhancement - add 24h advance notice validation
    """

    queryset = Shift.objects.select_related("practitioner").filter(is_active=True)
    serializer_class = ShiftSerializer
    permission_classes = [IsMedicalStaff]

    def create(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            shift = services.create_shift_for_practitioner(**data)
            response_serializer = self.get_serializer(shift)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except services.ServiceValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
