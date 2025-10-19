"""
Comprehensive test suite for the Patients bounded context.
Covers models, repositories, services, and API endpoints.
"""

import pytest
from faker import Faker
from rest_framework.test import APIClient

from . import services
from .models import Patient

fake = Faker()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def patient_data():
    """Generates valid data for creating a patient."""
    return {
        "mrn": fake.unique.numerify(text="MRN-#######"),
        "given_name": fake.first_name(),
        "family_name": fake.last_name(),
        "birth_date": fake.date_of_birth(minimum_age=1, maximum_age=90).isoformat(),
        "sex": "male",
    }


@pytest.mark.django_db
class TestPatientModel:
    def test_patient_creation(self, patient_data):
        patient = Patient.objects.create(**patient_data)
        assert Patient.objects.count() == 1
        assert (
            str(patient)
            == f"{patient_data['family_name']}, {patient_data['given_name']} (MRN: {patient_data['mrn']})"
        )


@pytest.mark.django_db
class TestPatientService:
    def test_register_new_patient_service(self, patient_data):
        patient = services.register_new_patient(**patient_data)
        assert patient is not None
        assert patient.mrn == patient_data["mrn"]
        assert Patient.objects.count() == 1


@pytest.mark.django_db
class TestPatientAPI:
    def test_create_patient_api(self, api_client, patient_data):
        url = "/api/v1/patients/"
        response = api_client.post(url, data=patient_data, format="json")
        assert response.status_code == 201
        assert Patient.objects.count() == 1
        assert Patient.objects.first().mrn == patient_data["mrn"]

    def test_list_patients(self, api_client, patient_data):
        services.register_new_patient(**patient_data)
        url = "/api/v1/patients/"
        response = api_client.get(url)
        assert response.status_code == 200
        assert len(response.data["results"]) == 1

    def test_retrieve_patient(self, api_client, patient_data):
        patient = services.register_new_patient(**patient_data)
        url = f"/api/v1/patients/{patient.id}/"
        response = api_client.get(url)
        assert response.status_code == 200
        assert response.data["mrn"] == patient.mrn

    def test_soft_delete_patient(self, api_client, patient_data):
        patient = services.register_new_patient(**patient_data)
        assert patient.is_active is True

        url = f"/api/v1/patients/{patient.id}/"
        response = api_client.delete(url)

        patient.refresh_from_db()
        assert response.status_code == 204
        assert patient.is_active is False
        assert Patient.objects.active().count() == 0
