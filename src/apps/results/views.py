"""
API Views for the Results & Imaging bounded context.
"""

from typing import Any

from django.db import models
from drf_spectacular.utils import extend_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from src.apps.core.ai_client import AIServiceUnavailableError, get_ai_client
from src.apps.core.permissions import IsMedicalStaff

from . import services
from .models import DiagnosticReport
from .serializers import (
    CreateDiagnosticReportSerializer,
    DiagnosticReportSerializer,
    LifestyleAdviceSerializer,
)


@extend_schema(tags=["Results & Imaging"])
class DiagnosticReportViewSet(viewsets.ModelViewSet[DiagnosticReport]):
    """
    API endpoint for viewing and creating Diagnostic Reports.

    Permissions:
    - Medical staff (Doctors, Nurses) can access diagnostic reports
    - Admins can access all diagnostic reports

    HIPAA Compliance:
    This endpoint implements role-based access control per HIPAA
    Security Rule requirements for protected health information (PHI).
    """

    queryset = DiagnosticReport.objects.prefetch_related("observations")
    permission_classes = [IsAuthenticated]  # Dynamic permissions in get_permissions
    http_method_names = ["get", "post", "head", "options"]

    def get_permissions(self) -> list[Any]:
        """
        Instantiate and return the list of permissions that this view requires.
        """
        if self.action == "create":
            # Only medical staff can create reports
            return [IsAuthenticated(), IsMedicalStaff()]

        if self.action == "analyze_diagnosis":
            # Allow all authenticated users (including patients) to use ad-hoc analysis
            return [IsAuthenticated()]

        if self.action in ["list", "retrieve"]:
            # Strictly restrict default CRUD to Medical Staff to match legacy RBAC tests.
            # Patients cannot list/view reports via generic endpoints yet ("Coming Soon").
            return [IsAuthenticated(), IsMedicalStaff()]

        if self.action == "lifestyle_advice":
            # This action contains its own specific object-level permission logic
            return [IsAuthenticated()]

        return [IsAuthenticated()]

    def get_queryset(self) -> "models.QuerySet[DiagnosticReport]":
        user = self.request.user
        queryset = (
            DiagnosticReport.objects.select_related("patient", "performer")
            .prefetch_related("observations")
            .filter(is_active=True)
        )

        if (
            user.groups.filter(name__in=["Doctors", "Nurses", "Admins"]).exists()
            or user.is_superuser
        ):
            return queryset

        # If patient, only show own reports
        if hasattr(user, "patient_profile"):
            # Use getattr to satisfy mypy since 'patient_profile' is dynamically added by OneToOneField
            return queryset.filter(patient=user.patient_profile)

        # Fallback for others (shouldn't happen with proper roles)
        return queryset.none()

    def get_serializer_class(self) -> type[Any]:
        if self.action == "create":
            return CreateDiagnosticReportSerializer
        return DiagnosticReportSerializer

    def create(self, request: Any, *args: Any, **kwargs: Any) -> Response:
        # Permission check: IsMedicalStaff handles 'create' via get_permissions
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            report = services.create_diagnostic_report(**data)
            response_serializer = DiagnosticReportSerializer(report)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except services.ServiceValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Get AI Lifestyle Advice",
        description="Generates lifestyle and diet suggestions based on the diagnostic report using AI.",
        responses={200: LifestyleAdviceSerializer},
    )
    @action(detail=True, methods=["post"], url_path="lifestyle-advice")
    def lifestyle_advice(self, request: Any, pk: int | str | None = None) -> Response:
        """Generate AI lifestyle advice for a specific report."""
        report = self.get_object()

        # Check permissions: User must be the patient or medical staff
        # Base permission class IsMedicalStaff handles staff.
        # We need to allow Patient owner as well.
        # But queryset filter might restrict access?
        # The queryset does NOT filter by user, so we must check ownership or role.

        # Use getattr for strict typing compliance
        patient_profile = getattr(request.user, "patient_profile", None)
        is_owner = patient_profile and report.patient == patient_profile
        is_staff = (
            request.user.groups.filter(name__in=["Doctors", "Nurses"]).exists()
            or request.user.is_superuser
        )

        if not (is_owner or is_staff):
            return Response(
                {"detail": "You do not have permission to view this report's advice."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            client = get_ai_client()
            if not client.is_configured():
                return Response(
                    {"detail": "AI service is not configured."},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )

            # Prepare context
            patient = report.patient
            patient_context = f"{patient.sex}, born {patient.birth_date}."

            # Generate advice
            advice = client.generate_lifestyle_advice(
                diagnostic_report_text=report.conclusion,
                patient_context=patient_context,
            )

            return Response({"advice": advice, "model_used": client.model_name})

        except AIServiceUnavailableError as e:
            return Response(
                {"detail": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception:
            return Response(
                {"detail": "An unexpected error occurred."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        summary="Analyze Diagnosis (Ad-Hoc)",
        description="Generates lifestyle advice based on a manually entered diagnosis.",
        request={"application/json": {"diagnosis": "string"}},
        responses={200: LifestyleAdviceSerializer},
    )
    @action(detail=False, methods=["post"], url_path="analyze-diagnosis")
    def analyze_diagnosis(self, request: Any) -> Response:
        """Generate advice for a manually entered diagnosis."""
        # Strict typing: cast to string
        diagnosis = str(request.data.get("diagnosis", "")).strip()
        if not diagnosis:
            return Response(
                {"detail": "Diagnosis is required."}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            client = get_ai_client()
            if not client.is_configured():
                return Response(
                    {"detail": "AI service is not configured."},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )

            # Prepare context
            patient_context = ""
            if hasattr(request.user, "patient_profile"):
                # Use getattr to satisfy mypy since 'patient_profile' is dynamically added by OneToOneField
                p = request.user.patient_profile
                patient_context = f"{p.sex}, born {p.birth_date}."

            # Generate advice
            advice = client.generate_lifestyle_advice(
                diagnostic_report_text=diagnosis, patient_context=patient_context
            )

            return Response({"advice": advice, "model_used": client.model_name})

        except AIServiceUnavailableError as e:
            return Response(
                {"detail": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception:
            return Response(
                {"detail": "An unexpected error occurred."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
