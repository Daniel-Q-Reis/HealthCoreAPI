"""
Comprehensive test suite for the Shifts & Availability bounded context.
"""

from datetime import timedelta

import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone
from faker import Faker
from rest_framework.test import APIClient

from src.apps.practitioners.models import Practitioner

from . import services
from .models import Shift

fake = Faker()
User = get_user_model()


@pytest.fixture
def test_user():
    return User.objects.create_user(username="testuser", password="password123")


@pytest.fixture
def authenticated_client():
    """
    Authenticated API client with Doctor role for RBAC compliance.
    Required since ShiftViewSet uses IsMedicalStaff permission.
    """
    from django.contrib.auth.models import Group

    api_client = APIClient()
    user = User.objects.create_user(username="doctor_test", password="password123")
    doctor_group, _ = Group.objects.get_or_create(name="Doctors")
    user.groups.add(doctor_group)
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def practitioner():
    return Practitioner.objects.create(
        license_number=fake.unique.numerify(text="LIC-%%%%%%"),
        given_name=fake.first_name(),
        family_name=fake.last_name(),
        role="Nurse",
    )


@pytest.fixture
def shift_data(practitioner):
    start = timezone.now() + timedelta(hours=1)
    end = start + timedelta(hours=8)
    return {
        "practitioner_id": practitioner.id,
        "start_time": start.isoformat(),
        "end_time": end.isoformat(),
        "role": "Ward Duty",
    }


@pytest.mark.django_db
class TestShiftsService:
    def test_create_shift_success(self, shift_data):
        shift = services.create_shift_for_practitioner(**shift_data)
        assert shift is not None
        assert Shift.objects.count() == 1
        assert shift.role == shift_data["role"]

    def test_create_shift_for_nonexistent_practitioner(self, shift_data):
        shift_data["practitioner_id"] = 999999  # Nonexistent ID
        with pytest.raises(
            services.ServiceValidationError, match="Practitioner not found"
        ):
            services.create_shift_for_practitioner(**shift_data)


@pytest.mark.django_db
class TestShiftsAPI:
    def test_create_shift_api_success(
        self, authenticated_client, practitioner, shift_data
    ):
        url = "/api/v1/staff/shifts/"
        response = authenticated_client.post(url, data=shift_data, format="json")

        assert response.status_code == 201
        assert Shift.objects.count() == 1
        assert response.data["role"] == shift_data["role"]

    def test_create_shift_invalid_times(
        self, authenticated_client, practitioner, shift_data
    ):
        # Set end time before start time
        start_time = timezone.now() + timedelta(hours=1)
        invalid_end_time = start_time - timedelta(hours=1)
        shift_data["end_time"] = invalid_end_time.isoformat()
        url = "/api/v1/staff/shifts/"
        response = authenticated_client.post(url, data=shift_data, format="json")
        assert response.status_code == 400
        assert "End time must be after start time" in str(response.data)

    def test_list_shifts_authenticated(
        self, authenticated_client, practitioner, shift_data
    ):
        services.create_shift_for_practitioner(**shift_data)
        url = "/api/v1/staff/shifts/"
        response = authenticated_client.get(url)
        assert response.status_code == 200
        assert len(response.data["results"]) == 1
