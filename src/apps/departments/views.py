"""
API Views for the Departments & Specialties bounded context.
"""

from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from . import services
from .models import Department
from .serializers import DepartmentSerializer


@extend_schema(tags=["Departments & Specialties"])
class DepartmentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing Departments.
    """

    queryset = Department.objects.filter(is_active=True)
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        """
        Uses the service layer to create a new department.
        """
        services.create_new_department(**serializer.validated_data)

    def perform_destroy(self, instance):
        """
        Performs a soft delete on the department instance.
        """
        instance.soft_delete()
