"""
Views for the Departments API.
"""

from typing import Any

from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.request import Request
from rest_framework.serializers import BaseSerializer

from src.apps.core.permissions import IsAdmin

from . import services
from .models import Department
from .serializers import DepartmentSerializer


@extend_schema(tags=["Departments & Specialties"])
class DepartmentViewSet(viewsets.ModelViewSet[Department]):
    """
    API endpoint for managing Departments.

    Permissions:
    - Admin only - hospital organizational structure management
    - Ensures controlled department hierarchy
    """

    queryset = Department.objects.filter(is_active=True)
    serializer_class = DepartmentSerializer
    permission_classes = [IsAdmin]

    def list(self, request: Request, *args: Any, **kwargs: Any) -> Any:
        return super().list(request, *args, **kwargs)

    def perform_create(self, serializer: BaseSerializer[Department]) -> None:
        """
        Uses the service layer to create a new department.
        """
        services.create_new_department(**serializer.validated_data)

    def perform_destroy(self, instance: Department) -> None:
        """
        Performs a soft delete on the department instance.
        """
        instance.soft_delete()
