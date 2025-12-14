"""
Integration Tests for Kafka Signals

Testing that Django signals properly publish Kafka events.
These tests verify the complete signal flow from model changes to Kafka events.
"""

from unittest.mock import MagicMock, patch

import pytest
from django.apps import apps

# Force signal registration
apps.get_app_config("patients").ready()

from src.apps.patients.models import Patient  # noqa: E402


@pytest.mark.django_db
class TestPatientSignals:
    """Test Patient signal handlers with comprehensive coverage"""

    def test_patient_created_publishes_event(self):
        """Test that creating a patient publishes PatientCreatedEvent"""
        with patch("src.apps.patients.signals.KafkaProducer") as MockProducer:
            mock_instance = MagicMock()
            MockProducer.get_instance.return_value = mock_instance

            # Create patient
            patient = Patient.objects.create(
                mrn="TEST001",
                given_name="John",
                family_name="Doe",
                birth_date="1990-01-01",
                sex="male",
                email="john.doe@example.com",
            )

            # Verify publish was called
            assert mock_instance.publish.called
            call_kwargs = mock_instance.publish.call_args.kwargs

            # Verify event type
            assert call_kwargs["event_type"] == "patient.created"

            # Verify partition key
            assert call_kwargs["key"] == str(patient.id)

            # Verify event data structure
            event_data = call_kwargs["data"]
            assert event_data["event_type"] == "patient.created"
            assert event_data["data"]["patient_id"] == patient.id
            assert event_data["data"]["mrn"] == "TEST001"
            assert event_data["data"]["given_name"] == "John"
            assert event_data["data"]["family_name"] == "Doe"
            assert event_data["data"]["email"] == "john.doe@example.com"
            assert "event_id" in event_data
            assert "timestamp" in event_data
            assert event_data["metadata"]["source"] == "healthcore-api"

    def test_patient_updated_publishes_event(self):
        """Test that updating a patient publishes PatientUpdatedEvent"""
        with patch("src.apps.patients.signals.KafkaProducer") as MockProducer:
            mock_instance = MagicMock()
            MockProducer.get_instance.return_value = mock_instance

            # Create patient
            patient = Patient.objects.create(
                mrn="TEST002",
                given_name="Jane",
                family_name="Smith",
                birth_date="1985-05-15",
                sex="female",
            )

            # Reset mock to ignore creation event
            mock_instance.reset_mock()

            # Update patient
            patient.given_name = "Janet"
            patient.email = "janet@example.com"
            patient.save()

            # Verify update event was published
            assert mock_instance.publish.called
            call_kwargs = mock_instance.publish.call_args.kwargs

            assert call_kwargs["event_type"] == "patient.updated"
            event_data = call_kwargs["data"]
            assert event_data["data"]["given_name"] == "Janet"
            assert event_data["data"]["email"] == "janet@example.com"

    def test_patient_deleted_publishes_event(self):
        """Test that deleting a patient publishes PatientDeletedEvent"""
        with patch("src.apps.patients.signals.KafkaProducer") as MockProducer:
            mock_instance = MagicMock()
            MockProducer.get_instance.return_value = mock_instance

            # Create patient
            patient = Patient.objects.create(
                mrn="TEST003",
                given_name="Bob",
                family_name="Johnson",
                birth_date="1975-12-25",
                sex="male",
            )

            patient_id = patient.id
            mock_instance.reset_mock()

            # Delete patient
            patient.delete()

            # Verify delete event was published
            assert mock_instance.publish.called
            call_kwargs = mock_instance.publish.call_args.kwargs

            assert call_kwargs["event_type"] == "patient.deleted"
            event_data = call_kwargs["data"]
            assert event_data["data"]["patient_id"] == patient_id

    def test_signal_handles_kafka_error_gracefully(self):
        """Test that signal handles Kafka errors without failing the request"""
        with patch("src.apps.patients.signals.KafkaProducer") as MockProducer:
            mock_instance = MagicMock()
            # Simulate Kafka failure
            mock_instance.publish.side_effect = Exception("Kafka connection error")
            MockProducer.get_instance.return_value = mock_instance

            # Should not raise exception even if Kafka fails
            patient = Patient.objects.create(
                mrn="TEST004",
                given_name="Alice",
                family_name="Williams",
                birth_date="1992-03-10",
                sex="female",
            )

            # Patient should still be created successfully
            assert patient.id is not None
            assert Patient.objects.filter(mrn="TEST004").exists()

    def test_patient_without_email_publishes_event(self):
        """Test that patient without email still publishes event with None"""
        with patch("src.apps.patients.signals.KafkaProducer") as MockProducer:
            mock_instance = MagicMock()
            MockProducer.get_instance.return_value = mock_instance

            # Create patient without email
            _ = Patient.objects.create(
                mrn="TEST005",
                given_name="Charlie",
                family_name="Brown",
                birth_date="1988-07-20",
                sex="male",
            )

            # Verify event was published
            assert mock_instance.publish.called
            call_kwargs = mock_instance.publish.call_args.kwargs
            event_data = call_kwargs["data"]

            # Email should be None in event data
            assert event_data["data"]["email"] is None

    def test_patient_with_date_object_publishes_event(self):
        """Test that patient with date object (not string) publishes correctly"""
        with patch("src.apps.patients.signals.KafkaProducer") as MockProducer:
            mock_instance = MagicMock()
            MockProducer.get_instance.return_value = mock_instance

            from datetime import date

            # Create patient with date object
            _ = Patient.objects.create(
                mrn="TEST006",
                given_name="David",
                family_name="Miller",
                birth_date=date(1995, 11, 30),
                sex="male",
            )

            # Verify event was published
            assert mock_instance.publish.called
            call_kwargs = mock_instance.publish.call_args.kwargs
            event_data = call_kwargs["data"]

            # birth_date should be serialized as ISO format string
            assert event_data["data"]["birth_date"] == "1995-11-30"

    def test_multiple_patients_publish_separate_events(self):
        """Test that creating multiple patients publishes separate events"""
        with patch("src.apps.patients.signals.KafkaProducer") as MockProducer:
            mock_instance = MagicMock()
            MockProducer.get_instance.return_value = mock_instance

            # Create multiple patients
            patient1 = Patient.objects.create(
                mrn="TEST007",
                given_name="Eve",
                family_name="Anderson",
                birth_date="1993-01-15",
                sex="female",
            )

            patient2 = Patient.objects.create(
                mrn="TEST008",
                given_name="Frank",
                family_name="Thomas",
                birth_date="1987-08-22",
                sex="male",
            )

            # Verify publish was called twice
            assert mock_instance.publish.call_count == 2

            # Verify different patient IDs
            calls = mock_instance.publish.call_args_list
            patient_ids = [call.kwargs["data"]["data"]["patient_id"] for call in calls]
            assert patient1.id in patient_ids
            assert patient2.id in patient_ids
