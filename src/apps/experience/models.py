"""
Domain models for the Patient Experience & Humanization bounded context.
"""

from django.db import models

from src.apps.admissions.models import Admission
from src.apps.core.models import ActivatableModel
from src.apps.patients.models import Patient


class PatientFeedback(ActivatableModel):
    """
    Represents feedback submitted by a patient regarding an encounter.
    """

    patient = models.ForeignKey(
        Patient,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="feedback",
    )
    admission = models.ForeignKey(
        Admission,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="feedback",
    )
    overall_rating = models.IntegerField(
        choices=[(i, i) for i in range(1, 6)],
        help_text="Overall satisfaction rating from 1 to 5",
    )
    comments = models.TextField(blank=True)

    class Meta:
        verbose_name = "Patient Feedback"
        verbose_name_plural = "Patient Feedbacks"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Feedback from {self.patient or 'Anonymous'} - Rating: {self.overall_rating}"


class PatientComplaint(ActivatableModel):
    """
    Represents a formal complaint lodged by a patient.
    """

    patient = models.ForeignKey(
        Patient,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="complaints",
    )
    admission = models.ForeignKey(
        Admission,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="complaints",
    )
    category = models.CharField(
        max_length=100,
        choices=[
            ("quality", "Quality of Care"),
            ("service", "Service Issue"),
            ("billing", "Billing Issue"),
            ("other", "Other"),
        ],
    )
    description = models.TextField()
    status = models.CharField(
        max_length=50,
        choices=[
            ("open", "Open"),
            ("investigating", "Investigating"),
            ("resolved", "Resolved"),
        ],
        default="open",
    )

    class Meta:
        verbose_name = "Patient Complaint"
        verbose_name_plural = "Patient Complaints"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Complaint ({self.category}) from {self.patient or 'Anonymous'}"
