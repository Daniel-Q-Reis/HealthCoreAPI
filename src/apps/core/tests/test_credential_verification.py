"""
Tests for professional role request (credential verification) functionality.

Tests cover:
- ProfessionalRoleRequest model methods
- Permission classes (IsReceptionist, IsPharmacist)
- Serializer validation (file uploads, size limits)
- API endpoints (request, list, approve, reject)
- RBAC integration
- Audit logging
"""

from typing import Any, cast
from unittest.mock import Mock

import pytest
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import serializers as drf_serializers
from rest_framework import status
from rest_framework.test import APIClient

from src.apps.core.models import ProfessionalRoleRequest
from src.apps.core.permissions import IsPharmacist, IsReceptionist
from src.apps.core.serializers import ProfessionalRoleRequestSerializer

User = get_user_model()

pytestmark = pytest.mark.django_db


# ============================================================================
# Model Tests
# ============================================================================


class TestProfessionalRoleRequestModel:
    """Tests for ProfessionalRoleRequest model."""

    def test_create_role_request(self, user: Any) -> None:
        """Test creating a professional role request."""
        # Create a simple PDF file
        pdf_file = SimpleUploadedFile(
            "license.pdf",
            b"fake pdf content",
            content_type="application/pdf",
        )

        request = ProfessionalRoleRequest.objects.create(
            user=user,
            role_requested=ProfessionalRoleRequest.Role.DOCTORS,
            license_number="MD123456",
            license_state="CA",
            specialty="Cardiology",
            reason="Licensed cardiologist",
            license_document=pdf_file,
        )

        assert request.user == user
        assert request.role_requested == "Doctors"
        assert request.license_number == "MD123456"
        assert request.status == ProfessionalRoleRequest.Status.PENDING
        assert request.is_pending is True
        assert request.is_approved is False
        assert request.is_rejected is False

    def test_approve_role_request(self, user: Any, admin_user: Any) -> None:
        """Test approving a role request grants the role."""
        # Create groups
        Group.objects.get_or_create(name="Doctors")

        pdf_file = SimpleUploadedFile("license.pdf", b"content")
        request = ProfessionalRoleRequest.objects.create(
            user=user,
            role_requested=ProfessionalRoleRequest.Role.DOCTORS,
            license_number="MD123456",
            license_state="CA",
            reason="Test",
            license_document=pdf_file,
        )

        # Approve request
        request.approve(reviewer=admin_user, notes="License verified")

        # Refresh from database
        request.refresh_from_db()
        user.refresh_from_db()

        assert request.status == ProfessionalRoleRequest.Status.APPROVED
        assert request.reviewed_by == admin_user
        assert request.reviewed_at is not None
        assert request.review_notes == "License verified"
        assert request.is_approved is True
        assert user.groups.filter(name="Doctors").exists()

    def test_reject_role_request(self, user: Any, admin_user: Any) -> None:
        """Test rejecting a role request."""
        pdf_file = SimpleUploadedFile("license.pdf", b"content")
        request = ProfessionalRoleRequest.objects.create(
            user=user,
            role_requested=ProfessionalRoleRequest.Role.DOCTORS,
            license_number="MD123456",
            license_state="CA",
            reason="Test",
            license_document=pdf_file,
        )

        # Reject request
        request.reject(reviewer=admin_user, reason="License not found")

        # Refresh from database
        request.refresh_from_db()

        assert request.status == ProfessionalRoleRequest.Status.REJECTED
        assert request.reviewed_by == admin_user
        assert request.reviewed_at is not None
        assert request.review_notes == "License not found"
        assert request.is_rejected is True

    def test_str_representation(self, user: Any) -> None:
        """Test string representation of role request."""
        pdf_file = SimpleUploadedFile("license.pdf", b"content")
        request = ProfessionalRoleRequest.objects.create(
            user=user,
            role_requested=ProfessionalRoleRequest.Role.NURSES,
            license_number="RN123456",
            license_state="NY",
            reason="Test",
            license_document=pdf_file,
        )

        expected = f"{user.username} - Nurse (Pending Review)"
        assert str(request) == expected


# ============================================================================
# Permission Tests
# ============================================================================


class TestReceptionistPermission:
    """Tests for IsReceptionist permission class."""

    def test_receptionist_has_permission(self, user: Any) -> None:
        """Test that receptionist user has permission."""
        Group.objects.get_or_create(name="Receptionists")
        user.groups.add(Group.objects.get(name="Receptionists"))

        permission = IsReceptionist()
        request = Mock()
        request.user = user

        assert permission.has_permission(request, cast(Any, None)) is True

    def test_non_receptionist_denied(self, user: Any) -> None:
        """Test that non-receptionist user is denied."""
        permission = IsReceptionist()
        request = Mock()
        request.user = user

        assert permission.has_permission(request, cast(Any, None)) is False


class TestPharmacistPermission:
    """Tests for IsPharmacist permission class."""

    def test_pharmacist_has_permission(self, user: Any) -> None:
        """Test that pharmacist user has permission."""
        Group.objects.get_or_create(name="Pharmacists")
        user.groups.add(Group.objects.get(name="Pharmacists"))

        permission = IsPharmacist()
        request = Mock()
        request.user = user

        assert permission.has_permission(request, cast(Any, None)) is True

    def test_non_pharmacist_denied(self, user: Any) -> None:
        """Test that non-pharmacist user is denied."""
        permission = IsPharmacist()
        request = Mock()
        request.user = user

        assert permission.has_permission(request, cast(Any, None)) is False


