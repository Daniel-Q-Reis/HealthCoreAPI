from django.contrib import admin

from .models import Dispensation, Medication


@admin.register(Medication)
class MedicationAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "brand",
        "sku",
        "expiry_date",
        "stock_quantity",
        "is_expired",
        "is_active",
    )
    search_fields = ("name", "sku", "brand")
    list_filter = ("expiry_date", "is_active")
    readonly_fields = ("created_at", "updated_at")


@admin.register(Dispensation)
class DispensationAdmin(admin.ModelAdmin):
    list_display = ("medication", "patient", "practitioner", "quantity", "dispensed_at")
    list_filter = ("dispensed_at",)
    search_fields = ("medication__name", "patient__mrn", "practitioner__family_name")
    autocomplete_fields = ("medication", "patient", "practitioner")
    readonly_fields = ("dispensed_at",)
