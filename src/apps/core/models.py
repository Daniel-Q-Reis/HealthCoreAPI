"""Base models and managers for the application."""

import uuid
from datetime import timedelta
from typing import Any, TypeVar

from django.conf import settings
from django.db import models
from django.db.models import QuerySet
from django.utils import timezone

# TypeVar for generic manager - allows proper type inference for child models
_T = TypeVar("_T", bound="ActivatableModel")


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
