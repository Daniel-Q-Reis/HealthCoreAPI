"""
Domain models for the Patients bounded context.
"""

from django.db import models

from src.apps.core.models import ActivatableModel


class Patient(ActivatableModel):
    """
    Represents a patient within the hospital system, aligned with FHIR Patient resource.
    Inherits timestamp and activation fields from core models.
    """

    # Identifiers
    mrn = models.CharField(
        max_length=255, unique=True, help_text="Medical Record Number"
    )
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

    def __str__(self):
        return f"{self.family_name}, {self.given_name} (MRN: {self.mrn})"
