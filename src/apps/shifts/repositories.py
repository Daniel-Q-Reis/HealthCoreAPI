"""
Data access layer for the Shifts & Availability bounded context.
"""

from .models import Shift


def create_shift(**data) -> Shift:
    """Creates a new Shift record."""
    return Shift.objects.create(**data)
