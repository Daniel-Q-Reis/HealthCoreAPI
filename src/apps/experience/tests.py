"""
Comprehensive test suite for the Patient Experience bounded context.
"""

import pytest
from django.contrib.auth import get_user_model
from faker import Faker
from rest_framework.test import APIClient

from src.apps.patients.models import Patient

from .models import PatientComplaint, PatientFeedback

fake = Faker()
User = get_user_model()


@pytest.fixture
def test_user():
    return User.objects.create_user(username="testuser", password="password123")


@pytest.fixture
def authenticated_client():
    api_client = APIClient()
    user = User.objects.create_user(username="testuser", password="password123")
    api_client.force_authenticate(user=user)
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


@pytest.mark.django_db
class TestPatientExperienceAPI:
    def test_create_feedback_api(self, authenticated_client, patient):
        url = "/api/v1/experience/feedback/"
        data = {
            "patient": patient.id,
            "overall_rating": 5,
            "comments": "Excellent care.",
        }
        response = authenticated_client.post(url, data=data, format="json")

        assert response.status_code == 201
        assert PatientFeedback.objects.count() == 1
        assert response.data["overall_rating"] == 5

    def test_create_complaint_api(self, authenticated_client, patient):
        url = "/api/v1/experience/complaints/"
        data = {
            "patient": patient.id,
            "category": "service",
            "description": "The waiting time was too long.",
        }
        response = authenticated_client.post(url, data=data, format="json")

        assert response.status_code == 201
        assert PatientComplaint.objects.count() == 1
        assert response.data["category"] == "service"
        assert response.data["status"] == "open"  # Check default status
