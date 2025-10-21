"""
Django Admin configuration for the Patient Experience bounded context.
"""

from django.contrib import admin

from .models import PatientComplaint, PatientFeedback


@admin.register(PatientFeedback)
class PatientFeedbackAdmin(admin.ModelAdmin):
    list_display = ("patient", "admission", "overall_rating", "created_at")
    list_filter = ("overall_rating",)
    search_fields = ("patient__mrn", "patient__family_name", "comments")
    autocomplete_fields = ("patient", "admission")
    readonly_fields = ("created_at", "updated_at")


@admin.register(PatientComplaint)
class PatientComplaintAdmin(admin.ModelAdmin):
    list_display = ("patient", "category", "status", "created_at")
    list_filter = ("category", "status")
    search_fields = ("patient__mrn", "patient__family_name", "description")
    autocomplete_fields = ("patient", "admission")
    readonly_fields = ("created_at", "updated_at")
    list_editable = ("status",)
