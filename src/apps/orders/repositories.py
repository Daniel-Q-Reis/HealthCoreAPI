"""
Repository layer for Clinical Orders.
Data access abstraction following project patterns.
"""

from typing import Any, Optional

from .models import ClinicalOrder


def get_order_by_id(order_id: int) -> Optional[ClinicalOrder]:
    """Retrieve an order by ID."""
    try:
        return ClinicalOrder.objects.get(id=order_id)
    except ClinicalOrder.DoesNotExist:
        return None


def create_order(**data: Any) -> ClinicalOrder:
    """Create a new clinical order."""
    return ClinicalOrder.objects.create(**data)


def get_orders_by_patient(patient_id: int) -> list[ClinicalOrder]:
    """Get all orders for a specific patient."""
    return list(
        ClinicalOrder.objects.filter(patient_id=patient_id).select_related(
            "patient", "requester", "target_department"
        )
    )


def get_orders_by_requester(practitioner_id: int) -> list[ClinicalOrder]:
    """Get all orders requested by a specific practitioner."""
    return list(
        ClinicalOrder.objects.filter(requester_id=practitioner_id).select_related(
            "patient", "requester", "target_department"
        )
    )


def get_pending_orders_by_department(department_id: int) -> list[ClinicalOrder]:
    """Get pending orders for a specific department."""
    return list(
        ClinicalOrder.objects.filter(
            target_department_id=department_id, status__in=["ACTIVE", "URGENT"]
        )
        .select_related("patient", "requester", "target_department")
        .order_by("-priority", "requested_date")
    )
