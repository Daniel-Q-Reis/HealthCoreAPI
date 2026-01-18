"""
Tests for scheduling Celery tasks.

This module tests the three automated scheduling tasks:
- send_appointment_reminders
- auto_complete_past_appointments
- generate_future_slots
"""

from datetime import timedelta
from unittest.mock import patch

import pytest
from django.contrib.auth.models import Group
from django.utils import timezone

from src.apps.patients.models import Patient
from src.apps.practitioners.models import Practitioner
from src.apps.scheduling.models import Appointment, Slot
from src.apps.scheduling.tasks import (
    auto_complete_past_appointments,
    generate_future_slots,
    send_appointment_reminders,
)


@pytest.fixture
def patient() -> Patient:
    """Create a test patient."""
    return Patient.objects.create(
        mrn="TEST-12345",
        given_name="John",
        family_name="Doe",
        birth_date="1990-01-01",
        sex="male",
        phone_number="+1234567890",
        email="john.doe@test.com",
        blood_type="O+",
    )


@pytest.fixture
def practitioner() -> Practitioner:
    """Create a test practitioner (doctor)."""
    practitioners_group, _ = Group.objects.get_or_create(name="Doctors")
    return Practitioner.objects.create(
        license_number="MD-TEST-001",
        given_name="Jane",
        family_name="Smith",
        role="doctor",
        specialty="General Medicine",
    )


@pytest.mark.django_db
class TestAppointmentReminderTask:
    """Tests for send_appointment_reminders task."""

    def test_sends_reminders_for_upcoming_appointments(
        self, patient: Patient, practitioner: Practitioner
    ) -> None:
        """Test that reminders are logged for appointments in next 24 hours."""
        now = timezone.now()
        tomorrow = now + timedelta(hours=12)

        # Create slot and appointment for tomorrow
        slot = Slot.objects.create(
            practitioner=practitioner,
            start_time=tomorrow,
            end_time=tomorrow + timedelta(minutes=30),
            is_booked=True,
        )
        Appointment.objects.create(
            slot=slot,
            patient=patient,
            practitioner=practitioner,
            status="booked",
            notes="Test appointment",
        )

        # Run task
        with patch("src.apps.scheduling.tasks.logger") as mock_logger:
            send_appointment_reminders()

            # Verify reminder was logged
            assert mock_logger.info.call_count >= 1
            logged_messages = [
                str(call.args[0]) for call in mock_logger.info.call_args_list
            ]
            assert any("REMINDER" in msg for msg in logged_messages)

    def test_ignores_appointments_beyond_24_hours(
        self, patient: Patient, practitioner: Practitioner
    ) -> None:
        """Test that appointments beyond 24 hours are not included."""
        now = timezone.now()
        future_date = now + timedelta(hours=48)

        # Create slot and appointment 48 hours in future
        slot = Slot.objects.create(
            practitioner=practitioner,
            start_time=future_date,
            end_time=future_date + timedelta(minutes=30),
            is_booked=True,
        )
        Appointment.objects.create(
            slot=slot,
            patient=patient,
            practitioner=practitioner,
            status="booked",
            notes="Future appointment",
        )

        # Run task
        with patch("src.apps.scheduling.tasks.logger") as mock_logger:
            send_appointment_reminders()

            # Verify no REMINDER messages for this appointment
            logged_messages = [
                str(call.args[0]) for call in mock_logger.info.call_args_list
            ]
            reminder_messages = [msg for msg in logged_messages if "REMINDER" in msg]
            assert len(reminder_messages) == 0

    def test_ignores_completed_appointments(
        self, patient: Patient, practitioner: Practitioner
    ) -> None:
        """Test that completed appointments are not included in reminders."""
        now = timezone.now()
        tomorrow = now + timedelta(hours=12)

        # Create completed appointment
        slot = Slot.objects.create(
            practitioner=practitioner,
            start_time=tomorrow,
            end_time=tomorrow + timedelta(minutes=30),
            is_booked=True,
        )
        Appointment.objects.create(
            slot=slot,
            patient=patient,
            practitioner=practitioner,
            status="completed",  # Already completed
            notes="Completed appointment",
        )

        # Run task
        with patch("src.apps.scheduling.tasks.logger") as mock_logger:
            send_appointment_reminders()

            # Verify no reminders for completed appointments
            logged_messages = [
                str(call.args[0]) for call in mock_logger.info.call_args_list
            ]
            reminder_messages = [msg for msg in logged_messages if "REMINDER" in msg]
            assert len(reminder_messages) == 0


