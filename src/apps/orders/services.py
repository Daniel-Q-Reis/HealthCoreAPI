"""
Service layer for Clinical Orders.
Business logic and validation for order creation and lifecycle.
"""

from datetime import timedelta
from typing import Any, Optional

from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from src.apps.departments.models import Department
from src.apps.patients.models import Patient
from src.apps.practitioners.models import Practitioner

from . import repositories
from .models import ClinicalOrder, OrderStatus


class ServiceValidationError(ValidationError):
    """Custom exception for service layer validation errors."""

    pass


def get_department_by_id(department_id: int) -> Optional[Department]:
    """Get department by ID - helper function."""
    try:
        return Department.objects.get(id=department_id)
    except Department.DoesNotExist:
        return None


def get_patient_for_order(patient_id: int) -> Patient:
    """
    Get patient for order creation.
    Uses direct query WITHOUT is_active filter to properly detect inactive patients.
    """
    try:
        return Patient.objects.get(id=patient_id)
    except Patient.DoesNotExist:
        raise ServiceValidationError(
            f"Patient with ID {patient_id} does not exist."
        ) from None


def get_practitioner_for_order(practitioner_id: int) -> Practitioner:
    """
    Get practitioner for order creation.
    Uses direct query WITHOUT is_active filter to properly detect inactive practitioners.
    """
    try:
        return Practitioner.objects.get(id=practitioner_id)
    except Practitioner.DoesNotExist:
        raise ServiceValidationError(
            f"Practitioner with ID {practitioner_id} does not exist."
        ) from None


def create_clinical_order(
    *,
    patient_id: int,
    requester_id: int,
    code: str,
    description: str,
    requested_date: Any,
    category: str = "LAB",
    priority: str = "ROUTINE",
    target_department_id: Optional[int] = None,
    reason: str = "",
    notes: str = "",
    created_by: Any = None,
) -> ClinicalOrder:
    """
    Create a new clinical order with comprehensive validation.
    """
    # Validate patient exists (using direct query)
    patient = get_patient_for_order(patient_id)

    # Check if patient is inactive
    if not patient.is_active:
        raise ServiceValidationError(
            "Cannot create orders for inactive or discharged patients."
        )

    # Validate requester exists (using direct query)
    requester = get_practitioner_for_order(requester_id)

    # Check if practitioner is inactive
    if not requester.is_active:
        raise ServiceValidationError(
            "Cannot create orders from inactive practitioners."
        )

    # Validate department if specified
    target_department = None
    if target_department_id:
        target_department = get_department_by_id(target_department_id)
        if not target_department:
            raise ServiceValidationError(
                f"Department with ID {target_department_id} does not exist."
            )

    # Business Rule: Cannot create orders for past dates (allow 1h buffer for timezone issues)
    if requested_date < timezone.now() - timedelta(hours=1):
        raise ServiceValidationError(
            "Requested date cannot be in the past. Please select a future date."
        )

    # Create order within transaction
    with transaction.atomic():
        order = repositories.create_order(
            patient=patient,
            requester=requester,
            target_department=target_department,
            code=code,
            description=description,
            category=category,
            priority=priority,
            requested_date=requested_date,
            reason=reason,
            notes=notes,
            status=OrderStatus.ACTIVE,
            created_by=created_by,
        )

        # Future: Trigger notification to department
        # Future: Create audit log entry

    return order


def update_order_status(
    order: ClinicalOrder, new_status: str, actor: Any = None
) -> ClinicalOrder:
    """
    Update order status with state transition validation.

    Args:
        order: ClinicalOrder to update
        new_status: New status to set
        actor: User performing the update

    Returns:
        Updated ClinicalOrder

    Raises:
        ServiceValidationError: If transition is invalid
    """
    # Business Rules for status transitions
    if order.status == OrderStatus.CANCELLED:
        if new_status != OrderStatus.ENTERED_IN_ERROR:
            raise ServiceValidationError(
                "Cannot modify a cancelled order except to mark as error."
            )

    if order.status == OrderStatus.COMPLETED:
        if new_status not in [OrderStatus.ENTERED_IN_ERROR, OrderStatus.CANCELLED]:
            raise ServiceValidationError(
                "Cannot modify a completed order except to mark as error or cancel."
            )

    if order.status == OrderStatus.ENTERED_IN_ERROR:
        raise ServiceValidationError("Cannot modify an order marked as error.")

    # Update status
    order.status = new_status
    if actor:
        order.updated_by = actor
    order.save()

    return order


def cancel_order(order: ClinicalOrder, actor: Any = None) -> ClinicalOrder:
    """
    Cancel a clinical order.

    Args:
        order: Order to cancel
        actor: User performing cancellation

    Returns:
        Cancelled order

    Raises:
        ServiceValidationError: If order cannot be cancelled
    """
    if order.status in [OrderStatus.COMPLETED, OrderStatus.ENTERED_IN_ERROR]:
        raise ServiceValidationError(f"Cannot cancel order in {order.status} status.")

    return update_order_status(order, OrderStatus.CANCELLED, actor)
