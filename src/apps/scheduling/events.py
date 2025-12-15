"""
Scheduling Domain Events

Events published when appointment-related actions occur.
"""

from typing import Any

from src.apps.core.events import BaseEvent


class AppointmentBookedEvent(BaseEvent):
    """Event published when an appointment is booked"""

    def __init__(self, appointment_id: int, appointment_data: dict[str, Any]):
        super().__init__(
            event_type="appointment.booked",
            data={"appointment_id": appointment_id, **appointment_data},
        )


class AppointmentCancelledEvent(BaseEvent):
    """Event published when an appointment is cancelled"""

    def __init__(self, appointment_id: int, reason: str = ""):
        super().__init__(
            event_type="appointment.cancelled",
            data={"appointment_id": appointment_id, "reason": reason},
        )


class AppointmentCompletedEvent(BaseEvent):
    """Event published when an appointment is completed"""

    def __init__(self, appointment_id: int, appointment_data: dict[str, Any]):
        super().__init__(
            event_type="appointment.completed",
            data={"appointment_id": appointment_id, **appointment_data},
        )
