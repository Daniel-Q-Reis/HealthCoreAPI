"""
Data access layer for Pharmacy.
"""

from typing import Optional

from .models import Dispensation, Medication


def get_medication_by_id(med_id) -> Optional[Medication]:
    return Medication.objects.filter(id=med_id, is_active=True).first()


def create_dispensation(**data) -> Dispensation:
    return Dispensation.objects.create(**data)


def update_stock(medication: Medication, quantity_deducted: int) -> Medication:
    """Updates stock count efficiently."""
    medication.stock_quantity -= quantity_deducted
    medication.save(update_fields=["stock_quantity", "updated_at"])
    return medication
