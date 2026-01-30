"""
Comprehensive test suite for Clinical Orders.
Tests service layer, API, and RBAC.
"""

from datetime import timedelta
from typing import Any

import pytest
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.utils import timezone
from model_bakery import baker
from rest_framework.test import APIClient

from src.apps.departments.models import Department
from src.apps.patients.models import Patient
from src.apps.practitioners.models import Practitioner

from . import services
from .models import ClinicalOrder, OrderStatus

User = get_user_model()


# --- Fixtures ---


@pytest.fixture
def api_client() -> APIClient:
    """Provides a standard DRF API client."""
    return APIClient()


@pytest.fixture
def doctor_user() -> Any:
    """User with Doctor role for medical staff tests."""
    user = User.objects.create_user(username="doctor_test", password="testpass")
    doctor_group, _ = Group.objects.get_or_create(name="Doctors")
    user.groups.add(doctor_group)
    return user


@pytest.fixture
def nurse_user() -> Any:
    """User with Nurse role for medical staff tests."""
    user = User.objects.create_user(username="nurse_test", password="testpass")
    nurse_group, _ = Group.objects.get_or_create(name="Nurses")
    user.groups.add(nurse_group)
    return user


@pytest.fixture
def patient_user() -> Any:
    """User with Patient role for RBAC tests."""
    user = User.objects.create_user(username="patient_test", password="testpass")
    patient_group, _ = Group.objects.get_or_create(name="Patients")
    user.groups.add(patient_group)
    return user


@pytest.fixture
def authenticated_client(api_client: APIClient, doctor_user: Any) -> APIClient:
    """
    Authenticated API client with Doctor role for RBAC compliance.
    Required since ClinicalOrderViewSet uses IsMedicalStaff permission.
    """
    api_client.force_authenticate(user=doctor_user)
    return api_client


@pytest.fixture
def patient() -> Patient:
    """Create active patient."""
    return baker.make(Patient, is_active=True)


@pytest.fixture
def inactive_patient() -> Patient:
    """Create inactive patient."""
    return baker.make(Patient, is_active=False)


@pytest.fixture
def practitioner() -> Practitioner:
    """Create active practitioner."""
    return baker.make(Practitioner, is_active=True)


@pytest.fixture
def inactive_practitioner() -> Practitioner:
    """Create inactive practitioner."""
    return baker.make(Practitioner, is_active=False)


@pytest.fixture
def department() -> Department:
    """Create department."""
    return baker.make(Department, name="Radiology", is_active=True)


# --- Service Layer Tests ---


@pytest.mark.django_db
class TestOrderServices:
    """Tests for order service layer business logic."""

    def test_create_order_success(
        self, patient: Patient, practitioner: Practitioner
    ) -> None:
        """Test successful order creation."""
        requested_date = timezone.now() + timedelta(days=1)

        order = services.create_clinical_order(
            patient_id=patient.id,
            requester_id=practitioner.id,
            code="CBC",
            description="Complete Blood Count",
            requested_date=requested_date,
            category="LAB",
            priority="ROUTINE",
        )

        assert order is not None
        assert order.code == "CBC"
        assert order.status == OrderStatus.ACTIVE
        assert order.patient == patient
        assert order.requester == practitioner

    def test_create_order_inactive_patient_fails(
        self, inactive_patient: Patient, practitioner: Practitioner
    ) -> None:
        """Test order creation fails for inactive patient."""
        requested_date = timezone.now() + timedelta(days=1)

        with pytest.raises(services.ServiceValidationError) as exc_info:
            services.create_clinical_order(
                patient_id=inactive_patient.id,
                requester_id=practitioner.id,
                code="XRAY",
                description="Chest X-Ray",
                requested_date=requested_date,
            )

        assert "inactive" in str(exc_info.value).lower()

    def test_create_order_inactive_practitioner_fails(
        self, patient: Patient, inactive_practitioner: Practitioner
    ) -> None:
        """Test order creation fails for inactive practitioner."""
        requested_date = timezone.now() + timedelta(days=1)

        with pytest.raises(services.ServiceValidationError) as exc_info:
            services.create_clinical_order(
                patient_id=patient.id,
                requester_id=inactive_practitioner.id,
                code="MRI",
                description="Brain MRI",
                requested_date=requested_date,
            )

        assert "inactive" in str(exc_info.value).lower()

    def test_create_order_past_date_fails(
        self, patient: Patient, practitioner: Practitioner
    ) -> None:
        """Test order creation fails for past dates."""
        past_date = timezone.now() - timedelta(days=2)

        with pytest.raises(services.ServiceValidationError) as exc_info:
            services.create_clinical_order(
                patient_id=patient.id,
                requester_id=practitioner.id,
                code="ULTRASOUND",
                description="Abdominal Ultrasound",
                requested_date=past_date,
            )

        assert "past" in str(exc_info.value).lower()

    def test_create_order_nonexistent_patient_fails(
        self, practitioner: Practitioner
    ) -> None:
        """Test order creation fails for non-existent patient."""
        requested_date = timezone.now() + timedelta(days=1)

        with pytest.raises(services.ServiceValidationError) as exc_info:
            services.create_clinical_order(
                patient_id=999999,
                requester_id=practitioner.id,
                code="CT",
                description="CT Scan",
                requested_date=requested_date,
            )

        assert "does not exist" in str(exc_info.value).lower()

    def test_update_order_status_success(
        self, patient: Patient, practitioner: Practitioner
    ) -> None:
        """Test successful status update."""
        order = services.create_clinical_order(
            patient_id=patient.id,
            requester_id=practitioner.id,
            code="ECG",
            description="Electrocardiogram",
            requested_date=timezone.now() + timedelta(hours=2),
        )

        updated_order = services.update_order_status(order, OrderStatus.COMPLETED)
        assert updated_order.status == OrderStatus.COMPLETED

    def test_cannot_modify_cancelled_order(
        self, patient: Patient, practitioner: Practitioner
    ) -> None:
        """Test cancelled orders cannot be modified."""
        order = services.create_clinical_order(
            patient_id=patient.id,
            requester_id=practitioner.id,
            code="BIOPSY",
            description="Tissue Biopsy",
            requested_date=timezone.now() + timedelta(days=1),
        )

        order.status = OrderStatus.CANCELLED
        order.save()

        with pytest.raises(services.ServiceValidationError) as exc_info:
            services.update_order_status(order, OrderStatus.ACTIVE)

        assert "cannot modify" in str(exc_info.value).lower()

    def test_cancel_order_success(
        self, patient: Patient, practitioner: Practitioner
    ) -> None:
        """Test order cancellation."""
        order = services.create_clinical_order(
            patient_id=patient.id,
            requester_id=practitioner.id,
            code="MAMMOGRAM",
            description="Screening Mammogram",
            requested_date=timezone.now() + timedelta(days=7),
        )

        cancelled = services.cancel_order(order)
        assert cancelled.status == OrderStatus.CANCELLED


