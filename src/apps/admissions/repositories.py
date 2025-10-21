"""
Data access layer for the Admissions & Beds bounded context.
"""

from typing import Optional

from .models import Admission, Bed


def find_available_bed_in_ward(ward_id: str) -> Optional[Bed]:
    """Finds the first available (active and not occupied) bed in a given ward."""
    return Bed.objects.filter(
        ward_id=ward_id, is_active=True, is_occupied=False
    ).first()


def create_admission(patient, bed: Optional[Bed] = None) -> Admission:
    """Creates an admission record for a patient."""
    return Admission.objects.create(patient=patient, bed=bed)


def occupy_bed(bed: Bed):
    """Marks a bed as occupied."""
    bed.is_occupied = True
    bed.save(update_fields=["is_occupied", "updated_at"])
