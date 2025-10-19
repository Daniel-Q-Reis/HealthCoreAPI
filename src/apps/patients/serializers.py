"""
Serializers for the Patients API.
"""

from rest_framework import serializers

from .models import Patient


class PatientSerializer(serializers.ModelSerializer):
    """
    Serializer for the Patient model, handling validation and representation.
    """

    class Meta:
        model = Patient
        fields = [
            "id",
            "mrn",
            "given_name",
            "family_name",
            "birth_date",
            "sex",
            "phone_number",
            "email",
            "blood_type",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "is_active", "created_at", "updated_at"]
