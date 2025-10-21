"""
Service layer for the Scheduling bounded context.
"""

from django.db import transaction

from . import repositories
from .models import Appointment, Patient, Slot


class SlotUnavailableError(Exception):
    pass


def get_slot_by_id(slot_id: str) -> Slot:
    """Retrieves an active, unbooked slot by its UUID."""
    slot = repositories.get_slot_by_id(slot_id)
    if not slot:
        raise SlotUnavailableError("The selected slot is no longer available.")
    return slot


def book_slot(slot: Slot) -> Slot:
    """Marks a slot as booked."""
    return repositories.book_slot(slot)


def create_appointment(**data) -> Appointment:
    """Creates a new appointment record."""
    return repositories.create_appointment(**data)


@transaction.atomic
def book_appointment(patient: Patient, slot_id: str) -> Appointment:
    """
    Orchestrates the business logic for booking an appointment.
    1. Finds an available slot.
    2. Marks the slot as booked.
    3. Creates the appointment record.
    This is wrapped in a transaction to ensure atomicity.
    """
    slot = get_slot_by_id(slot_id)

    # Mark slot as booked
    book_slot(slot)

    # Create the appointment
    appointment_data = {
        "patient": patient,
        "practitioner": slot.practitioner,
        "slot": slot,
    }
    appointment = create_appointment(**appointment_data)

    return appointment
