"""
Django Admin configuration for the Scheduling bounded context.
"""

from django.contrib import admin

from .models import Appointment, Slot


@admin.register(Slot)
class SlotAdmin(admin.ModelAdmin):
    """
    Admin interface options for the Slot model.
    """

    list_display = ("practitioner", "start_time", "end_time", "is_booked", "is_active")
    list_filter = ("is_booked", "is_active", "practitioner")
    search_fields = ("practitioner__family_name",)
    autocomplete_fields = ("practitioner",)


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    """
    Admin interface options for the Appointment model.
    """

    list_display = ("patient", "practitioner", "get_slot_time", "status", "is_active")
    list_filter = ("status", "is_active", "practitioner")
    search_fields = (
        "patient__mrn",
        "patient__family_name",
        "practitioner__family_name",
    )
    autocomplete_fields = ("patient", "practitioner", "slot")
    readonly_fields = ("created_at", "updated_at")

    @admin.display(description="Slot Time", ordering="slot__start_time")
    def get_slot_time(self, obj):
        return obj.slot.start_time
