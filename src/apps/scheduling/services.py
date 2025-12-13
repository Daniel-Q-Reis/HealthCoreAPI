"""
Service layer for the Scheduling bounded context.
"""

from typing import Any

from django.db import transaction

from src.apps.patients.models import Patient

from . import repositories
from .models import Appointment, Slot


class SlotUnavailableError(Exception):
    """Raised when attempting to book a slot that is not available."""

    pass


def get_slot_by_id(slot_id: str) -> Slot:
    """
    Retrieves an active slot by its UUID and validates availability.

    Raises:
        SlotUnavailableError: If slot doesn't exist or is already booked.
    """
    slot = repositories.get_slot_by_id(slot_id)
    if not slot:
        raise SlotUnavailableError(
            "The selected slot does not exist or is no longer active."
        )
    if slot.is_booked:
        raise SlotUnavailableError("The selected slot is no longer available.")
    return slot


def book_slot(slot: Slot) -> Slot:
    """Marks a slot as booked."""
    return repositories.book_slot(slot)


def create_appointment(**data: Any) -> Appointment:
    """Creates a new appointment record."""
    return repositories.create_appointment(**data)


@transaction.atomic
def book_appointment(patient: Patient, slot_id: str) -> Appointment:
    """
    Orchestrates the business logic for booking an appointment.

    1. Finds an available slot (raises SlotUnavailableError if not available)
    2. Marks the slot as booked
    3. Creates the appointment record with practitioner from slot

    This is wrapped in a transaction to ensure atomicity.

    Args:
        patient: Patient instance
        slot_id: UUID of the slot to book

    Returns:
        Created Appointment instance

    Raises:
        SlotUnavailableError: If slot is not available
    """
    # Validate and get available slot (raises exception if unavailable)
    slot = get_slot_by_id(slot_id)

    # Mark slot as booked
    book_slot(slot)

    # Create the appointment with practitioner from slot
    appointment_data = {
        "patient": patient,
        "practitioner": slot.practitioner,
        "slot": slot,
    }
    appointment = create_appointment(**appointment_data)

    return appointment
