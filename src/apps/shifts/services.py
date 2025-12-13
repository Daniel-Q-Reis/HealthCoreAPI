"""
Service layer for the Shifts & Availability bounded context.
"""

from typing import Any

from src.apps.practitioners.repositories import get_practitioner_by_id

from . import repositories
from .models import Shift


class ServiceValidationError(Exception):
    pass


def create_shift_for_practitioner(**data: Any) -> Shift:
    """
    Orchestrates the creation of a new shift.
    """
    practitioner_id = data.get("practitioner_id")
    if practitioner_id is None:
        raise ServiceValidationError("Practitioner ID is required.")

    practitioner = get_practitioner_by_id(practitioner_id)
    if not practitioner:
        raise ServiceValidationError("Practitioner not found.")

    data["practitioner"] = practitioner
    del data["practitioner_id"]

    return repositories.create_shift(**data)
