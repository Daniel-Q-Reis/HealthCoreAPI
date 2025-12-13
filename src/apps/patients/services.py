"""
Service layer for the Patients bounded context.
Encapsulates business logic and orchestrates operations.
"""

from typing import Any

from . import repositories
from .models import Patient


def register_new_patient(
    mrn: str,
    given_name: str,
    family_name: str,
    birth_date: str,
    sex: str,
    **kwargs: Any,
) -> Patient:
    """
    Business logic to register a new patient.
    - Validates input
    - Calls repository to create the patient
    - (Future) Dispatches domain events
    """
    # Business validation can be added here (e.g., check for duplicate MRN)
    patient_data = {
        "mrn": mrn,
        "given_name": given_name,
        "family_name": family_name,
        "birth_date": birth_date,
        "sex": sex,
        **kwargs,
    }
    patient = repositories.create_patient(**patient_data)
    # logger.info(f"New patient registered: {patient.id}")
    return patient
