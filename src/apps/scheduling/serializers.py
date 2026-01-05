"""
Serializers for the Scheduling API.
"""

from typing import Any

from rest_framework import serializers

from src.apps.patients.models import Patient

from .models import Appointment, Slot


class SlotSerializer(serializers.ModelSerializer[Slot]):
    class Meta:
        model = Slot
        fields = ["id", "practitioner", "start_time", "end_time", "is_booked"]


class AppointmentSerializer(serializers.ModelSerializer[Appointment]):
    # Patient is optional in input (inferred from user if missing), required in model
    patient = serializers.PrimaryKeyRelatedField(
        queryset=Patient.objects.all(), required=False, allow_null=True
    )
    slot = serializers.PrimaryKeyRelatedField(queryset=Slot.objects.all())

    class Meta:
        model = Appointment
        fields = [
            "id",
            "patient",
            "practitioner",
            "slot",
            "status",
            "notes",
        ]
        read_only_fields = ["id", "practitioner", "status"]

    def to_representation(self, instance: Appointment) -> dict[str, Any]:
        # Provide a nested representation for read operations
        representation = super().to_representation(instance)
        # Replace slot ID with full slot object using SlotSerializer
        if instance.slot:
            representation["slot"] = SlotSerializer(instance.slot).data
        # Replace patient ID with full patient object if needed
        if instance.patient:
            from src.apps.patients.serializers import PatientSerializer

            representation["patient"] = PatientSerializer(instance.patient).data
        # Replace practitioner ID with full practitioner object if needed
        if instance.practitioner:
            from src.apps.practitioners.serializers import PractitionerSerializer

            representation["practitioner"] = PractitionerSerializer(
                instance.practitioner
            ).data
        return representation

    def create(self, validated_data: dict[str, Any]) -> Appointment:
        """
        Override create to automatically set practitioner from slot.
        """
        slot = validated_data.get("slot")
        if slot and slot.practitioner:
            validated_data["practitioner"] = slot.practitioner
        return super().create(validated_data)
