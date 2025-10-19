"""
Comprehensive test suite for the Practitioners bounded context.
"""

import pytest
from faker import Faker
from rest_framework.test import APIClient

from . import services
from .models import Practitioner

fake = Faker()


@pytest.fixture
def api_client():
    return APIClient()


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
class TestPractitionerModel:
    def test_practitioner_creation(self, practitioner_data):
        practitioner = Practitioner.objects.create(**practitioner_data)
        assert Practitioner.objects.count() == 1
        assert (
            str(practitioner)
            == f"{practitioner_data['family_name']}, {practitioner_data['given_name']} ({practitioner_data['role']})"
        )


@pytest.mark.django_db
class TestPractitionerService:
    def test_register_new_practitioner(self, practitioner_data):
        practitioner = services.register_new_practitioner(**practitioner_data)
        assert practitioner is not None
        assert practitioner.license_number == practitioner_data["license_number"]
        assert Practitioner.objects.count() == 1


@pytest.mark.django_db
class TestPractitionerAPI:
    def test_create_practitioner(self, api_client, practitioner_data):
        url = "/api/v1/practitioners/"
        response = api_client.post(url, data=practitioner_data, format="json")
        assert response.status_code == 201
        assert Practitioner.objects.count() == 1
        assert (
            Practitioner.objects.first().license_number
            == practitioner_data["license_number"]
        )

    def test_list_practitioners(self, api_client, practitioner_data):
        services.register_new_practitioner(**practitioner_data)
        url = "/api/v1/practitioners/"
        response = api_client.get(url)
        assert response.status_code == 200
        assert len(response.data["results"]) == 1

    def test_retrieve_practitioner(self, api_client, practitioner_data):
        practitioner = services.register_new_practitioner(**practitioner_data)
        url = f"/api/v1/practitioners/{practitioner.id}/"
        response = api_client.get(url)
        assert response.status_code == 200
        assert response.data["license_number"] == practitioner.license_number

    def test_soft_delete_practitioner(self, api_client, practitioner_data):
        practitioner = services.register_new_practitioner(**practitioner_data)
        url = f"/api/v1/practitioners/{practitioner.id}/"
        response = api_client.delete(url)
        practitioner.refresh_from_db()
        assert response.status_code == 204
        assert practitioner.is_active is False
        assert Practitioner.objects.active().count() == 0
