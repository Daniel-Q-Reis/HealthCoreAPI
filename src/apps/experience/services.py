"""
Service layer for the Patient Experience bounded context.
"""

from . import repositories
from .models import PatientComplaint, PatientFeedback


def submit_patient_feedback(**data) -> PatientFeedback:
    """
    Business logic to submit patient feedback.
    """
    # (Future) Here you could trigger notifications to a patient experience officer
    return repositories.create_feedback(**data)


def submit_patient_complaint(**data) -> PatientComplaint:
    """
    Business logic to submit a patient complaint.
    """
    # (Future) Here you could trigger a high-priority alert or workflow
    return repositories.create_complaint(**data)
