"""
Serializers for Clinical Orders API.
"""

from rest_framework import serializers

from .models import ClinicalOrder


class ClinicalOrderSerializer(serializers.ModelSerializer):
    """Serializer for ClinicalOrder with related data."""

    patient_name = serializers.CharField(
        source="patient.given_name", read_only=True
    )  # Simplified - adjust based on Patient model
    requester_name = serializers.SerializerMethodField()
    department_name = serializers.CharField(
        source="target_department.name", read_only=True
    )

    class Meta:
        model = ClinicalOrder
        fields = [
            "id",
            "patient",
            "patient_name",
            "requester",
            "requester_name",
            "target_department",
            "department_name",
            "category",
            "code",
            "description",
            "status",
            "priority",
            "requested_date",
            "reason",
            "notes",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_requester_name(self, obj: ClinicalOrder) -> str:
        """Get full name of requesting practitioner."""
        return f"{obj.requester.given_name} {obj.requester.family_name}"


class CreateClinicalOrderSerializer(serializers.Serializer):
    """Serializer for creating clinical orders."""

    patient_id = serializers.IntegerField(required=True)
    requester_id = serializers.IntegerField(required=True)
    code = serializers.CharField(max_length=255, required=True)
    description = serializers.CharField(max_length=500, required=True)
    requested_date = serializers.DateTimeField(required=True)
    category = serializers.ChoiceField(
        choices=["LAB", "IMAGING", "PROCEDURE", "REFERRAL"], default="LAB"
    )
    priority = serializers.ChoiceField(
        choices=["ROUTINE", "URGENT", "ASAP", "STAT"], default="ROUTINE"
    )
    target_department_id = serializers.IntegerField(required=False, allow_null=True)
    reason = serializers.CharField(required=False, allow_blank=True, default="")
    notes = serializers.CharField(required=False, allow_blank=True, default="")
