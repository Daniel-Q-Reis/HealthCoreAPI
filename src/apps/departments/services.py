"""
Service layer for the Departments & Specialties bounded context.
"""

from . import repositories
from .models import Department


def create_new_department(name: str, description: str = "") -> Department:
    """
    Business logic to create a new department.
    """
    # Potential validation: check for duplicate names (though DB enforces unique)
    department_data = {"name": name, "description": description}
    department = repositories.create_department(**department_data)
    return department
