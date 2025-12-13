"""
Data access layer for the Practitioners bounded context.
"""

from typing import Any, Optional, Union

from .models import Practitioner


def get_practitioner_by_id(practitioner_id: Union[int, str]) -> Optional[Practitioner]:
    """Retrieves an active practitioner by their UUID."""
    try:
        return Practitioner.objects.get(id=practitioner_id, is_active=True)
    except Practitioner.DoesNotExist:
        return None


def create_practitioner(**data: Any) -> Practitioner:
    """Creates a new practitioner record."""
    return Practitioner.objects.create(**data)
