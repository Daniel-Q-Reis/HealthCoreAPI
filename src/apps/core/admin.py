"""
Django Admin configuration for the Core app.
"""

from django.contrib import admin

from .models import IdempotencyKey, Post


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    """
    Admin interface options for the Post model.
    """

    list_display = ("title", "author", "is_active", "created_at")
    search_fields = ("title", "content", "author__username")
    list_filter = ("is_active", "author")
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ("created_at", "updated_at")


@admin.register(IdempotencyKey)
class IdempotencyKeyAdmin(admin.ModelAdmin):
    """
    Admin interface for viewing idempotency keys. Should be read-only.
    """

    list_display = (
        "user",
        "idempotency_key",
        "request_path",
        "response_code",
        "created_at",
    )
    search_fields = ("user__username", "idempotency_key")
    list_filter = ("created_at", "response_code")
    readonly_fields = [f.name for f in IdempotencyKey._meta.get_fields()]
