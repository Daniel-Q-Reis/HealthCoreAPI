"""
Serializers for the Patient Experience API.
"""

from rest_framework import serializers

from .models import PatientComplaint, PatientFeedback


class PatientFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientFeedback
        fields = [
            "id",
            "patient",
            "admission",
            "overall_rating",
            "comments",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class PatientComplaintSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientComplaint
        fields = [
            "id",
            "patient",
            "admission",
            "category",
            "description",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "status", "created_at"]
