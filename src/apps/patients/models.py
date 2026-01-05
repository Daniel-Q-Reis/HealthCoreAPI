"""
Domain models for the Patients bounded context.
"""

from typing import Any

from django.db import models

from src.apps.core.models import ActivatableModel


class Patient(ActivatableModel):
    """
    Represents a patient within the hospital system, aligned with FHIR Patient resource.
    Inherits timestamp and activation fields from core models.
    """

    # Identifiers
    mrn = models.CharField(
        max_length=255, unique=True, help_text="Medical Record Number", blank=True
    )

    # ... fields ...

    def save(self, *args: Any, **kwargs: Any) -> None:
        if not self.mrn:
            # Simple auto-generation: P + distinct timestamp part + random suffix
            # Format: P-TIMESTAMP-RAND (e.g., P-171563-123)
            # Keeping it strictly numeric/simple as per some standards or mixing
            # Using uuid subset is safer for collision
            import uuid

            self.mrn = f"MRN-{str(uuid.uuid4().int)[:10]}"
        super().save(*args, **kwargs)

    # Personal Details
    given_name = models.CharField(max_length=255)
    family_name = models.CharField(max_length=255)
    birth_date = models.DateField()
    sex = models.CharField(
        max_length=50,
        choices=[
            ("male", "Male"),
            ("female", "Female"),
            ("other", "Other"),
            ("unknown", "Unknown"),
        ],
    )

    # Contact Info
    phone_number = models.CharField(max_length=20, blank=True)
    email = models.EmailField(max_length=255, blank=True)

    # Health Information (Simplified for this slice)
    blood_type = models.CharField(max_length=5, blank=True)

    class Meta:
        verbose_name = "Patient"
        verbose_name_plural = "Patients"
        ordering = ["family_name", "given_name"]

    def __str__(self) -> str:
        return f"{self.family_name}, {self.given_name} (MRN: {self.mrn})"
