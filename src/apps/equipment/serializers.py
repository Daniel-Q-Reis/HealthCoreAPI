"""
Serializers for Equipment API.
"""

from typing import Any

from rest_framework import serializers

from .models import (
    Equipment,
    EquipmentIncident,
    EquipmentMovement,
    EquipmentReservation,
)


class EquipmentSerializer(serializers.ModelSerializer[Equipment]):
    class Meta:
        model = Equipment
        fields = "__all__"
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]


class EquipmentReservationSerializer(serializers.ModelSerializer[EquipmentReservation]):
    class Meta:
        model = EquipmentReservation
        fields = "__all__"
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
            "status",
        ]


class EquipmentMovementSerializer(serializers.ModelSerializer[EquipmentMovement]):
    actor_name = serializers.CharField(source="actor.username", read_only=True)

    class Meta:
        model = EquipmentMovement
        fields = "__all__"
        read_only_fields = ["id", "timestamp", "actor"]


class EquipmentIncidentSerializer(serializers.ModelSerializer[EquipmentIncident]):
    class Meta:
        model = EquipmentIncident
        fields = "__all__"
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
            "status",
            "resolved_at",
        ]


# Action Serializers
class HandoffSerializer(serializers.Serializer[Any]):
    to_location = serializers.CharField(max_length=255)
    method = serializers.ChoiceField(choices=["SCAN", "MANUAL"], default="SCAN")
    notes = serializers.CharField(required=False, allow_blank=True)


class ReportIncidentSerializer(serializers.Serializer[Any]):
    severity = serializers.ChoiceField(choices=["LOW", "MEDIUM", "HIGH"])
    description = serializers.CharField()


class ReserveSerializer(serializers.Serializer[Any]):
    start_time = serializers.DateTimeField()
    end_time = serializers.DateTimeField()
    purpose = serializers.CharField()
    department_id = serializers.CharField()
