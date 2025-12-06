from datetime import timedelta

import pytest
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.utils import timezone
from model_bakery import baker
from rest_framework.test import APIClient

from src.apps.patients.models import Patient
from src.apps.practitioners.models import Practitioner

from . import services
from .models import Medication

User = get_user_model()


@pytest.fixture
def medical_user():
    user = User.objects.create_user(username="doc_user", password="password")
    group, _ = Group.objects.get_or_create(name="Doctors")
    user.groups.add(group)
    return user


@pytest.fixture
def auth_client(medical_user):
    client = APIClient()
    client.force_authenticate(user=medical_user)
    return client


@pytest.fixture
def medication():
    return baker.make(
        Medication,
        stock_quantity=100,
        expiry_date=timezone.now().date() + timedelta(days=365),
    )


@pytest.fixture
def patient():
    return baker.make(Patient)


@pytest.fixture
def practitioner():
    return baker.make(Practitioner)


@pytest.mark.django_db
class TestPharmacyService:
    def test_dispense_success(self, medication, patient, practitioner):
        dispensation = services.dispense_medication(
            medication_id=medication.id,
            patient_id=patient.id,
            practitioner_id=practitioner.id,
            quantity=10,
        )
        medication.refresh_from_db()
        assert medication.stock_quantity == 90
        assert dispensation.quantity == 10

    def test_dispense_insufficient_stock(self, medication, patient, practitioner):
        with pytest.raises(services.PharmacyError, match="Insufficient stock"):
            services.dispense_medication(
                medication_id=medication.id,
                patient_id=patient.id,
                practitioner_id=practitioner.id,
                quantity=101,
            )

    def test_dispense_expired(self, medication, patient, practitioner):
        medication.expiry_date = timezone.now().date() - timedelta(days=1)
        medication.save()
        with pytest.raises(services.PharmacyError, match="is expired"):
            services.dispense_medication(
                medication_id=medication.id,
                patient_id=patient.id,
                practitioner_id=practitioner.id,
                quantity=1,
            )


@pytest.mark.django_db
class TestPharmacyAPI:
    def test_create_dispensation_api(
        self, auth_client, medication, patient, practitioner
    ):
        url = "/api/v1/pharmacy/dispensations/"
        data = {
            "medication_id": str(medication.id),
            "patient_id": str(patient.id),
            "practitioner_id": str(practitioner.id),
            "quantity": 5,
            "notes": "",
        }
        response = auth_client.post(url, data=data, format="json")
        assert response.status_code == 201
        medication.refresh_from_db()
        assert medication.stock_quantity == 95
