"""
Data access layer for the Patient Experience bounded context.
"""

from .models import PatientComplaint, PatientFeedback


def create_feedback(**data) -> PatientFeedback:
    """Creates a new PatientFeedback record."""
    return PatientFeedback.objects.create(**data)


def create_complaint(**data) -> PatientComplaint:
    """Creates a new PatientComplaint record."""
    return PatientComplaint.objects.create(**data)
