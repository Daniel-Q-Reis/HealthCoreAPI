"""
Serializers for the Results & Imaging API.
"""

from rest_framework import serializers

from .models import DiagnosticReport, Observation


class ObservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Observation
        fields = ["id", "code", "value_text"]


class DiagnosticReportSerializer(serializers.ModelSerializer):
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


class CreateObservationSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=100)
    value_text = serializers.CharField(max_length=255)


class CreateDiagnosticReportSerializer(serializers.Serializer):
    patient_id = serializers.IntegerField()
    performer_id = serializers.IntegerField()
    conclusion = serializers.CharField()
    observations = CreateObservationSerializer(many=True, min_length=1)
    status = serializers.CharField(max_length=50, required=False)
