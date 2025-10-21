"""
Django Admin configuration for the Core app.
"""

from django.contrib import admin

from .models import Post


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
