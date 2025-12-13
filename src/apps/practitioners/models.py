"""
Domain models for the Practitioners bounded context.
"""

from django.db import models

from src.apps.core.models import ActivatableModel


class Practitioner(ActivatableModel):
    """
    Represents a medical practitioner (e.g., physician, nurse).
    Aligned with FHIR Practitioner resource.
    """

    # Identifiers
    license_number = models.CharField(max_length=100, unique=True)

    # Personal Details
    given_name = models.CharField(max_length=255)
    family_name = models.CharField(max_length=255)

    # Professional Details
    role = models.CharField(
        max_length=100, help_text="e.g., Physician, Nurse, Technician"
    )
    specialty = models.CharField(
        max_length=100, blank=True, help_text="e.g., Cardiology, Radiology"
    )

    class Meta:
        verbose_name = "Practitioner"
        verbose_name_plural = "Practitioners"
        ordering = ["family_name", "given_name"]

    def __str__(self) -> str:
        return f"{self.family_name}, {self.given_name} ({self.role})"
