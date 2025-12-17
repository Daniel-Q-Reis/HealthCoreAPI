"""Base models and managers for the application."""

import uuid
from datetime import timedelta
from typing import Any, TypeVar

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models
from django.db.models import QuerySet
from django.utils import timezone

# TypeVar for generic manager - allows proper type inference for child models
_T = TypeVar("_T", bound="ActivatableModel")

User = get_user_model()


class BaseManager(models.Manager[_T]):
    """Base manager with common querysets."""

    def active(self) -> QuerySet[_T]:
        """Return only active records."""
        return self.filter(is_active=True)

    def inactive(self) -> QuerySet[_T]:
        """Return only inactive records."""
        return self.filter(is_active=False)

    def recent(self, days: int = 30) -> QuerySet[_T]:
        """Return records created in the last N days."""
        cutoff_date = timezone.now() - timedelta(days=days)
        return self.filter(created_at__gte=cutoff_date)


class TimestampedModel(models.Model):
    """Abstract base model with created/updated timestamps.

    Provides automatic timestamp tracking for all models.
    """

    created_at = models.DateTimeField(
        auto_now_add=True, help_text="Timestamp when the record was created"
    )
    updated_at = models.DateTimeField(
        auto_now=True, help_text="Timestamp when the record was last updated"
    )

    class Meta:
        abstract = True
        ordering = ["-created_at"]


class ActivatableModel(TimestampedModel):
    """Abstract model with soft delete functionality.

    Provides is_active field for soft deletion patterns.
    """

    is_active = models.BooleanField(
        default=True, help_text="Whether this record is active"
    )

    objects = BaseManager["ActivatableModel"]()

    class Meta:
        abstract = True

    def soft_delete(self) -> None:
        """Mark record as inactive instead of deleting."""
        self.is_active = False
        self.save(update_fields=["is_active", "updated_at"])

    def activate(self) -> None:
        """Mark record as active."""
        self.is_active = True
        self.save(update_fields=["is_active", "updated_at"])


class AuthorableModel(TimestampedModel):
    """Abstract model that tracks who created/updated records.

    Useful for audit trails and user activity tracking.
    """

    created_by = models.ForeignKey(
        "auth.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="%(class)s_created",
        help_text="User who created this record",
    )
    updated_by = models.ForeignKey(
        "auth.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="%(class)s_updated",
        help_text="User who last updated this record",
    )

    class Meta:
        abstract = True

    def save(self, *args: Any, **kwargs: Any) -> None:
        """Override save to track user changes."""
        # Note: In real usage, you'd get the user from request context
        # This is a template, so we leave it as a pattern to follow
        super().save(*args, **kwargs)


class SluggedModel(models.Model):
    """Abstract model with automatic slug generation.

    Useful for models that need URL-friendly identifiers.
    """

    slug = models.SlugField(
        max_length=100, unique=True, help_text="URL-friendly identifier"
    )

    class Meta:
        abstract = True

    def save(self, *args: Any, **kwargs: Any) -> None:
        """Auto-generate slug if not provided."""
        if not self.slug and hasattr(self, "name"):
            from django.utils.text import slugify

            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1

            # Ensure unique slug
            while self.__class__.objects.filter(slug=slug).exists():  # type: ignore[attr-defined]
                slug = f"{base_slug}-{counter}"
                counter += 1

            self.slug = slug

        super().save(*args, **kwargs)


class Post(ActivatableModel, SluggedModel):
    """
    Represents a blog post or a similar content type that requires a title,
    body content, an author, and a URL-friendly slug.

    Inherits from:
    - ActivatableModel: for soft-deletion and activity status.
    - SluggedModel: for automatic slug generation from the title.
    """

    title = models.CharField(max_length=255, help_text="The title of the post.")
    content = models.TextField(help_text="The main content of the post.")
    author = models.ForeignKey(
        "auth.User",
        on_delete=models.CASCADE,
        related_name="posts",
        help_text="The user who authored the post.",
    )

    class Meta:
        verbose_name = "Post"
        verbose_name_plural = "Posts"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        """String representation of a Post."""
        return self.title

    @property
    def name(self) -> str:
        """Provides the 'name' property for the SluggedModel to use."""
        return self.title


