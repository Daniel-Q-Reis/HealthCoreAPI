"""
Patient Domain Events

Events published when patient-related actions occur.
"""

from typing import Any

from src.apps.core.events import BaseEvent


class PatientCreatedEvent(BaseEvent):
    """Event published when a patient is created"""

    def __init__(self, patient_id: int, patient_data: dict[str, Any]):
        super().__init__(
            event_type="patient.created",
            data={"patient_id": patient_id, **patient_data},
        )


class PatientUpdatedEvent(BaseEvent):
    """Event published when a patient is updated"""

    def __init__(self, patient_id: int, patient_data: dict[str, Any]):
        super().__init__(
            event_type="patient.updated",
            data={"patient_id": patient_id, **patient_data},
        )


class PatientDeletedEvent(BaseEvent):
    """Event published when a patient is deleted"""

    def __init__(self, patient_id: int):
        super().__init__(event_type="patient.deleted", data={"patient_id": patient_id})
