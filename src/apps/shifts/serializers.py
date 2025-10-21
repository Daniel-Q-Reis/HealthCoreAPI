"""
Serializers for the Shifts & Availability API.
"""

from rest_framework import serializers

from .models import Shift


class ShiftSerializer(serializers.ModelSerializer):
    practitioner_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Shift
        fields = [
            "id",
            "practitioner",
            "practitioner_id",
            "start_time",
            "end_time",
            "role",
        ]
        read_only_fields = ["id", "practitioner"]

    def validate(self, data):
        """
        Check that start is before end.
        """
        if data["start_time"] >= data["end_time"]:
            raise serializers.ValidationError("End time must be after start time.")
        return data
