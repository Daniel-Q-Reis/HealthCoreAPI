"""
Domain models for the Admissions & Beds bounded context.
"""

from django.db import models

from src.apps.core.models import ActivatableModel
from src.apps.patients.models import Patient


class Ward(ActivatableModel):
    """Represents a hospital ward (e.g., General, ICU, Maternity)."""

    name = models.CharField(max_length=100, unique=True)
    capacity = models.PositiveIntegerField()

    class Meta:
        verbose_name = "Ward"
        verbose_name_plural = "Wards"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Bed(ActivatableModel):
    """Represents a single bed within a ward."""

    ward = models.ForeignKey(Ward, on_delete=models.CASCADE, related_name="beds")
    bed_number = models.CharField(max_length=20)
    is_occupied = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Bed"
        verbose_name_plural = "Beds"
        ordering = ["ward", "bed_number"]
        unique_together = ("ward", "bed_number")

    def __str__(self):
        return f"{self.ward.name} - Bed {self.bed_number}"


class Admission(ActivatableModel):
    """Represents a patient's admission into the hospital."""

    patient = models.ForeignKey(
        Patient, on_delete=models.PROTECT, related_name="admissions"
    )
    bed = models.OneToOneField(
        Bed, on_delete=models.SET_NULL, null=True, blank=True, related_name="admission"
    )
    admission_date = models.DateTimeField(auto_now_add=True)
    discharge_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=50,
        choices=[("admitted", "Admitted"), ("discharged", "Discharged")],
        default="admitted",
    )

    class Meta:
        verbose_name = "Admission"
        verbose_name_plural = "Admissions"
        ordering = ["-admission_date"]

    def __str__(self):
        return f"Admission for {self.patient} on {self.admission_date.strftime('%Y-%m-%d')}"
