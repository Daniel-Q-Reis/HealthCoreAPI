"""
Test suite for RBAC (Role-Based Access Control) permissions.

This module tests the security boundaries and access control logic
for all healthcare roles in the system.

Test coverage:
- Group-based permission checks
- Object-level permission enforcement
- Cross-role access scenarios
- Edge cases and boundary conditions

Security testing approach:
- Positive tests: Verify authorized access works
- Negative tests: Verify unauthorized access is blocked
- Boundary tests: Verify edge cases are handled correctly
"""

import pytest
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser, Group
from rest_framework.test import APIRequestFactory

from src.apps.core.permissions import (
    IsAdmin,
    IsDoctor,
    IsMedicalStaff,
    IsNurse,
    IsOwnerOrReadOnly,
    IsPatient,
    IsPatientOwner,
)
from src.apps.patients.models import Patient

User = get_user_model()


@pytest.fixture
def request_factory():
    """Fixture providing request factory for creating mock requests."""
    return APIRequestFactory()


@pytest.fixture
def admin_user():
    """Fixture providing a user with Admin role."""
    user = User.objects.create_user(username="admin", password="testpass123")
    admin_group, _ = Group.objects.get_or_create(name="Admins")
    user.groups.add(admin_group)
    return user


@pytest.fixture
def doctor_user():
    """Fixture providing a user with Doctor role."""
    user = User.objects.create_user(username="doctor", password="testpass123")
    doctor_group, _ = Group.objects.get_or_create(name="Doctors")
    user.groups.add(doctor_group)
    return user


@pytest.fixture
def nurse_user():
    """Fixture providing a user with Nurse role."""
    user = User.objects.create_user(username="nurse", password="testpass123")
    nurse_group, _ = Group.objects.get_or_create(name="Nurses")
    user.groups.add(nurse_group)
    return user


@pytest.fixture
def patient_user():
    """Fixture providing a user with Patient role."""
    user = User.objects.create_user(username="patient", password="testpass123")
    patient_group, _ = Group.objects.get_or_create(name="Patients")
    user.groups.add(patient_group)
    return user


@pytest.fixture
def unauthenticated_user():
    """Fixture providing an unauthenticated/anonymous user."""
    return AnonymousUser()


@pytest.mark.django_db
class TestIsAdminPermission:
    """Test suite for Admin role permission checks."""

    def test_admin_user_has_permission(self, admin_user, request_factory):
        """Test that Admin user is granted permission."""
        request = request_factory.get("/")
        request.user = admin_user

        permission = IsAdmin()
        assert permission.has_permission(request, None) is True

    def test_non_admin_user_denied_permission(self, doctor_user, request_factory):
        """Test that non-Admin user (Doctor) is denied permission."""
        request = request_factory.get("/")
        request.user = doctor_user

        permission = IsAdmin()
        assert permission.has_permission(request, None) is False

    def test_unauthenticated_user_denied_permission(
        self, unauthenticated_user, request_factory
    ):
        """Test that unauthenticated user is denied Admin permission."""
        request = request_factory.get("/")
        request.user = unauthenticated_user

        permission = IsAdmin()
        assert permission.has_permission(request, None) is False


@pytest.mark.django_db
class TestIsDoctorPermission:
    """Test suite for Doctor role permission checks."""

    def test_doctor_user_has_permission(self, doctor_user, request_factory):
        """Test that Doctor user is granted permission."""
        request = request_factory.get("/")
        request.user = doctor_user

        permission = IsDoctor()
        assert permission.has_permission(request, None) is True

    def test_non_doctor_user_denied_permission(self, nurse_user, request_factory):
        """Test that non-Doctor user (Nurse) is denied permission."""
        request = request_factory.get("/")
        request.user = nurse_user

        permission = IsDoctor()
        assert permission.has_permission(request, None) is False

    def test_patient_user_denied_doctor_permission(self, patient_user, request_factory):
        """Test that Patient user is denied Doctor permission."""
        request = request_factory.get("/")
        request.user = patient_user

        permission = IsDoctor()
        assert permission.has_permission(request, None) is False


@pytest.mark.django_db
class TestIsNursePermission:
    """Test suite for Nurse role permission checks."""

    def test_nurse_user_has_permission(self, nurse_user, request_factory):
        """Test that Nurse user is granted permission."""
        request = request_factory.get("/")
        request.user = nurse_user

        permission = IsNurse()
        assert permission.has_permission(request, None) is True

    def test_non_nurse_user_denied_permission(self, doctor_user, request_factory):
        """Test that non-Nurse user (Doctor) is denied permission."""
        request = request_factory.get("/")
        request.user = doctor_user

        permission = IsNurse()
        assert permission.has_permission(request, None) is False


@pytest.mark.django_db
class TestIsPatientPermission:
    """Test suite for Patient role permission checks."""

    def test_patient_user_has_permission(self, patient_user, request_factory):
        """Test that Patient user is granted permission."""
        request = request_factory.get("/")
        request.user = patient_user

        permission = IsPatient()
        assert permission.has_permission(request, None) is True

    def test_non_patient_user_denied_permission(self, doctor_user, request_factory):
        """Test that non-Patient user (Doctor) is denied permission."""
        request = request_factory.get("/")
        request.user = doctor_user

        permission = IsPatient()
        assert permission.has_permission(request, None) is False


