"""
Service layer for the Practitioners bounded context.
"""

from . import repositories
from .models import Practitioner


def register_new_practitioner(**data) -> Practitioner:
    """
    Business logic to register a new practitioner.
    """
    practitioner = repositories.create_practitioner(**data)
    return practitioner