# --- API Tests ---


@pytest.mark.django_db
class TestOrderAPI:
    """Tests for Clinical Orders API endpoints."""

    def test_create_order_api_success(
        self,
        authenticated_client: APIClient,
        patient: Patient,
        practitioner: Practitioner,
    ) -> None:
        """Test order creation via API."""
        url = "/api/v1/orders/orders/"
        requested_date = (timezone.now() + timedelta(days=1)).isoformat()

        data = {
            "patient_id": patient.id,
            "requester_id": practitioner.id,
            "code": "LIPID-PANEL",
            "description": "Lipid Panel",
            "requested_date": requested_date,
            "category": "LAB",
            "priority": "ROUTINE",
        }

        response = authenticated_client.post(url, data=data, format="json")

        assert response.status_code == 201
        assert ClinicalOrder.objects.count() == 1
        assert response.data["code"] == "LIPID-PANEL"

    def test_create_order_unauthenticated_denied(
        self, api_client: APIClient, patient: Patient, practitioner: Practitioner
    ) -> None:
        """Test unauthenticated users cannot create orders."""
        url = "/api/v1/orders/orders/"
        data = {
            "patient_id": patient.id,
            "requester_id": practitioner.id,
            "code": "TEST",
            "description": "Test",
            "requested_date": timezone.now().isoformat(),
        }

        response = api_client.post(url, data=data, format="json")
        # 401 Unauthorized for unauthenticated requests
        assert response.status_code == 401

    def test_create_order_patient_user_denied(
        self,
        api_client: APIClient,
        patient_user: Any,
        patient: Patient,
        practitioner: Practitioner,
    ) -> None:
        """Test patient users cannot create orders (not medical staff)."""
        api_client.force_authenticate(user=patient_user)
        url = "/api/v1/orders/orders/"
        data = {
            "patient_id": patient.id,
            "requester_id": practitioner.id,
            "code": "TEST",
            "description": "Test",
            "requested_date": (timezone.now() + timedelta(days=1)).isoformat(),
        }

        response = api_client.post(url, data=data, format="json")
        assert response.status_code == 403

    def test_list_orders(
        self,
        authenticated_client: APIClient,
        patient: Patient,
        practitioner: Practitioner,
    ) -> None:
        """Test listing orders."""
        # Create sample order
        services.create_clinical_order(
            patient_id=patient.id,
            requester_id=practitioner.id,
            code="HBA1C",
            description="Hemoglobin A1C",
            requested_date=timezone.now() + timedelta(days=1),
        )

        url = "/api/v1/orders/orders/"
        response = authenticated_client.get(url)

        assert response.status_code == 200
        assert len(response.data["results"]) == 1

    def test_cancel_order_action(
        self,
        authenticated_client: APIClient,
        patient: Patient,
        practitioner: Practitioner,
    ) -> None:
        """Test cancel order action."""
        order = services.create_clinical_order(
            patient_id=patient.id,
            requester_id=practitioner.id,
            code="PSA",
            description="Prostate-Specific Antigen",
            requested_date=timezone.now() + timedelta(days=3),
        )

        url = f"/api/v1/orders/orders/{order.id}/cancel/"
        response = authenticated_client.post(url)

        assert response.status_code == 200
        order.refresh_from_db()
        assert order.status == OrderStatus.CANCELLED

    def test_complete_order_action(
        self,
        authenticated_client: APIClient,
        patient: Patient,
        practitioner: Practitioner,
    ) -> None:
        """Test complete order action."""
        order = services.create_clinical_order(
            patient_id=patient.id,
            requester_id=practitioner.id,
            code="TSH",
            description="Thyroid Stimulating Hormone",
            requested_date=timezone.now() + timedelta(hours=4),
        )

        url = f"/api/v1/orders/orders/{order.id}/complete/"
        response = authenticated_client.post(url)

        assert response.status_code == 200
        order.refresh_from_db()
        assert order.status == OrderStatus.COMPLETED
