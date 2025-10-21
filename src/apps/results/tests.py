"""
Comprehensive test suite for the Results & Imaging bounded context.
"""

import pytest
from django.contrib.auth import get_user_model
from faker import Faker
from rest_framework.test import APIClient

from src.apps.patients.models import Patient
from src.apps.practitioners.models import Practitioner

from . import services
from .models import DiagnosticReport

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
        birth_date=fake.date_of_birth(minimum_age=40, maximum_age=80),
        sex="female",
    )


@pytest.fixture
def practitioner():
    return Practitioner.objects.create(
        license_number=fake.unique.numerify(text="LIC-%%%%%%"),
        given_name=fake.first_name(),
        family_name=fake.last_name(),
        role="Radiologist",
    )


@pytest.fixture
def report_data(patient, practitioner):
    return {
        "patient_id": patient.id,
        "performer_id": practitioner.id,
        "conclusion": "No significant findings.",
        "observations": [
            {"code": "8480-6", "value_text": "120 mmHg"},
            {"code": "8462-4", "value_text": "80 mmHg"},
        ],
    }


@pytest.mark.django_db
class TestResultsService:
    def test_create_report_success(self, report_data):
        report = services.create_diagnostic_report(**report_data)
        assert report is not None
        assert DiagnosticReport.objects.count() == 1
        assert report.observations.count() == 2
        assert report.conclusion == report_data["conclusion"]

    def test_create_report_no_observations_fails(self, report_data):
        report_data["observations"] = []
        with pytest.raises(
            services.ServiceValidationError, match="must have at least one observation"
        ):
            services.create_diagnostic_report(**report_data)


@pytest.mark.django_db
class TestResultsAPI:
    def test_create_report_api_success(self, authenticated_client, report_data):
        url = "/api/v1/results/reports/"
        response = authenticated_client.post(url, data=report_data, format="json")

        assert response.status_code == 201
        assert DiagnosticReport.objects.count() == 1
        assert len(response.data["observations"]) == 2
        assert response.data["conclusion"] == report_data["conclusion"]

    def test_create_report_unauthenticated(self):
        api_client = APIClient()
        url = "/api/v1/results/reports/"
        response = api_client.post(url, data={}, format="json")
        assert response.status_code in [
            401,
            403,
        ]  # Can be either unauthorized or forbidden

    def test_list_reports_authenticated(self, authenticated_client, report_data):
        services.create_diagnostic_report(**report_data)
        url = "/api/v1/results/reports/"
        response = authenticated_client.get(url)
        assert response.status_code == 200
        assert len(response.data["results"]) == 1