@pytest.mark.django_db
class TestIsMedicalStaffPermission:
    """Test suite for MedicalStaff composite permission."""

    def test_doctor_is_medical_staff(self, doctor_user, request_factory):
        """Test that Doctor is considered medical staff."""
        request = request_factory.get("/")
        request.user = doctor_user

        permission = IsMedicalStaff()
        assert permission.has_permission(request, None) is True

    def test_nurse_is_medical_staff(self, nurse_user, request_factory):
        """Test that Nurse is considered medical staff."""
        request = request_factory.get("/")
        request.user = nurse_user

        permission = IsMedicalStaff()
        assert permission.has_permission(request, None) is True

    def test_patient_is_not_medical_staff(self, patient_user, request_factory):
        """Test that Patient is NOT considered medical staff."""
        request = request_factory.get("/")
        request.user = patient_user

        permission = IsMedicalStaff()
        assert permission.has_permission(request, None) is False

    def test_admin_is_not_medical_staff(self, admin_user, request_factory):
        """Test that Admin is NOT considered medical staff."""
        request = request_factory.get("/")
        request.user = admin_user

        permission = IsMedicalStaff()
        assert permission.has_permission(request, None) is False


@pytest.mark.django_db
class TestIsPatientOwnerPermission:
    """Test suite for patient ownership object-level permissions."""

    def test_doctor_can_access_any_patient_record(self, doctor_user, request_factory):
        """Test that Doctor can access any patient record (for treatment)."""
        # Create a patient record (without user FK since model doesn't have it)
        patient = Patient.objects.create(
            mrn="MRN-001",
            given_name="John",
            family_name="Doe",
            birth_date="1990-01-01",
            sex="male",
            email="john.doe@example.com",
        )

        request = request_factory.get("/")
        request.user = doctor_user

        permission = IsPatientOwner()
        # Medical staff can access all patient records
        assert permission.has_object_permission(request, None, patient) is True

    def test_nurse_can_access_any_patient_record(self, nurse_user, request_factory):
        """Test that Nurse can access any patient record (for care)."""
        patient = Patient.objects.create(
            mrn="MRN-002",
            given_name="Jane",
            family_name="Smith",
            birth_date="1985-05-15",
            sex="female",
            email="jane.smith@example.com",
        )

        request = request_factory.get("/")
        request.user = nurse_user

        permission = IsPatientOwner()
        assert permission.has_object_permission(request, None, patient) is True

    def test_admin_can_access_any_patient_record(self, admin_user, request_factory):
        """Test that Admin can access any patient record (for admin purposes)."""
        patient = Patient.objects.create(
            mrn="MRN-003",
            given_name="Bob",
            family_name="Johnson",
            birth_date="1978-03-20",
            sex="male",
            email="bob.johnson@example.com",
        )

        request = request_factory.get("/")
        request.user = admin_user

        permission = IsPatientOwner()
        assert permission.has_object_permission(request, None, patient) is True

    def test_patient_user_without_ownership_denied(self, patient_user, request_factory):
        """
        Test that Patient user is denied access to patient record
        when model doesn't have user FK.

        Note: Since Patient model doesn't have a 'user' field,
        the permission check will fail for patient users.
        In a real implementation, you would add a user FK to Patient model.
        """
        patient = Patient.objects.create(
            mrn="MRN-004",
            given_name="Alice",
            family_name="Williams",
            birth_date="1992-08-10",
            sex="female",
            email="alice.williams@example.com",
        )

        request = request_factory.get("/")
        request.user = patient_user

        permission = IsPatientOwner()
        # Without user FK on model, patient users cannot access records
        assert permission.has_object_permission(request, None, patient) is False


@pytest.mark.django_db
class TestIsOwnerOrReadOnlyPermission:
    """Test suite for generic owner/read-only permission."""

    def test_any_user_can_read_object(self, doctor_user, request_factory):
        """Test that any authenticated user can read object."""
        patient = Patient.objects.create(
            mrn="MRN-005",
            given_name="Charlie",
            family_name="Brown",
            birth_date="1995-11-30",
            sex="male",
            email="charlie.brown@example.com",
        )

        request = request_factory.get("/")
        request.user = doctor_user

        permission = IsOwnerOrReadOnly()
        assert permission.has_object_permission(request, None, patient) is True

    def test_unauthenticated_user_can_read(self, unauthenticated_user, request_factory):
        """Test that authenticated is required for read operations."""
        patient = Patient.objects.create(
            mrn="MRN-006",
            given_name="Diana",
            family_name="Miller",
            birth_date="1988-07-25",
            sex="female",
            email="diana.miller@example.com",
        )
        assert patient.is_active is True

        request = request_factory.get("/")
        request.user = unauthenticated_user

        permission = IsOwnerOrReadOnly()
        # Unauthenticated users are denied (requires authentication)
        assert permission.has_permission(request, None) is False

    def test_write_requires_authentication(self, unauthenticated_user, request_factory):
        """Test that write operations require authentication."""
        request = request_factory.post("/")
        request.user = unauthenticated_user

        permission = IsOwnerOrReadOnly()
        assert permission.has_permission(request, None) is False

    def test_authenticated_user_can_write_without_object_check(
        self, doctor_user, request_factory
    ):
        """Test that authenticated user passes has_permission for write."""
        request = request_factory.post("/")
        request.user = doctor_user

        permission = IsOwnerOrReadOnly()
        # has_permission passes for authenticated users
        assert permission.has_permission(request, None) is True

    def test_non_owner_cannot_modify_object_without_user_field(
        self, doctor_user, request_factory
    ):
        """
        Test that non-owner cannot modify object when no user/author field exists.

        Note: Patient model doesn't have user or author field,
        so all users will be denied write access at object level.
        """
        patient = Patient.objects.create(
            mrn="MRN-007",
            given_name="Eve",
            family_name="Davis",
            birth_date="1991-04-12",
            sex="female",
            email="eve.davis@example.com",
        )

        request = request_factory.put("/")
        request.user = doctor_user

        permission = IsOwnerOrReadOnly()
        # Without user/author field, object-level write is denied
        assert permission.has_object_permission(request, None, patient) is False
