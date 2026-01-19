"""
Test suite for Patient API views.
"""

import pytest
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from src.apps.patients.models import Patient

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def patient_user():
    user = User.objects.create_user(
        username="patient", email="patient@example.com", password="password"
    )
    group, _ = Group.objects.get_or_create(name="Patients")
    user.groups.add(group)
    return user


@pytest.fixture
def doctor_user():
    user = User.objects.create_user(
        username="doctor", email="doctor@example.com", password="password"
    )
    group, _ = Group.objects.get_or_create(name="Doctors")
    user.groups.add(group)
    return user


@pytest.fixture
def patient_profile(patient_user):
    return Patient.objects.create(
        email=patient_user.email,
        given_name="John",
        family_name="Doe",
        birth_date="1990-01-01",
        mrn="MRN-12345",
        sex="male",
    )


@pytest.mark.django_db
class TestPatientViewSet:
    """Test suite for PatientViewSet."""

    def test_list_patients_as_doctor(self, api_client, doctor_user, patient_profile):
        """Doctor should see all patients."""
        api_client.force_authenticate(user=doctor_user)
        url = reverse("patients:patient-list")  # Namespaced
        response = api_client.get(url)

        # Check if URL resolution works, otherwise try explicit path
        if response.status_code == 404:
            response = api_client.get("/api/v1/patients/")

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) >= 1

    def test_list_patients_as_patient(self, api_client, patient_user, patient_profile):
        """Patient should only see their own profile."""
        # Create another patient to ensure filtering works
        Patient.objects.create(
            email="other@example.com",
            given_name="Jane",
            family_name="Doe",
            birth_date="1995-01-01",
            mrn="MRN-67890",
            sex="female",
        )

        api_client.force_authenticate(user=patient_user)
        response = api_client.get("/api/v1/patients/")

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1
        assert response.data["results"][0]["email"] == patient_user.email

    def test_me_endpoint_get_existing(self, api_client, patient_user, patient_profile):
        """GET /me should return current user profile."""
        api_client.force_authenticate(user=patient_user)
        response = api_client.get("/api/v1/patients/me/")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["email"] == patient_user.email

    def test_me_endpoint_get_not_found(self, api_client, patient_user):
        """GET /me should 404 if profile missing."""
        api_client.force_authenticate(user=patient_user)
        response = api_client.get("/api/v1/patients/me/")

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_me_endpoint_post_create(self, api_client, patient_user):
        """POST /me should create profile."""
        api_client.force_authenticate(user=patient_user)
        data = {
            "given_name": "New",
            "family_name": "User",
            "birth_date": "2000-01-01",
            "sex": "female",
            "phone_number": "+1234567890",
        }
        response = api_client.post("/api/v1/patients/me/", data)

        assert response.status_code == status.HTTP_201_CREATED
        assert Patient.objects.filter(email=patient_user.email).exists()

    def test_me_endpoint_post_existing(self, api_client, patient_user, patient_profile):
        """POST /me should return existing if already exists."""
        api_client.force_authenticate(user=patient_user)
        data = {
            "given_name": "Update",  # Should be ignored
            "family_name": "User",
        }
        response = api_client.post("/api/v1/patients/me/", data)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["given_name"] == "John"  # Original name, not updated
