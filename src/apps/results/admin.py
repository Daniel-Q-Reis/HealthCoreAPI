"""
Django Admin configuration for the Results & Imaging bounded context.
"""

from django.contrib import admin

from .models import DiagnosticReport, Observation


class ObservationInline(admin.TabularInline):
    model = Observation
    extra = 1


@admin.register(DiagnosticReport)
class DiagnosticReportAdmin(admin.ModelAdmin):
    list_display = ("patient", "performer", "status", "issued_at")
    list_filter = ("status", "performer")
    search_fields = ("patient__mrn", "patient__family_name", "conclusion")
    autocomplete_fields = ("patient", "performer")
    inlines = [ObservationInline]
    readonly_fields = ("issued_at", "created_at", "updated_at")


@admin.register(Observation)
class ObservationAdmin(admin.ModelAdmin):
    list_display = ("report", "code", "value_text")
    search_fields = ("code", "value_text", "report__patient__mrn")
    autocomplete_fields = ("report",)