class IdempotencyKey(models.Model):
    """
    Stores idempotency keys to prevent duplicate operations.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    idempotency_key = models.UUIDField()
    request_path = models.CharField(max_length=255)
    response_code = models.PositiveSmallIntegerField()
    response_body = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Idempotency Key"
        verbose_name_plural = "Idempotency Keys"
        unique_together = ("user", "idempotency_key")


class ProfessionalRoleRequest(TimestampedModel):
    """
    Request for professional role elevation with credential verification.

    This model implements a secure workflow for healthcare professionals to request
    elevated access roles (Doctor, Nurse, Pharmacist, Receptionist). All requests
    require admin approval and document verification to ensure HIPAA compliance.

    Security features:
    - Default deny: All users start as Patient role
    - Document upload required (license, certification, employment verification)
    - Admin review and approval mandatory
    - Complete audit trail with timestamps and reviewer information
    - Status tracking (pending, approved, rejected)

    HIPAA Compliance:
    - § 164.308(a)(4): Access Control - Implements role-based access
    - § 164.312(b): Audit Controls - Complete audit trail
    - § 164.312(d): Person or Entity Authentication - Credential verification

    Usage:
        # User submits request
        request = ProfessionalRoleRequest.objects.create(
            user=user,
            role_requested='Doctors',
            license_number='MD123456',
            license_state='CA',
            specialty='Cardiology',
            reason='Licensed cardiologist at UCLA Health',
            license_document=uploaded_file,
        )

        # Admin approves
        request.approve(admin_user, 'License verified with CA Medical Board')

        # Admin rejects
        request.reject(admin_user, 'License number not found in state database')
    """

    class Status(models.TextChoices):
        """Request status choices."""

        PENDING = "pending", "Pending Review"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    class Role(models.TextChoices):
        """Available professional roles."""

        DOCTORS = "Doctors", "Doctor"
        NURSES = "Nurses", "Nurse"
        PHARMACISTS = "Pharmacists", "Pharmacist"
        RECEPTIONISTS = "Receptionists", "Receptionist"

    # User requesting role elevation
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="role_requests",
        help_text="User requesting professional role",
    )

    # Role being requested
    role_requested = models.CharField(
        max_length=50,
        choices=Role.choices,
        help_text="Professional role being requested",
    )

    # Credential information
    license_number = models.CharField(
        max_length=100, help_text="Professional license number"
    )
    license_state = models.CharField(
        max_length=50, help_text="State/country where license was issued"
    )
    specialty = models.CharField(
        max_length=100,
        blank=True,
        help_text="Medical specialty (for doctors)",
    )
    reason = models.TextField(help_text="Reason for requesting this role")

    # Document uploads (stored in media/credentials/)
    license_document = models.FileField(
        upload_to="credentials/licenses/",
        help_text="Scanned copy of professional license",
    )
    certification_document = models.FileField(
        upload_to="credentials/certs/",
        blank=True,
        help_text="Board certification or additional credentials (optional)",
    )
    employment_verification = models.FileField(
        upload_to="credentials/employment/",
        blank=True,
        help_text="Employment verification letter (optional)",
    )

    # Request status
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        help_text="Current status of the request",
    )

    # Review information (populated when admin reviews)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_role_requests",
        help_text="Admin who reviewed this request",
    )
    reviewed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when request was reviewed",
    )
    review_notes = models.TextField(
        blank=True, help_text="Admin notes about the review decision"
    )

    class Meta:
        verbose_name = "Professional Role Request"
        verbose_name_plural = "Professional Role Requests"
        ordering = ["-created_at"]
        permissions = [
            ("review_role_requests", "Can review professional role requests"),
        ]
        indexes = [
            models.Index(fields=["status", "-created_at"]),
            models.Index(fields=["user", "status"]),
        ]

    def __str__(self) -> str:
        """String representation of the request."""
        return f"{self.user.username} - {self.get_role_requested_display()} ({self.get_status_display()})"

    def approve(self, reviewer: User, notes: str = "") -> None:
        """
        Approve the role request and grant the role to the user.

        Args:
            reviewer: Admin user approving the request
            notes: Optional notes about the approval decision

        Side effects:
            - Adds user to the requested group
            - Updates status to APPROVED
            - Records reviewer and timestamp
            - Saves the model
        """
        from django.contrib.auth.models import Group

        # Grant the role
        group = Group.objects.get(name=self.role_requested)
        self.user.groups.add(group)

        # Update request status
        self.status = self.Status.APPROVED
        self.reviewed_by = reviewer
        self.reviewed_at = timezone.now()
        self.review_notes = notes
        self.save(
            update_fields=[
                "status",
                "reviewed_by",
                "reviewed_at",
                "review_notes",
                "updated_at",
            ]
        )

    def reject(self, reviewer: User, reason: str) -> None:
        """
        Reject the role request.

        Args:
            reviewer: Admin user rejecting the request
            reason: Reason for rejection (required)

        Side effects:
            - Updates status to REJECTED
            - Records reviewer and timestamp
            - Saves the model
        """
        self.status = self.Status.REJECTED
        self.reviewed_by = reviewer
        self.reviewed_at = timezone.now()
        self.review_notes = reason
        self.save(
            update_fields=[
                "status",
                "reviewed_by",
                "reviewed_at",
                "review_notes",
                "updated_at",
            ]
        )

    @property
    def is_pending(self) -> bool:
        """Check if request is still pending review."""
        return self.status == self.Status.PENDING

    @property
    def is_approved(self) -> bool:
        """Check if request was approved."""
        return self.status == self.Status.APPROVED

    @property
    def is_rejected(self) -> bool:
        """Check if request was rejected."""
        return self.status == self.Status.REJECTED
