"""
Service layer for Pharmacy. Handles stock logic and alerts.
"""

import logging

from django.db import transaction

from src.apps.patients.repositories import get_patient_by_id
from src.apps.practitioners.repositories import get_practitioner_by_id

from . import repositories

logger = logging.getLogger(__name__)


class PharmacyError(Exception):
    pass


@transaction.atomic
def dispense_medication(
    medication_id: int,
    patient_id: int,
    practitioner_id: int,
    quantity: int,
    notes: str = "",
):
    """
    Dispenses medication, updates stock, and logs the event.
    Triggers alerts if stock falls below thresholds.
    """
    # 1. Validation
    medication = repositories.get_medication_by_id(medication_id)
    if not medication:
        raise PharmacyError("Medication not found.")

    if medication.is_expired:
        raise PharmacyError(
            f"Medication {medication.sku} is expired (Expiry: {medication.expiry_date}). Cannot dispense."
        )

    if medication.stock_quantity < quantity:
        raise PharmacyError(
            f"Insufficient stock. Available: {medication.stock_quantity}, Requested: {quantity}"
        )

    patient = get_patient_by_id(patient_id)
    if not patient:
        raise PharmacyError("Patient not found.")

    practitioner = get_practitioner_by_id(practitioner_id)
    if not practitioner:
        raise PharmacyError("Practitioner not found.")

    # 2. Update Stock
    medication = repositories.update_stock(medication, quantity)

    # 3. Create Audit Record
    dispensation = repositories.create_dispensation(
        medication=medication,
        patient=patient,
        practitioner=practitioner,
        quantity=quantity,
        notes=notes,
    )

    # 4. Check Thresholds & Alert
    # In a real app, this would send an email/slack via Celery tasks.
    # For MVP, we log WARNINGs which Sentry would pick up.
    if medication.stock_quantity < 25:
        logger.critical(
            f"STOCK CRITICAL ALERT: {medication.name} (SKU: {medication.sku}) is below 25 units! Current: {medication.stock_quantity}"
        )
    elif medication.stock_quantity < 50:
        logger.warning(
            f"STOCK LOW ALERT: {medication.name} (SKU: {medication.sku}) is below 50 units. Current: {medication.stock_quantity}"
        )

    return dispensation
