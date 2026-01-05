"""
Comprehensive test suite for the Scheduling bounded context.
"""

import uuid
from datetime import timedelta

import pytest
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.utils import timezone
from faker import Faker
from rest_framework.test import APIClient

from src.apps.patients.models import Patient
from src.apps.practitioners.models import Practitioner

from . import services
from .models import Appointment, Slot

fake = Faker()
User = get_user_model()


@pytest.fixture
def api_client():
    """Base API client without authentication."""
    return APIClient()


@pytest.fixture
def doctor_user():
    """Create a doctor user with Doctor group for RBAC."""
    user = User.objects.create_user(username="doctor_sched", password="pass123")
    doctor_group, _ = Group.objects.get_or_create(name="Doctors")
    user.groups.add(doctor_group)
    return user


@pytest.fixture
def test_user():
    """Creates a standard test user (deprecated - use doctor_user for RBAC tests)."""
    return User.objects.create_user(username="testuser", password="password123")


@pytest.fixture
def authenticated_client(api_client, doctor_user):
    """Provides an API client authenticated with a doctor user (RBAC-compliant)."""
    api_client.force_authenticate(user=doctor_user)
    return api_client


@pytest.fixture
def patient():
    return Patient.objects.create(
        mrn=fake.unique.numerify(text="MRN-#######"),
        given_name=fake.first_name(),
        family_name=fake.last_name(),
        birth_date=fake.date_of_birth(minimum_age=20, maximum_age=80),
        sex="female",
    )


@pytest.fixture
def practitioner():
    return Practitioner.objects.create(
        license_number=fake.unique.numerify(text="LIC-%%%%%%"),
        given_name=fake.first_name(),
        family_name=fake.last_name(),
        role="Physician",
    )


@pytest.fixture
def available_slot(practitioner):
    start = timezone.now() + timedelta(days=1)
    return Slot.objects.create(
        practitioner=practitioner,
        start_time=start,
        end_time=start + timedelta(minutes=30),
    )


@pytest.mark.django_db
class TestSchedulingModels:
    def test_slot_creation(self, practitioner):
        start = timezone.now() + timedelta(days=1)
        end = start + timedelta(minutes=30)
        slot = Slot.objects.create(
            practitioner=practitioner, start_time=start, end_time=end
        )
        assert Slot.objects.count() == 1
        assert str(slot) == f"Slot for {practitioner} from {start} to {end}"

    def test_appointment_creation(self, patient, practitioner, available_slot):
        appointment = Appointment.objects.create(
            patient=patient, practitioner=practitioner, slot=available_slot
        )
        assert Appointment.objects.count() == 1
        assert (
            str(appointment)
            == f"Appointment for {patient} with {practitioner} at {available_slot.start_time}"
        )


@pytest.mark.django_db
class TestSchedulingService:
    def test_book_appointment_success(self, patient, available_slot):
        appointment = services.book_appointment(
            patient=patient, slot_id=available_slot.id
        )
        available_slot.refresh_from_db()

        assert appointment is not None
        assert appointment.patient == patient
        assert appointment.slot == available_slot
        assert available_slot.is_booked is True

    def test_book_unavailable_slot_raises_error(self, patient, available_slot):
        # Book the slot once
        services.book_appointment(patient=patient, slot_id=available_slot.id)

        # Try to book it again
        with pytest.raises(services.SlotUnavailableError):
            services.book_appointment(patient=patient, slot_id=available_slot.id)


