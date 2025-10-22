"""
Data access layer for the Departments & Specialties bounded context.
"""

from .models import Department


def create_department(**data) -> Department:
    """Creates a new Department record."""
    return Department.objects.create(**data)
