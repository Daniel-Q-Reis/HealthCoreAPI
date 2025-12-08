"""
Service layer for Equipment. Handles atomic handoffs and maintenance triggers.
"""

from django.core.exceptions import ValidationError
from django.db import transaction

from .models import (
    Equipment,
    EquipmentIncident,
    EquipmentMovement,
    EquipmentReservation,
    EquipmentStatus,
)


def record_handoff(
    *, equipment: Equipment, to_location: str, actor, method="SCAN", notes=""
) -> EquipmentMovement:
    """
    Moves equipment to a new location.
    Logic: If lost, mark available. Update location. Log movement.
    """
    with transaction.atomic():
        from_location = equipment.current_location

        # Update Equipment State
        equipment.current_location = to_location
        if equipment.status == EquipmentStatus.LOST:
            equipment.status = EquipmentStatus.AVAILABLE
        equipment.save()

        # Create Audit Log
        movement = EquipmentMovement.objects.create(
            equipment=equipment,
            from_location=from_location,
            to_location=to_location,
            actor=actor,
            method=method,
            notes=notes,
        )
        return movement


def report_incident(
    *, equipment: Equipment, reporter, severity: str, description: str
) -> EquipmentIncident:
    """
    Reports an incident.
    Logic: High severity immediately marks equipment as MAINTENANCE.
    """
    with transaction.atomic():
        incident = EquipmentIncident.objects.create(
            equipment=equipment,
            created_by=reporter,
            severity=severity,
            description=description,
        )

        if severity == "HIGH":
            equipment.status = EquipmentStatus.MAINTENANCE
            equipment.save()

        return incident


def reserve_equipment(
    *, equipment: Equipment, requester, start_time, end_time, purpose, department_id
) -> EquipmentReservation:
    """
    Reserves equipment.
    Logic: Check for overlap. Check if equipment is usable.
    """
    if equipment.status in [EquipmentStatus.MAINTENANCE, EquipmentStatus.LOST]:
        raise ValidationError(f"Cannot reserve equipment in status {equipment.status}")

    if start_time >= end_time:
        raise ValidationError("End time must be after start time")

    # Overlap check: (StartA < EndB) and (EndA > StartB)
    overlap = EquipmentReservation.objects.filter(
        equipment=equipment,
        status="ACTIVE",
        start_time__lt=end_time,
        end_time__gt=start_time,
    ).exists()

    if overlap:
        raise ValidationError("Equipment is already reserved for this time slot.")

    return EquipmentReservation.objects.create(
        equipment=equipment,
        requester=requester,
        start_time=start_time,
        end_time=end_time,
        purpose=purpose,
        department_id=department_id,
        status="ACTIVE",
    )
