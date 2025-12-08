import pytest
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from model_bakery import baker
from rest_framework.test import APIClient

from . import services
from .models import Equipment, EquipmentStatus

User = get_user_model()


@pytest.fixture
def medical_user():
    # Create user with 'Doctors' group to pass RBAC
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
def equipment():
    return baker.make(
        Equipment,
        name="Pump X",
        serial_number="IP-123",
        qr_code="QR-123",
        status=EquipmentStatus.AVAILABLE,
        current_location="Storage",
    )


@pytest.mark.django_db
class TestEquipmentServices:
    def test_handoff_logic(self, equipment, medical_user):
        mv = services.record_handoff(
            equipment=equipment, to_location="ICU", actor=medical_user
        )
        equipment.refresh_from_db()
        assert equipment.current_location == "ICU"
        assert mv.to_location == "ICU"

    def test_maintenance_trigger(self, equipment, medical_user):
        services.report_incident(
            equipment=equipment,
            reporter=medical_user,
            severity="HIGH",
            description="Broken",
        )
        equipment.refresh_from_db()
        assert equipment.status == EquipmentStatus.MAINTENANCE


@pytest.mark.django_db
class TestEquipmentAPI:
    def test_handoff_api_success(self, auth_client, equipment):
        url = f"/api/v1/equipment/equipment/{equipment.id}/handoff/"
        response = auth_client.post(url, {"to_location": "ER", "method": "SCAN"})
        assert response.status_code == 200
        equipment.refresh_from_db()
        assert equipment.current_location == "ER"

    def test_unauthorized_access(self, equipment):
        # User without group should fail
        client = APIClient()
        user = User.objects.create_user(username="random", password="pwd")
        client.force_authenticate(user=user)

        url = f"/api/v1/equipment/equipment/{equipment.id}/handoff/"
        response = client.post(url, {"to_location": "ER"})
        assert response.status_code == 403  # Forbidden
