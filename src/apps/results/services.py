"""
Service layer for the Results & Imaging bounded context.
"""

from django.db import transaction

from src.apps.patients.repositories import get_patient_by_id
from src.apps.practitioners.repositories import get_practitioner_by_id

from . import repositories
from .models import DiagnosticReport


class ServiceValidationError(Exception):
    pass


@transaction.atomic
def create_diagnostic_report(
    patient_id: str,
    performer_id: str,
    conclusion: str,
    observations: list[dict[str, str]],
    status: str = "final",
) -> DiagnosticReport:
    """
    Orchestrates the creation of a diagnostic report and its associated observations.
    Ensures that patient and practitioner exist.
    """
    patient = get_patient_by_id(patient_id)
    if not patient:
        raise ServiceValidationError("Patient not found.")

    performer = get_practitioner_by_id(performer_id)
    if not performer:
        raise ServiceValidationError("Performer (Practitioner) not found.")

    if not observations:
        raise ServiceValidationError("A report must have at least one observation.")

    report_data = {
        "patient": patient,
        "performer": performer,
        "conclusion": conclusion,
        "status": status,
        "observations": observations,
    }

    report = repositories.create_report(**report_data)
    return report