@pytest.mark.django_db
class TestAutoCompletePastAppointmentsTask:
    """Tests for auto_complete_past_appointments task."""

    def test_completes_past_booked_appointments(
        self, patient: Patient, practitioner: Practitioner
    ) -> None:
        """Test that past booked appointments are marked as completed."""
        now = timezone.now()
        past_time = now - timedelta(hours=2)

        # Create slot and appointment in the past
        slot = Slot.objects.create(
            practitioner=practitioner,
            start_time=past_time,
            end_time=past_time + timedelta(minutes=30),
            is_booked=True,
        )
        appointment = Appointment.objects.create(
            slot=slot,
            patient=patient,
            practitioner=practitioner,
            status="booked",
            notes="Past appointment",
        )

        # Run task
        auto_complete_past_appointments()

        # Verify status updated
        appointment.refresh_from_db()
        assert appointment.status == "completed"

    def test_ignores_future_appointments(
        self, patient: Patient, practitioner: Practitioner
    ) -> None:
        """Test that future appointments are not auto-completed."""
        now = timezone.now()
        future_time = now + timedelta(hours=2)

        # Create future appointment
        slot = Slot.objects.create(
            practitioner=practitioner,
            start_time=future_time,
            end_time=future_time + timedelta(minutes=30),
            is_booked=True,
        )
        appointment = Appointment.objects.create(
            slot=slot,
            patient=patient,
            practitioner=practitioner,
            status="booked",
            notes="Future appointment",
        )

        # Run task
        auto_complete_past_appointments()

        # Verify status NOT updated
        appointment.refresh_from_db()
        assert appointment.status == "booked"

    def test_ignores_already_completed_appointments(
        self, patient: Patient, practitioner: Practitioner
    ) -> None:
        """Test that already completed appointments are not updated again."""
        now = timezone.now()
        past_time = now - timedelta(hours=2)

        # Create already completed appointment
        slot = Slot.objects.create(
            practitioner=practitioner,
            start_time=past_time,
            end_time=past_time + timedelta(minutes=30),
            is_booked=True,
        )
        appointment = Appointment.objects.create(
            slot=slot,
            patient=patient,
            practitioner=practitioner,
            status="completed",  # Already completed
            notes="Already completed",
        )

        # Run task
        with patch("src.apps.scheduling.tasks.logger") as mock_logger:
            auto_complete_past_appointments()

            # Verify task logged 0 updates
            logged_messages = [
                str(call.args[0]) for call in mock_logger.info.call_args_list
            ]
            assert any("Updated 0 appointments" in msg for msg in logged_messages)

        # Verify status unchanged
        appointment.refresh_from_db()
        assert appointment.status == "completed"


@pytest.mark.django_db
class TestGenerateFutureSlotsTask:
    """Tests for generate_future_slots task."""

    def test_generates_slots_for_doctors(self, practitioner: Practitioner) -> None:
        """Test that slots are created for doctors for next 14 days."""
        # Ensure practitioner is a doctor
        practitioner.role = "doctor"
        practitioner.save()

        initial_count = Slot.objects.count()

        # Run task
        generate_future_slots()

        # Verify slots were created
        new_count = Slot.objects.count()
        assert new_count > initial_count

        # Verify slots belong to the doctor
        doctor_slots = Slot.objects.filter(practitioner=practitioner)
        assert doctor_slots.exists()

    def test_slot_generation_is_idempotent(self, practitioner: Practitioner) -> None:
        """Test that running task multiple times doesn't duplicate slots."""
        practitioner.role = "doctor"
        practitioner.save()

        # Run task twice
        generate_future_slots()
        count_after_first_run = Slot.objects.count()

        generate_future_slots()
        count_after_second_run = Slot.objects.count()

        # Verify no additional slots created (idempotent)
        assert count_after_first_run == count_after_second_run

    def test_creates_correct_slot_duration(self, practitioner: Practitioner) -> None:
        """Test that generated slots are 30 minutes long."""
        practitioner.role = "doctor"
        practitioner.save()

        # Run task
        generate_future_slots()

        # Check first slot duration
        slot = Slot.objects.filter(practitioner=practitioner).first()
        assert slot is not None
        duration = slot.end_time - slot.start_time
        assert duration == timedelta(minutes=30)

    def test_skips_slot_generation_when_no_doctors(self) -> None:
        """Test that task handles case when no doctors exist."""
        # Ensure no doctors in database
        Practitioner.objects.filter(role="doctor").delete()

        # Run task
        with patch("src.apps.scheduling.tasks.logger") as mock_logger:
            generate_future_slots()

            # Verify warning logged
            mock_logger.warning.assert_called_once()
            assert "No doctors found" in str(mock_logger.warning.call_args)

    def test_slots_generated_within_business_hours(
        self, practitioner: Practitioner
    ) -> None:
        """Test that slots are only created during business hours (8 AM - 5 PM)."""
        practitioner.role = "doctor"
        practitioner.save()

        # Run task
        generate_future_slots()

        # Verify all slots are within business hours
        slots = Slot.objects.filter(practitioner=practitioner)
        for slot in slots:
            start_hour = slot.start_time.hour
            assert 8 <= start_hour < 17  # 8 AM to 5 PM (last slot starts at 4:30 PM)
