"""
Tests for Event Classes
"""

from src.apps.core.events import BaseEvent
from src.apps.patients.events import (
    PatientCreatedEvent,
    PatientDeletedEvent,
    PatientUpdatedEvent,
)
from src.apps.scheduling.events import (
    AppointmentBookedEvent,
    AppointmentCancelledEvent,
    AppointmentCompletedEvent,
)


class TestBaseEvent:
    """Test BaseEvent class"""

    def test_base_event_creation(self):
        """Test creating a base event"""
        event = BaseEvent(event_type="test.event", data={"key": "value"})

        assert event.event_type == "test.event"
        assert event.data == {"key": "value"}
        assert event.event_id is not None
        assert event.timestamp is not None
        assert event.metadata["source"] == "healthcore-api"
        assert event.metadata["version"] == "1.0"

    def test_event_id_is_unique(self):
        """Test that each event gets a unique ID"""
        event1 = BaseEvent(event_type="test", data={})
        event2 = BaseEvent(event_type="test", data={})

        assert event1.event_id != event2.event_id

    def test_to_dict(self):
        """Test converting event to dictionary"""
        event = BaseEvent(event_type="test.event", data={"patient_id": 123})

        event_dict = event.to_dict()

        assert event_dict["event_type"] == "test.event"
        assert event_dict["data"] == {"patient_id": 123}
        assert "event_id" in event_dict
        assert "timestamp" in event_dict
        assert "metadata" in event_dict

    def test_to_json_serializable(self):
        """Test converting event to JSON-serializable format"""
        event = BaseEvent(event_type="test.event", data={"key": "value"})

        json_data = event.to_json_serializable()

        assert isinstance(json_data, dict)
        assert json_data["event_type"] == "test.event"


class TestPatientEvents:
    """Test Patient domain events"""

    def test_patient_created_event(self):
        """Test PatientCreatedEvent"""
        event = PatientCreatedEvent(
            patient_id=123,
            patient_data={"name": "John Doe", "email": "john@example.com"},
        )

        assert event.event_type == "patient.created"
        assert event.data["patient_id"] == 123
        assert event.data["name"] == "John Doe"
        assert event.data["email"] == "john@example.com"

    def test_patient_updated_event(self):
        """Test PatientUpdatedEvent"""
        event = PatientUpdatedEvent(patient_id=456, patient_data={"name": "Jane Doe"})

        assert event.event_type == "patient.updated"
        assert event.data["patient_id"] == 456
        assert event.data["name"] == "Jane Doe"

    def test_patient_deleted_event(self):
        """Test PatientDeletedEvent"""
        event = PatientDeletedEvent(patient_id=789)

        assert event.event_type == "patient.deleted"
        assert event.data["patient_id"] == 789


class TestAppointmentEvents:
    """Test Appointment domain events"""

    def test_appointment_booked_event(self):
        """Test AppointmentBookedEvent"""
        event = AppointmentBookedEvent(
            appointment_id=123,
            appointment_data={
                "patient_id": 456,
                "practitioner_id": 789,
                "scheduled_time": "2025-12-20T10:00:00Z",
            },
        )

        assert event.event_type == "appointment.booked"
        assert event.data["appointment_id"] == 123
        assert event.data["patient_id"] == 456
        assert event.data["practitioner_id"] == 789

    def test_appointment_cancelled_event(self):
        """Test AppointmentCancelledEvent"""
        event = AppointmentCancelledEvent(appointment_id=123, reason="Patient request")

        assert event.event_type == "appointment.cancelled"
        assert event.data["appointment_id"] == 123
        assert event.data["reason"] == "Patient request"

    def test_appointment_completed_event(self):
        """Test AppointmentCompletedEvent"""
        event = AppointmentCompletedEvent(
            appointment_id=123, appointment_data={"status": "completed"}
        )

        assert event.event_type == "appointment.completed"
        assert event.data["appointment_id"] == 123
        assert event.data["status"] == "completed"
