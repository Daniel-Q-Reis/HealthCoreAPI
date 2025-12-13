"""
Data access layer for the Departments & Specialties bounded context.
"""

from typing import Any

from .models import Department


def create_department(**data: Any) -> Department:
    """Creates a new Department record."""
    return Department.objects.create(**data)
