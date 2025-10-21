"""
Service layer for the Admissions & Beds bounded context.
"""

from django.db import transaction

from src.apps.patients.repositories import get_patient_by_id

from . import repositories
from .models import Admission


class BedUnavailableError(Exception):
    pass


class PatientNotFoundError(Exception):
    pass


@transaction.atomic
def admit_patient_to_ward(patient_id: str, ward_id: str) -> Admission:
    """
    Orchestrates the admission of a patient, finding and assigning an available bed.
    """
    patient = get_patient_by_id(patient_id)
    if not patient:
        raise PatientNotFoundError("Patient with the given ID not found.")

    bed = repositories.find_available_bed_in_ward(ward_id)
    if not bed:
        raise BedUnavailableError(f"No available beds in ward {ward_id}.")

    # Occupy the bed
    repositories.occupy_bed(bed)

    # Create the admission record and link it to the bed
    admission = repositories.create_admission(patient=patient, bed=bed)

    return admission
