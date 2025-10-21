"""
Comprehensive test suite for the Admissions & Beds bounded context.
"""

import pytest
from django.contrib.auth import get_user_model
from faker import Faker
from rest_framework.test import APIClient

from src.apps.patients.models import Patient

from . import services
from .models import Bed, Ward

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
        birth_date=fake.date_of_birth(minimum_age=30, maximum_age=70),
        sex="male",
    )


@pytest.fixture
def ward():
    return Ward.objects.create(name="General Ward", capacity=10)


@pytest.fixture
def available_bed(ward):
    return Bed.objects.create(ward=ward, bed_number="101-A")


@pytest.mark.django_db
class TestAdmissionsService:
    def test_admit_patient_success(self, patient, available_bed):
        admission = services.admit_patient_to_ward(
            patient_id=patient.id, ward_id=available_bed.ward.id
        )
        available_bed.refresh_from_db()

        assert admission is not None
        assert admission.patient == patient
        assert admission.bed == available_bed
        assert available_bed.is_occupied is True

    def test_admit_patient_no_available_beds(self, patient, ward):
        # No beds created in this ward
        with pytest.raises(services.BedUnavailableError):
            services.admit_patient_to_ward(patient_id=patient.id, ward_id=ward.id)


@pytest.mark.django_db
class TestAdmissionsAPI:
    def test_create_admission_api_success(
        self, authenticated_client, patient, available_bed
    ):
        url = "/api/v1/admissions/admissions/"
        data = {"patient_id": str(patient.id), "ward_id": str(available_bed.ward.id)}
        response = authenticated_client.post(url, data=data, format="json")

        available_bed.refresh_from_db()

        assert response.status_code == 201
        assert response.data["patient"] == patient.id
        assert response.data["bed"]["id"] == available_bed.id
        assert available_bed.is_occupied is True

    def test_create_admission_unauthenticated(self, api_client, patient, ward):
        url = "/api/v1/admissions/admissions/"
        data = {"patient_id": str(patient.id), "ward_id": str(ward.id)}
        response = api_client.post(url, data=data, format="json")
        # Can be either 401 (unauthorized) or 403 (forbidden) depending on authentication settings
        assert response.status_code in [401, 403]

    def test_list_wards_authenticated(self, authenticated_client, ward):
        url = "/api/v1/admissions/wards/"
        response = authenticated_client.get(url)
        assert response.status_code == 200
        assert len(response.data["results"]) == 1
