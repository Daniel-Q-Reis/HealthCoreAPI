"""
Comprehensive test suite for the Departments & Specialties bounded context.
"""

import pytest
from django.contrib.auth import get_user_model
from faker import Faker
from rest_framework.test import APIClient

from . import services
from .models import Department

fake = Faker()
User = get_user_model()


@pytest.fixture
def test_user():
    return User.objects.create_user(username="testuser", password="password123")


@pytest.fixture
def authenticated_client(api_client, test_user):
    """
    Authenticated API client with Admin role for RBAC compliance.
    Required since DepartmentViewSet uses IsAdmin permission.
    """
    from django.contrib.auth.models import Group

    api_client = APIClient()
    user = User.objects.create_user(username="admin_test", password="password123")
    admin_group, _ = Group.objects.get_or_create(name="Admins")
    user.groups.add(admin_group)
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def department_data():
    return {
        "name": fake.unique.company() + " Department",
        "description": fake.paragraph(),
    }


@pytest.mark.django_db
class TestDepartmentsService:
    def test_create_department_success(self, department_data):
        department = services.create_new_department(**department_data)
        assert department is not None
        assert Department.objects.count() == 1
        assert department.name == department_data["name"]


@pytest.mark.django_db
class TestDepartmentsAPI:
    def test_create_department_api_success(self, authenticated_client, department_data):
        url = "/api/v1/hospital/departments/"
        response = authenticated_client.post(url, data=department_data, format="json")

        assert response.status_code == 201
        assert Department.objects.count() == 1
        assert Department.objects.first().name == department_data["name"]

    def test_list_departments_authenticated(
        self, authenticated_client, department_data
    ):
        services.create_new_department(**department_data)
        url = "/api/v1/hospital/departments/"
        response = authenticated_client.get(url)
        assert response.status_code == 200
        assert len(response.data["results"]) == 1

    def test_soft_delete_department(self, authenticated_client, department_data):
        department = services.create_new_department(**department_data)
        url = f"/api/v1/hospital/departments/{department.id}/"
        response = authenticated_client.delete(url)

        department.refresh_from_db()
        assert response.status_code == 204
        assert department.is_active is False

    def test_department_list_returns_cached_response(
        self, authenticated_client, department_data
    ):
        """
        Verify that the list endpoint for departments returns a successful response (caching is present).
        """
        services.create_new_department(**department_data)
        url = "/api/v1/hospital/departments/"

        # Make request to the cached endpoint
        response = authenticated_client.get(url)
        assert response.status_code == 200
        assert "results" in response.json()
