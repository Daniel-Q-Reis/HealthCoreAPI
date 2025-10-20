"""
Domain models for the Scheduling bounded context.
"""

from django.db import models

from src.apps.core.models import ActivatableModel
from src.apps.patients.models import Patient
from src.apps.practitioners.models import Practitioner


class Slot(ActivatableModel):
    """
    Represents an available time slot for a practitioner.
    """

    practitioner = models.ForeignKey(
        Practitioner, on_delete=models.CASCADE, related_name="slots"
    )
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    is_booked = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Slot"
        verbose_name_plural = "Slots"
        ordering = ["start_time"]

    def __str__(self):
        return f"Slot for {self.practitioner} from {self.start_time} to {self.end_time}"


class Appointment(ActivatableModel):
    """
    Represents a scheduled appointment for a patient with a practitioner in a given slot.
    """

    patient = models.ForeignKey(
        Patient, on_delete=models.CASCADE, related_name="appointments"
    )
    practitioner = models.ForeignKey(
        Practitioner, on_delete=models.CASCADE, related_name="appointments"
    )
    slot = models.OneToOneField(
        Slot, on_delete=models.CASCADE, related_name="appointment"
    )
    status = models.CharField(
        max_length=50,
        choices=[
            ("booked", "Booked"),
            ("cancelled", "Cancelled"),
            ("completed", "Completed"),
        ],
        default="booked",
    )
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = "Appointment"
        verbose_name_plural = "Appointments"
        ordering = ["-slot__start_time"]

    def __str__(self):
        return f"Appointment for {self.patient} with {self.practitioner} at {self.slot.start_time}"
