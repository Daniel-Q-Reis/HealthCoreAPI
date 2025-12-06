"""
Domain models for the Pharmacy & Inventory bounded context.
"""

from django.db import models

from src.apps.core.models import ActivatableModel
from src.apps.patients.models import Patient
from src.apps.practitioners.models import Practitioner


class Medication(ActivatableModel):
    """
    Represents a specific batch/type of medication in stock.
    """

    name = models.CharField(max_length=255)
    brand = models.CharField(max_length=255)
    sku = models.CharField(max_length=100, unique=True, help_text="Stock Keeping Unit")
    description = models.TextField(blank=True)
    batch_number = models.CharField(max_length=100)
    expiry_date = models.DateField()
    stock_quantity = models.PositiveIntegerField(default=0)

    # Threshold configuration could be dynamic, but fixed for MVP as per requirements

    class Meta:
        verbose_name = "Medication"
        verbose_name_plural = "Medications"
        ordering = ["expiry_date"]
        indexes = [
            models.Index(fields=["sku"]),
            models.Index(fields=["expiry_date"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.brand}) - Stock: {self.stock_quantity}"

    @property
    def is_expired(self):
        from django.utils import timezone

        return self.expiry_date < timezone.now().date()


class Dispensation(ActivatableModel):
    """
    Audit log of a medication being dispensed to a patient.
    """

    medication = models.ForeignKey(
        Medication, on_delete=models.PROTECT, related_name="dispensations"
    )
    patient = models.ForeignKey(
        Patient, on_delete=models.PROTECT, related_name="medications_received"
    )
    practitioner = models.ForeignKey(
        Practitioner, on_delete=models.PROTECT, related_name="medications_dispensed"
    )
    quantity = models.PositiveIntegerField()
    notes = models.TextField(blank=True)
    dispensed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Dispensation"
        verbose_name_plural = "Dispensations"
        ordering = ["-dispensed_at"]

    def __str__(self):
        return f"{self.quantity}x {self.medication.name} to {self.patient.given_name} by {self.practitioner.given_name}"
