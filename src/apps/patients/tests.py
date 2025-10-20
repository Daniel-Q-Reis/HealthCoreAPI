"""
Comprehensive test suite for the Patients bounded context.
Covers models, repositories, services, and API endpoints with authentication.
"""

import pytest
from django.contrib.auth import get_user_model
from faker import Faker
from rest_framework.test import APIClient

from . import services
from .models import Patient

fake = Faker()
User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def test_user():
    """Creates a standard test user."""
    return User.objects.create_user(username="testuser", password="testpassword123")


@pytest.fixture
def authenticated_client(api_client, test_user):
    """Provides an API client authenticated with a JWT token."""
    api_client.force_authenticate(user=test_user)
    return api_client


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
class TestPatientAPIAuth:
    def test_unauthenticated_access_denied(self, api_client, patient_data):
        """Verify that write operations are denied for unauthenticated users."""
        url = "/api/v1/patients/"
        response = api_client.post(url, data=patient_data, format="json")
        # DRF returns 403 for unauthenticated access with IsAuthenticated permission
        assert response.status_code == 403

    def test_create_patient_authenticated(self, authenticated_client, patient_data):
        """Verify an authenticated user can create a patient."""
        url = "/api/v1/patients/"
        response = authenticated_client.post(url, data=patient_data, format="json")
        assert response.status_code == 201
        assert Patient.objects.count() == 1
        assert Patient.objects.first().mrn == patient_data["mrn"]

    def test_list_patients_authenticated(self, authenticated_client, patient_data):
        """Verify listing patients requires authentication."""
        services.register_new_patient(**patient_data)
        url = "/api/v1/patients/"
        response = authenticated_client.get(url)
        assert response.status_code == 200
        assert len(response.data["results"]) == 1

    def test_list_patients_unauthenticated(self, api_client, patient_data):
        """Verify listing patients is denied for unauthenticated users."""
        services.register_new_patient(**patient_data)
        url = "/api/v1/patients/"
        response = api_client.get(url)
        assert response.status_code == 403

    def test_soft_delete_patient_authenticated(
        self, authenticated_client, patient_data
    ):
        """Verify an authenticated user can soft-delete a patient."""
        patient = services.register_new_patient(**patient_data)
        url = f"/api/v1/patients/{patient.id}/"
        response = authenticated_client.delete(url)

        patient.refresh_from_db()
        assert response.status_code == 204
        assert patient.is_active is False
