"""
Service layer for the Admissions & Beds bounded context.
"""

from django.db import transaction
from pybreaker import CircuitBreaker

from src.apps.patients.repositories import get_patient_by_id

from . import repositories
from .models import Admission, Bed

# This would typically be a shared, stateful object.
# For simplicity in this MVP, we define it at the module level.
# In a real app, this might be managed in a central registry.
bed_assignment_breaker = CircuitBreaker(fail_max=3, reset_timeout=30)


class BedUnavailableError(Exception):
    pass


class PatientNotFoundError(Exception):
    pass


# This is a decorator that applies the circuit breaker logic.
@bed_assignment_breaker
def _assign_and_occupy_bed(ward_id: str) -> Bed:
    """
    This is now a protected operation. If it fails repeatedly, the breaker will open.
    """
    bed = repositories.find_available_bed_in_ward(ward_id)
    if not bed:
        raise BedUnavailableError(f"No available beds in ward {ward_id}.")

    # Occupy the bed
    repositories.occupy_bed(bed)
    return bed


@transaction.atomic
def admit_patient_to_ward(patient_id: str, ward_id: str) -> Admission:
    """
    Orchestrates the admission of a patient, finding and assigning an available bed.
    The bed assignment part is now protected by a circuit breaker.
    """
    patient = get_patient_by_id(patient_id)
    if not patient:
        raise PatientNotFoundError("Patient with the given ID not found.")

    # The call to assign a bed is now wrapped by the circuit breaker
    bed = _assign_and_occupy_bed(ward_id)

    # Create the admission record and link it to the bed
    admission = repositories.create_admission(patient=patient, bed=bed)

    return admission
