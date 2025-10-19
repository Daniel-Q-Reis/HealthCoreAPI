"""
Data access layer for the Patients bounded context.
Follows the Repository Pattern to decouple business logic from data access details.
"""

from typing import Optional, Union

from .models import Patient


def get_patient_by_id(patient_id: Union[int, str]) -> Optional[Patient]:
    """Retrieves a patient by their UUID."""
    try:
        return Patient.objects.get(id=patient_id, is_active=True)
    except Patient.DoesNotExist:
        return None


def create_patient(**data) -> Patient:
    """Creates a new patient record."""
    return Patient.objects.create(**data)
