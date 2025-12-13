"""
Django Admin configuration for the Admissions & Beds bounded context.
"""

from django.contrib import admin

from .models import Admission, Bed, Ward


@admin.register(Ward)
class WardAdmin(admin.ModelAdmin[Ward]):
    list_display = ("name", "capacity", "is_active")
    search_fields = ("name",)


@admin.register(Bed)
class BedAdmin(admin.ModelAdmin[Bed]):
    list_display = ("bed_number", "ward", "is_occupied", "is_active")
    list_filter = ("ward", "is_occupied", "is_active")
    search_fields = ("bed_number", "ward__name")
    autocomplete_fields = ("ward",)


@admin.register(Admission)
class AdmissionAdmin(admin.ModelAdmin[Admission]):
    list_display = ("patient", "bed", "status", "admission_date", "discharge_date")
    list_filter = ("status", "bed__ward")
    search_fields = ("patient__mrn", "patient__family_name")
    autocomplete_fields = ("patient", "bed")
    readonly_fields = ("admission_date", "discharge_date")
