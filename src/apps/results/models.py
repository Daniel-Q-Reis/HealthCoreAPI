"""
Domain models for the Results & Imaging bounded context.
"""

from django.db import models

from src.apps.core.models import ActivatableModel
from src.apps.patients.models import Patient
from src.apps.practitioners.models import Practitioner


class DiagnosticReport(ActivatableModel):
    """
    Represents a diagnostic report, aligned with FHIR DiagnosticReport resource.
    """

    patient = models.ForeignKey(
        Patient, on_delete=models.PROTECT, related_name="reports"
    )
    performer = models.ForeignKey(
        Practitioner, on_delete=models.PROTECT, related_name="performed_reports"
    )
    status = models.CharField(
        max_length=50,
        choices=[
            ("preliminary", "Preliminary"),
            ("final", "Final"),
            ("amended", "Amended"),
        ],
        default="preliminary",
    )
    conclusion = models.TextField(help_text="The conclusion of the report.")
    issued_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Diagnostic Report"
        verbose_name_plural = "Diagnostic Reports"
        ordering = ["-issued_at"]

    def __str__(self) -> str:
        return f"Report for {self.patient} on {self.issued_at.strftime('%Y-%m-%d')}"


class Observation(ActivatableModel):
    """
    Represents a single observation or finding, aligned with FHIR Observation resource.
    """

    report = models.ForeignKey(
        DiagnosticReport, on_delete=models.CASCADE, related_name="observations"
    )
    code = models.CharField(
        max_length=100,
        help_text="A code identifying the observation type (e.g., LOINC code).",
    )
    value_text = models.CharField(
        max_length=255, help_text="The value of the observation as text."
    )

    class Meta:
        verbose_name = "Observation"
        verbose_name_plural = "Observations"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Observation {self.code}: {self.value_text}"
