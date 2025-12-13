"""
Serializers for the Admissions & Beds API.
"""

from typing import Any

from rest_framework import serializers

from .models import Admission, Bed, Ward


class WardSerializer(serializers.ModelSerializer[Ward]):
    class Meta:
        model = Ward
        fields = ["id", "name", "capacity"]


class BedSerializer(serializers.ModelSerializer[Bed]):
    ward = WardSerializer(read_only=True)

    class Meta:
        model = Bed
        fields = ["id", "ward", "bed_number", "is_occupied"]


class AdmissionSerializer(serializers.ModelSerializer[Admission]):
    bed = BedSerializer(read_only=True)

    class Meta:
        model = Admission
        fields = ["id", "patient", "bed", "admission_date", "discharge_date", "status"]
        read_only_fields = ["id", "bed", "admission_date", "discharge_date", "status"]


class CreateAdmissionSerializer(serializers.Serializer[Any]):
    patient_id = serializers.IntegerField()
    ward_id = serializers.IntegerField()
