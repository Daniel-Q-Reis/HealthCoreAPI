"""Admin configuration for core app."""

from typing import Any

from django.contrib import admin
from django.contrib.auth.admin import GroupAdmin as BaseGroupAdmin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group, User
from django.http import HttpRequest

from .models import IdempotencyKey, Post

# Unregister default Group admin to customize it
admin.site.unregister(Group)


@admin.register(Group)
class RoleGroupAdmin(BaseGroupAdmin):
    """
    Custom admin for Django Groups (used as RBAC Roles).

    Displays groups with improved formatting and filtering
    for healthcare role management.
    """

    list_display = ["name", "user_count", "permissions_count"]
    search_fields = ["name"]
    ordering = ["name"]

    def user_count(self, obj: Group) -> int:
        """Display count of users in this role."""
        return obj.user_set.count()

    user_count.short_description = "Users"  # type: ignore[attr-defined]

    def permissions_count(self, obj: Group) -> int:
        """Display count of permissions assigned to this role."""
        return obj.permissions.count()

    permissions_count.short_description = "Permissions"  # type: ignore[attr-defined]


# Unregister default User admin to customize it
admin.site.unregister(User)


@admin.register(User)
class CustomUserAdmin(BaseUserAdmin):  # type: ignore[type-arg]
    """
    Custom User admin with RBAC role management.

    Adds role display and inline editing for easier
    healthcare staff management.
    """

    list_display = [
        "username",
        "email",
        "first_name",
        "last_name",
        "get_roles",
        "is_staff",
        "is_active",
        "date_joined",
    ]
    list_filter = ["is_staff", "is_superuser", "is_active", "groups"]
    search_fields = ["username", "email", "first_name", "last_name"]
    ordering = ["-date_joined"]

    def get_roles(self, obj: User) -> str:
        """Display user's roles as comma-separated list."""
        roles = obj.groups.values_list("name", flat=True)
        return ", ".join(roles) if roles else "No roles"

    get_roles.short_description = "Roles"  # type: ignore[attr-defined]


@admin.register(Post)
class PostAdmin(admin.ModelAdmin[Post]):
    """
    Admin configuration for Post model.
    """

    list_display = ["title", "author", "slug", "is_active", "created_at", "updated_at"]
    list_filter = ["is_active", "created_at", "author"]
    search_fields = ["title", "content", "slug"]
    readonly_fields = ["slug", "created_at", "updated_at"]
    prepopulated_fields = {}  # Slug auto-generated in save()

    fieldsets = (
        ("Content", {"fields": ("title", "content", "author")}),
        (
            "Metadata",
            {
                "fields": ("slug", "is_active", "created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
    )


@admin.register(IdempotencyKey)
class IdempotencyKeyAdmin(admin.ModelAdmin[IdempotencyKey]):
    """
    Admin configuration for IdempotencyKey model (read-only).

    Allows viewing idempotency records for debugging but prevents
    manual modifications to ensure data integrity.
    """

    list_display = [
        "idempotency_key",
        "user",
        "request_path",
        "response_code",
        "created_at",
    ]
    list_filter = ["response_code", "created_at", "user"]
    search_fields = ["idempotency_key", "request_path", "user__username"]
    readonly_fields = [
        "idempotency_key",
        "user",
        "request_path",
        "response_code",
        "response_body",
        "created_at",
    ]
    ordering = ["-created_at"]

    def has_add_permission(self, request: HttpRequest) -> bool:
        """Disable manual creation of idempotency keys."""
        return False

    def has_delete_permission(self, request: HttpRequest, obj: Any = None) -> bool:
        """Allow deletion for cleanup."""
        return True

    def has_change_permission(self, request: HttpRequest, obj: Any = None) -> bool:
        """Disable editing of idempotency keys."""
        return False


# Customize admin site header and title
admin.site.site_header = "HealthCore API Administration"
admin.site.site_title = "HealthCore Admin"
admin.site.index_title = "Welcome to HealthCore API Admin Panel"
