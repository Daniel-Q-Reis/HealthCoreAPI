"""Admin interface for Clinical Orders."""

from django.contrib import admin

from .models import ClinicalOrder


@admin.register(ClinicalOrder)
class ClinicalOrderAdmin(admin.ModelAdmin[ClinicalOrder]):
    """Admin interface for ClinicalOrder model."""

    list_display = (
        "id",
        "code",
        "patient",
        "requester",
        "status",
        "priority",
        "requested_date",
        "created_at",
    )
    list_filter = ("status", "priority", "category", "created_at")
    search_fields = (
        "code",
        "description",
        "patient__given_name",
        "patient__family_name",
    )
    raw_id_fields = ("patient", "requester", "target_department")
    date_hierarchy = "created_at"
    readonly_fields = ("created_at", "updated_at", "created_by", "updated_by")

    fieldsets = (
        (
            "Order Information",
            {
                "fields": (
                    "code",
                    "description",
                    "category",
                    "status",
                    "priority",
                )
            },
        ),
        (
            "Participants",
            {
                "fields": (
                    "patient",
                    "requester",
                    "target_department",
                )
            },
        ),
        (
            "Clinical Details",
            {
                "fields": (
                    "requested_date",
                    "reason",
                    "notes",
                )
            },
        ),
        (
            "Metadata",
            {
                "fields": (
                    "is_active",
                    "created_at",
                    "updated_at",
                    "created_by",
                    "updated_by",
                ),
                "classes": ("collapse",),
            },
        ),
    )
