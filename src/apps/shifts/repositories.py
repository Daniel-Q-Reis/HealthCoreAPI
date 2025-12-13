"""
Data access layer for the Shifts & Availability bounded context.
"""

from typing import Any

from .models import Shift


def create_shift(**data: Any) -> Shift:
    """Creates a new Shift record."""
    return Shift.objects.create(**data)
