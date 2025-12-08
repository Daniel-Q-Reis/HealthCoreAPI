"""
API Views for the Results & Imaging bounded context.
"""

from drf_spectacular.utils import extend_schema
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from src.apps.core.permissions import IsMedicalStaff

from . import services
from .models import DiagnosticReport
from .serializers import CreateDiagnosticReportSerializer, DiagnosticReportSerializer


@extend_schema(tags=["Results & Imaging"])
class DiagnosticReportViewSet(viewsets.ModelViewSet):
    """
    API endpoint for viewing and creating Diagnostic Reports.

    Permissions:
    - Medical staff (Doctors, Nurses) can access diagnostic reports
    - Admins can access all diagnostic reports

    HIPAA Compliance:
    This endpoint implements role-based access control per HIPAA
    Security Rule requirements for protected health information (PHI).
    """

    queryset = (
        DiagnosticReport.objects.select_related("patient", "performer")
        .prefetch_related("observations")
        .filter(is_active=True)
    )
    permission_classes = [IsAuthenticated, IsMedicalStaff]
    http_method_names = ["get", "post", "head", "options"]

    def get_serializer_class(self):
        if self.action == "create":
            return CreateDiagnosticReportSerializer
        return DiagnosticReportSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            report = services.create_diagnostic_report(**data)
            response_serializer = DiagnosticReportSerializer(report)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except services.ServiceValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
