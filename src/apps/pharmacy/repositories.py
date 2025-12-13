"""
Data access layer for Pharmacy.
"""

from typing import Any, Optional, Union

from .models import Dispensation, Medication


def get_medication_by_id(med_id: Union[int, str]) -> Optional[Medication]:
    """Retrieves a medication by ID."""
    return Medication.objects.filter(id=med_id, is_active=True).first()


def create_dispensation(**data: Any) -> Dispensation:
    """Creates a new dispensation record."""
    return Dispensation.objects.create(**data)


def update_stock(medication: Medication, quantity_deducted: int) -> Medication:
    """Updates stock count efficiently."""
    medication.stock_quantity -= quantity_deducted
    medication.save(update_fields=["stock_quantity", "updated_at"])
    return medication
