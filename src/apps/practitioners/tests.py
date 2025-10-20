"""
Comprehensive test suite for the Practitioners bounded context, including authentication.
"""

import pytest
from django.contrib.auth import get_user_model
from faker import Faker
from rest_framework.test import APIClient

from . import services
from .models import Practitioner

fake = Faker()
User = get_user_model()


# --- Fixtures from both branches ---


@pytest.fixture
def api_client():
    """Provides a standard DRF API client."""
    return APIClient()


@pytest.fixture
def test_user():
    """Creates a standard test user for authentication."""
    return User.objects.create_user(
        username="practitioneruser", password="testpassword123"
    )


@pytest.fixture
def authenticated_client(api_client, test_user):
    """Provides an API client authenticated with a user."""
    api_client.force_authenticate(user=test_user)
    return api_client


@pytest.fixture
def practitioner_data():
    """Generates valid data for creating a practitioner."""
    return {
        "license_number": fake.unique.numerify(text="LIC-%%%%%%"),
        "given_name": fake.first_name(),
        "family_name": fake.last_name(),
        "role": "Physician",
        "specialty": "Cardiology",
    }


# --- Tests from the 'main' branch (Model and Service layers) ---


@pytest.mark.django_db
class TestPractitionerModel:
    """Tests for the Practitioner model."""

    def test_practitioner_creation(self, practitioner_data):
        practitioner = Practitioner.objects.create(**practitioner_data)
        assert Practitioner.objects.count() == 1
        assert (
            str(practitioner)
            == f"{practitioner_data['family_name']}, {practitioner_data['given_name']} ({practitioner_data['role']})"
        )


@pytest.mark.django_db
class TestPractitionerService:
    """Tests for the Practitioner service layer."""

    def test_register_new_practitioner(self, practitioner_data):
        practitioner = services.register_new_practitioner(**practitioner_data)
        assert practitioner is not None
        assert practitioner.license_number == practitioner_data["license_number"]
        assert Practitioner.objects.count() == 1


# --- Tests from the 'feature/auth-jwt-setup' branch (API layer with Auth) ---


@pytest.mark.django_db
class TestPractitionerAPI:
    """Tests for the Practitioner API endpoints with authentication."""

    def test_unauthenticated_access_denied(self, api_client):
        """Verify that read/write operations are denied for unauthenticated users."""
        list_url = "/api/v1/practitioners/"

        # Test GET (list)
        list_response = api_client.get(list_url)
        assert list_response.status_code == 403

        # Test POST
        post_response = api_client.post(list_url, data={}, format="json")
        assert post_response.status_code == 403

    def test_create_practitioner_authenticated(
        self, authenticated_client, practitioner_data
    ):
        """Verify an authenticated user can create a practitioner."""
        url = "/api/v1/practitioners/"
        response = authenticated_client.post(url, data=practitioner_data, format="json")
        assert response.status_code == 201
        assert Practitioner.objects.count() == 1

    def test_list_practitioners_authenticated(
        self, authenticated_client, practitioner_data
    ):
        """Verify listing practitioners requires authentication and succeeds."""
        services.register_new_practitioner(**practitioner_data)
        url = "/api/v1/practitioners/"
        response = authenticated_client.get(url)
        assert response.status_code == 200
        assert len(response.data["results"]) == 1

    def test_retrieve_practitioner_authenticated(
        self, authenticated_client, practitioner_data
    ):
        """Verify retrieving a practitioner requires authentication."""
        practitioner = services.register_new_practitioner(**practitioner_data)
        url = f"/api/v1/practitioners/{practitioner.id}/"
        response = authenticated_client.get(url)
        assert response.status_code == 200
        assert response.data["license_number"] == practitioner.license_number

    def test_soft_delete_practitioner_authenticated(
        self, authenticated_client, practitioner_data
    ):
        """Verify an authenticated user can soft-delete a practitioner."""
        practitioner = services.register_new_practitioner(**practitioner_data)
        url = f"/api/v1/practitioners/{practitioner.id}/"
        response = authenticated_client.delete(url)
        practitioner.refresh_from_db()
        assert response.status_code == 204
        assert practitioner.is_active is False
