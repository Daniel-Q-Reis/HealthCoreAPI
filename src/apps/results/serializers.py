"""
Serializers for the Results & Imaging API.
"""

from typing import Any

from rest_framework import serializers

from .models import DiagnosticReport, Observation


class ObservationSerializer(serializers.ModelSerializer[Observation]):
    class Meta:
        model = Observation
        fields = ["id", "code", "value_text"]


class DiagnosticReportSerializer(serializers.ModelSerializer[DiagnosticReport]):
    observations = ObservationSerializer(many=True, read_only=True)

    class Meta:
        model = DiagnosticReport
        fields = [
            "id",
            "patient",
            "performer",
            "status",
            "conclusion",
            "issued_at",
            "observations",
        ]
        read_only_fields = ["id", "patient", "performer", "issued_at", "observations"]


class CreateObservationSerializer(serializers.Serializer[Any]):
    code = serializers.CharField(max_length=100)
    value_text = serializers.CharField(max_length=255)


class CreateDiagnosticReportSerializer(serializers.Serializer[Any]):
    patient_id = serializers.IntegerField()
    performer_id = serializers.IntegerField()
    conclusion = serializers.CharField()
    observations = CreateObservationSerializer(many=True)
    status = serializers.CharField(max_length=50, required=False)
