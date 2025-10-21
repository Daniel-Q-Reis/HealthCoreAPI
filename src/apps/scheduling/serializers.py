"""
Serializers for the Scheduling API.
"""

from rest_framework import serializers

from .models import Appointment, Patient, Slot


class SlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Slot
        fields = ["id", "practitioner", "start_time", "end_time", "is_booked"]


class AppointmentSerializer(serializers.ModelSerializer):
    patient = serializers.PrimaryKeyRelatedField(queryset=Patient.objects.all())
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

    def to_representation(self, instance):
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
