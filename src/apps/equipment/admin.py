from django.contrib import admin

from .models import (
    Equipment,
    EquipmentIncident,
    EquipmentMovement,
)


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ("name", "serial_number", "type", "status", "current_location")
    list_filter = ("status", "type")
    search_fields = ("name", "serial_number", "qr_code")


@admin.register(EquipmentMovement)
class MovementAdmin(admin.ModelAdmin):
    list_display = ("equipment", "from_location", "to_location", "actor", "timestamp")
    readonly_fields = ("timestamp",)


@admin.register(EquipmentIncident)
class IncidentAdmin(admin.ModelAdmin):
    list_display = ("equipment", "severity", "status", "created_by")
    list_filter = ("severity", "status")
