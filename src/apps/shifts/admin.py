"""
Django Admin configuration for the Shifts & Availability bounded context.
"""

from django.contrib import admin

from .models import Shift


@admin.register(Shift)
class ShiftAdmin(admin.ModelAdmin):
    list_display = ("practitioner", "start_time", "end_time", "role", "is_active")
    list_filter = ("role", "practitioner")
    search_fields = ("practitioner__family_name", "practitioner__license_number")
    autocomplete_fields = ("practitioner",)
