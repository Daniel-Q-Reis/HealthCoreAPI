"""
Domain models for the Shifts & Availability bounded context.
"""

from django.db import models

from src.apps.core.models import ActivatableModel
from src.apps.practitioners.models import Practitioner


class Shift(ActivatableModel):
    """
    Represents a work shift for practitioners.
    """

    practitioner = models.ForeignKey(
        Practitioner, on_delete=models.CASCADE, related_name="shifts"
    )
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    role = models.CharField(
        max_length=100, help_text="Role during the shift, e.g., 'On-Call', 'Ward Duty'"
    )

    class Meta:
        verbose_name = "Shift"
        verbose_name_plural = "Shifts"
        ordering = ["start_time"]
        constraints = [
            models.CheckConstraint(
                check=models.Q(end_time__gt=models.F("start_time")),
                name="end_time_after_start_time",
            )
        ]

    def __str__(self):
        return f"Shift for {self.practitioner} from {self.start_time.strftime('%Y-%m-%d %H:%M')} to {self.end_time.strftime('%H:%M')}"
