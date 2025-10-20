"""
Comprehensive test suite for the Scheduling bounded context.
"""

from datetime import timedelta

import pytest
from django.contrib.auth import get_user_model
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
    return APIClient()


@pytest.fixture
def test_user():
    return User.objects.create_user(username="testuser", password="password123")


@pytest.fixture
def authenticated_client(api_client, test_user):
    api_client.force_authenticate(user=test_user)
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
        url = "/api/v1/scheduling/appointments/"
        data = {"patient": str(patient.id), "slot": str(available_slot.id)}
        response = api_client.post(url, data=data, format="json")
        assert (
            response.status_code == 403
        )  # DRF returns 403 for unauthenticated requests with IsAuthenticated permission

    def test_create_appointment_with_booked_slot(
        self, authenticated_client, patient, available_slot
    ):
        # Book the slot via service first
        services.book_appointment(patient=patient, slot_id=available_slot.id)

        url = "/api/v1/scheduling/appointments/"
        data = {"patient": str(patient.id), "slot": str(available_slot.id)}
        response = authenticated_client.post(url, data=data, format="json")

        assert response.status_code == 400
        assert "no longer available" in response.data["detail"]

    def test_list_appointments(
        self, authenticated_client, patient, practitioner, available_slot
    ):
        services.book_appointment(patient=patient, slot_id=available_slot.id)
        url = "/api/v1/scheduling/appointments/"
        response = authenticated_client.get(url)
        assert response.status_code == 200
        assert len(response.data["results"]) == 1

    def test_retrieve_appointment(
        self, authenticated_client, patient, practitioner, available_slot
    ):
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
        appointment = services.book_appointment(
            patient=patient, slot_id=available_slot.id
        )
        assert appointment.is_active is True

        url = f"/api/v1/scheduling/appointments/{appointment.id}/"
        response = authenticated_client.delete(url)

        appointment.refresh_from_db()
        assert response.status_code == 204
        assert appointment.is_active is False
        assert Appointment.objects.active().count() == 0
