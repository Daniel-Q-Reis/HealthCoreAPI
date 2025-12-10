"""
Domain models for Clinical Orders & Service Requests.
Aligned with FHIR ServiceRequest resource.
"""

from django.db import models

from src.apps.core.models import ActivatableModel, AuthorableModel
from src.apps.departments.models import Department
from src.apps.patients.models import Patient
from src.apps.practitioners.models import Practitioner


class OrderStatus(models.TextChoices):
    """FHIR ServiceRequest status codes."""

    DRAFT = "DRAFT", "Draft"
    ACTIVE = "ACTIVE", "Active"
    ON_HOLD = "ON_HOLD", "On Hold"
    COMPLETED = "COMPLETED", "Completed"
    CANCELLED = "CANCELLED", "Cancelled"
    ENTERED_IN_ERROR = "ENTERED_IN_ERROR", "Entered in Error"


class OrderPriority(models.TextChoices):
    """FHIR ServiceRequest priority codes."""

    ROUTINE = "ROUTINE", "Routine"
    URGENT = "URGENT", "Urgent"
    ASAP = "ASAP", "ASAP"
    STAT = "STAT", "STAT (Immediate)"


class OrderCategory(models.TextChoices):
    """Service request categories."""

    LABORATORY = "LAB", "Laboratory"
    IMAGING = "IMAGING", "Imaging"
    PROCEDURE = "PROCEDURE", "Procedure"
    REFERRAL = "REFERRAL", "Referral"


class ClinicalOrder(ActivatableModel, AuthorableModel):  # type: ignore[misc]
    """
    Represents a request for a service to be performed on a patient.

    Maps to FHIR ServiceRequest resource.
    Links Practitioner (requester) → Patient (subject) → Department (performer).
    """

    # Participants
    patient = models.ForeignKey(
        Patient,
        on_delete=models.PROTECT,
        related_name="orders",
        help_text="Patient who is the subject of the order",
    )
    requester = models.ForeignKey(
        Practitioner,
        on_delete=models.PROTECT,
        related_name="orders_requested",
        help_text="Practitioner who requested the service",
    )
    target_department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="incoming_orders",
        help_text="Department responsible for fulfilling the order",
    )

    # Order Details
    category = models.CharField(
        max_length=20,
        choices=OrderCategory.choices,
        default=OrderCategory.LABORATORY,
        help_text="Category of service requested",
    )
    code = models.CharField(
        max_length=255,
        help_text="Service code (e.g., LOINC, CPT, or internal code)",
    )
    description = models.CharField(
        max_length=500, help_text="Human-readable description of the service"
    )

    # Workflow
    status = models.CharField(
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.ACTIVE,
        help_text="Current status of the order",
    )
    priority = models.CharField(
        max_length=20,
        choices=OrderPriority.choices,
        default=OrderPriority.ROUTINE,
        help_text="Urgency of the request",
    )

    # Timing
    requested_date = models.DateTimeField(
        help_text="When the service should be performed"
    )

    # Clinical Context
    reason = models.TextField(
        blank=True, help_text="Clinical reason/indication for the order"
    )
    notes = models.TextField(
        blank=True, help_text="Additional instructions for the performer"
    )

    class Meta:
        verbose_name = "Clinical Order"
        verbose_name_plural = "Clinical Orders"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["priority"]),
            models.Index(fields=["patient"]),
            models.Index(fields=["requester"]),
        ]

    def __str__(self) -> str:
        return f"Order #{self.id} - {self.code} ({self.status})"
