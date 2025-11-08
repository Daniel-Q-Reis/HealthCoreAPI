"""
Data access layer for the Scheduling bounded context.
"""

from typing import Optional

from .models import Appointment, Slot


def get_slot_by_id(slot_id: str) -> Optional[Slot]:
    """
    Retrieves an active slot by its UUID.

    Note: Does NOT filter by is_booked to allow validation in service layer.
    Service layer is responsible for checking availability.
    """
    try:
        return Slot.objects.get(id=slot_id, is_active=True)
    except Slot.DoesNotExist:
        return None


def book_slot(slot: Slot) -> Slot:
    """Marks a slot as booked."""
    slot.is_booked = True
    slot.save(update_fields=["is_booked", "updated_at"])
    return slot


def create_appointment(**data) -> Appointment:
    """Creates a new appointment record."""
    return Appointment.objects.create(**data)
