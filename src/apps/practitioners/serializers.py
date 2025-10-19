"""
Serializers for the Practitioners API.
"""

from rest_framework import serializers

from .models import Practitioner


class PractitionerSerializer(serializers.ModelSerializer):
    """
    Serializer for the Practitioner model.
    """

    class Meta:
        model = Practitioner
        fields = [
            "id",
            "license_number",
            "given_name",
            "family_name",
            "role",
            "specialty",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "is_active", "created_at", "updated_at"]
