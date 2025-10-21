"""
Django Admin configuration for the Patients bounded context.
"""

from django.contrib import admin

from .models import Patient


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    """
    Admin interface options for the Patient model.
    """

    list_display = (
        "mrn",
        "family_name",
        "given_name",
        "birth_date",
        "sex",
        "is_active",
        "created_at",
    )
    search_fields = ("mrn", "family_name", "given_name")
    list_filter = ("sex", "is_active", "created_at")
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        (
            "Primary Information",
            {"fields": ("mrn", "given_name", "family_name", "birth_date", "sex")},
        ),
        ("Contact Information", {"fields": ("phone_number", "email")}),
        ("Medical Information", {"fields": ("blood_type",)}),
        ("Status", {"fields": ("is_active", "created_at", "updated_at")}),
    )
