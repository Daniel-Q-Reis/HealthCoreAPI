"""
Comprehensive test suite for the Practitioners bounded context with authentication.
"""

import pytest
from django.contrib.auth import get_user_model
from faker import Faker
from rest_framework.test import APIClient

from . import services
from .models import Practitioner

fake = Faker()
User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def test_user():
    """Creates a standard test user."""
    return User.objects.create_user(
        username="practitioneruser", password="testpassword123"
    )


@pytest.fixture
def authenticated_client(api_client, test_user):
    """Provides an API client authenticated with a JWT token."""
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


@pytest.mark.django_db
class TestPractitionerAPIAuth:
    def test_unauthenticated_access_denied(self, api_client, practitioner_data):
        """Verify that write operations are denied for unauthenticated users."""
        url = "/api/v1/practitioners/"
        response = api_client.post(url, data=practitioner_data, format="json")
        assert response.status_code == 403

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
        """Verify listing practitioners requires authentication."""
        services.register_new_practitioner(**practitioner_data)
        url = "/api/v1/practitioners/"
        response = authenticated_client.get(url)
        assert response.status_code == 200
        assert len(response.data["results"]) == 1

    def test_list_practitioners_unauthenticated(self, api_client, practitioner_data):
        """Verify listing practitioners is denied for unauthenticated users."""
        services.register_new_practitioner(**practitioner_data)
        url = "/api/v1/practitioners/"
        response = api_client.get(url)
        assert response.status_code == 403

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