# ============================================================================
# Serializer Tests
# ============================================================================


class TestProfessionalRoleRequestSerializer:
    """Tests for ProfessionalRoleRequestSerializer."""

    def test_valid_serialization(self, user: Any) -> None:
        """Test serializing a valid role request."""
        pdf_file = SimpleUploadedFile("license.pdf", b"content")
        request = ProfessionalRoleRequest.objects.create(
            user=user,
            role_requested=ProfessionalRoleRequest.Role.DOCTORS,
            license_number="MD123456",
            license_state="CA",
            specialty="Cardiology",
            reason="Test",
            license_document=pdf_file,
        )

        serializer = ProfessionalRoleRequestSerializer(request)
        data = serializer.data

        assert data["user"] == user.id
        assert data["role_requested"] == "Doctors"
        assert data["license_number"] == "MD123456"
        assert data["user_details"]["username"] == user.username

    def test_file_size_validation(self) -> None:
        """Test that files over 10MB are rejected."""
        # Create a file larger than 10MB
        large_file = SimpleUploadedFile(
            "large.pdf",
            b"x" * (11 * 1024 * 1024),  # 11MB
            content_type="application/pdf",
        )

        serializer = ProfessionalRoleRequestSerializer()
        with pytest.raises(drf_serializers.ValidationError):
            serializer.validate_license_document(large_file)

    def test_file_extension_validation(self) -> None:
        """Test that only PDF/images are accepted."""
        invalid_file = SimpleUploadedFile(
            "document.txt",
            b"text content",
            content_type="text/plain",
        )

        serializer = ProfessionalRoleRequestSerializer()
        with pytest.raises(drf_serializers.ValidationError):
            serializer.validate_license_document(invalid_file)


# ============================================================================
# API Endpoint Tests
# ============================================================================


class TestRoleRequestAPI:
    """Tests for role request API endpoints."""

    def test_request_professional_role_success(self, user: Any) -> None:
        """Test submitting a professional role request."""
        client = APIClient()
        client.force_authenticate(user=user)

        pdf_file = SimpleUploadedFile(
            "license.pdf",
            b"fake pdf content",
            content_type="application/pdf",
        )

        data = {
            "role_requested": "Doctors",
            "license_number": "MD123456",
            "license_state": "CA",
            "specialty": "Cardiology",
            "reason": "Licensed cardiologist",
            "license_document": pdf_file,
        }

        response = client.post(
            "/api/auth/request-professional-role/",
            data,
            format="multipart",
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["role_requested"] == "Doctors"
        assert response.data["status"] == "pending"

    def test_request_professional_role_unauthenticated(self) -> None:
        """Test that unauthenticated users cannot request roles."""
        client = APIClient()

        response = client.post(
            "/api/auth/request-professional-role/",
            {},
        )

        # DRF returns 403 when permission_classes are checked on unauthenticated requests
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_list_role_requests_admin_only(self, user: Any, admin_user: Any) -> None:
        """Test that only admins can list role requests."""
        # Create a request
        pdf_file = SimpleUploadedFile("license.pdf", b"content")
        ProfessionalRoleRequest.objects.create(
            user=user,
            role_requested=ProfessionalRoleRequest.Role.DOCTORS,
            license_number="MD123456",
            license_state="CA",
            reason="Test",
            license_document=pdf_file,
        )

        # Try as regular user
        client = APIClient()
        client.force_authenticate(user=user)
        response = client.get("/api/admin/credential-requests/")
        assert response.status_code == status.HTTP_403_FORBIDDEN

        # Try as admin
        client.force_authenticate(user=admin_user)
        response = client.get("/api/admin/credential-requests/")
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1

    def test_approve_role_request_admin_only(self, user: Any, admin_user: Any) -> None:
        """Test that only admins can approve role requests."""
        Group.objects.get_or_create(name="Doctors")

        pdf_file = SimpleUploadedFile("license.pdf", b"content")
        request = ProfessionalRoleRequest.objects.create(
            user=user,
            role_requested=ProfessionalRoleRequest.Role.DOCTORS,
            license_number="MD123456",
            license_state="CA",
            reason="Test",
            license_document=pdf_file,
        )

        client = APIClient()
        client.force_authenticate(user=admin_user)

        response = client.post(
            f"/api/admin/credential-requests/{request.id}/approve/",
            {"notes": "License verified"},
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["status"] == "approved"

        # Verify user was added to group
        user.refresh_from_db()
        assert user.groups.filter(name="Doctors").exists()

    def test_reject_role_request_requires_reason(
        self, user: Any, admin_user: Any
    ) -> None:
        """Test that rejecting requires a reason."""
        pdf_file = SimpleUploadedFile("license.pdf", b"content")
        request = ProfessionalRoleRequest.objects.create(
            user=user,
            role_requested=ProfessionalRoleRequest.Role.DOCTORS,
            license_number="MD123456",
            license_state="CA",
            reason="Test",
            license_document=pdf_file,
        )

        client = APIClient()
        client.force_authenticate(user=admin_user)

        # Try without reason
        response = client.post(
            f"/api/admin/credential-requests/{request.id}/reject/",
            {},
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

        # Try with reason
        response = client.post(
            f"/api/admin/credential-requests/{request.id}/reject/",
            {"reason": "License not found"},
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["status"] == "rejected"
