"""
Django Admin configuration for the Practitioners bounded context.
"""

from django.contrib import admin

from .models import Practitioner


@admin.register(Practitioner)
class PractitionerAdmin(admin.ModelAdmin):
    """
    Admin interface options for the Practitioner model.
    """

    list_display = (
        "license_number",
        "family_name",
        "given_name",
        "role",
        "specialty",
        "is_active",
    )
    search_fields = ("license_number", "family_name", "given_name")
    list_filter = ("role", "specialty", "is_active")
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        (
            "Primary Information",
            {"fields": ("license_number", "given_name", "family_name")},
        ),
        ("Professional Details", {"fields": ("role", "specialty")}),
        ("Status", {"fields": ("is_active", "created_at", "updated_at")}),
    )