@pytest.mark.django_db
class TestSchedulingAPI:
    def test_create_appointment_api_success(
        self, authenticated_client, patient, available_slot
    ):
        """Verify authenticated doctor can create appointment."""
        url = "/api/v1/scheduling/appointments/"
        data = {"patient": str(patient.id), "slot": str(available_slot.id)}
        response = authenticated_client.post(url, data=data, format="json")

        available_slot.refresh_from_db()

        assert response.status_code == 201
        assert response.data["patient"]["id"] == patient.id
        assert response.data["slot"]["id"] == available_slot.id
        assert available_slot.is_booked is True

    def test_create_appointment_unauthenticated(
        self, api_client, patient, available_slot
    ):
        """Verify unauthenticated users cannot create appointments."""
        url = "/api/v1/scheduling/appointments/"
        data = {"patient": str(patient.id), "slot": str(available_slot.id)}
        response = api_client.post(url, data=data, format="json")
        # DRF returns 403 for unauthenticated requests with IsAuthenticated permission
        assert response.status_code == 403

    def test_create_appointment_with_booked_slot(
        self, authenticated_client, patient, practitioner
    ):
        """Verify double-booking prevention."""
        # Create a fresh slot specifically for this test to avoid IntegrityError overlaps
        start = timezone.now() + timedelta(days=2)  # Distinct from fixture
        slot = Slot.objects.create(
            practitioner=practitioner,
            start_time=start,
            end_time=start + timedelta(minutes=30),
        )

        # Book the slot via service first
        services.book_appointment(patient=patient, slot_id=slot.id)

        url = "/api/v1/scheduling/appointments/"
        data = {"patient": str(patient.id), "slot": str(slot.id)}
        response = authenticated_client.post(url, data=data, format="json")

        assert response.status_code == 400
        assert "no longer available" in response.data["detail"]

    def test_list_appointments(
        self, authenticated_client, patient, practitioner, available_slot
    ):
        """Verify authenticated medical staff can list appointments."""
        services.book_appointment(patient=patient, slot_id=available_slot.id)
        url = "/api/v1/scheduling/appointments/"
        response = authenticated_client.get(url)
        assert response.status_code == 200
        assert len(response.data["results"]) == 1

    def test_retrieve_appointment(
        self, authenticated_client, patient, practitioner, available_slot
    ):
        """Verify authenticated medical staff can retrieve appointment details."""
        appointment = services.book_appointment(
            patient=patient, slot_id=available_slot.id
        )
        url = f"/api/v1/scheduling/appointments/{appointment.id}/"
        response = authenticated_client.get(url)
        assert response.status_code == 200
        assert response.data["patient"]["id"] == patient.id
        assert response.data["slot"]["id"] == available_slot.id

    def test_soft_delete_appointment(
        self, authenticated_client, patient, practitioner, available_slot
    ):
        """Verify authenticated doctor can soft-delete appointments."""
        appointment = services.book_appointment(
            patient=patient, slot_id=available_slot.id
        )
        assert appointment.is_active is True

        url = f"/api/v1/scheduling/appointments/{appointment.id}/"
        response = authenticated_client.delete(url)

        # Use filter().first() to avoid DoesNotExist if default manager hides it
        updated_appointment = Appointment.objects.filter(id=appointment.id).first()

        assert response.status_code == 204
        if updated_appointment:
            assert updated_appointment.is_active is False

        # Verify it's gone from standard active queryset
        assert Appointment.objects.active().filter(id=appointment.id).exists() is False


@pytest.mark.django_db
class TestIdempotency:
    def test_duplicate_appointment_creation_is_prevented(
        self, authenticated_client, patient, practitioner
    ):
        """
        Verify that sending the same POST request with the same Idempotency-Key
        only creates one object and returns the original response.
        """
        # Fresh slot
        start = timezone.now() + timedelta(days=3)
        slot = Slot.objects.create(
            practitioner=practitioner,
            start_time=start,
            end_time=start + timedelta(minutes=30),
        )

        url = "/api/v1/scheduling/appointments/"
        idempotency_key = str(uuid.uuid4())
        data = {"patient": str(patient.id), "slot": str(slot.id)}

        # First request: should create the appointment
        response1 = authenticated_client.post(
            url, data=data, format="json", HTTP_IDEMPOTENCY_KEY=idempotency_key
        )

        assert response1.status_code == 201
        assert Appointment.objects.count() == 1

        # Second request: should not create a new appointment and return the same result
        response2 = authenticated_client.post(
            url, data=data, format="json", HTTP_IDEMPOTENCY_KEY=idempotency_key
        )

        assert response2.status_code == 201
        assert Appointment.objects.count() == 1  # Still 1

        # The body of the responses should be identical
        assert response1.json()["id"] == response2.json()["id"]
