"""
Serializers for Pharmacy API.
"""

from typing import Any

from rest_framework import serializers

from .models import Dispensation, Medication


class MedicationSerializer(serializers.ModelSerializer[Medication]):
    class Meta:
        model = Medication
        fields = [
            "id",
            "name",
            "brand",
            "sku",
            "description",
            "batch_number",
            "expiry_date",
            "stock_quantity",
            "is_active",
        ]
        read_only_fields = ["id", "is_active"]


class DispensationSerializer(serializers.ModelSerializer[Dispensation]):
    class Meta:
        model = Dispensation
        fields = [
            "id",
            "medication",
            "patient",
            "practitioner",
            "quantity",
            "notes",
            "dispensed_at",
        ]
        read_only_fields = ["id", "dispensed_at"]


class CreateDispensationSerializer(serializers.Serializer[Any]):
    medication_id = serializers.IntegerField()
    patient_id = serializers.IntegerField()
    practitioner_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)
    notes = serializers.CharField(required=False, allow_blank=True)
