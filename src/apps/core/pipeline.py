"""
Custom pipeline functions for social-auth-app-django.

This module contains custom pipeline steps for OAuth authentication,
specifically for assigning default roles to new users according to ADR 0002.
"""

from typing import Any

from django.contrib.auth.models import Group, User


def assign_default_patient_role(
    backend: Any,
    user: User,
    response: dict[str, Any],
    *args: Any,
    **kwargs: Any,
) -> dict[str, bool]:
    """
    Assign default PATIENT role to new users created via OAuth.

    This implements the "Default Deny" principle from ADR 0002:
    All new users start with minimum privileges (PATIENT role).

    Args:
        backend: Social auth backend instance
        user: User instance (newly created or existing)
        response: OAuth provider response
        *args: Additional positional arguments
        **kwargs: Additional keyword arguments (contains 'is_new' flag)

    Returns:
        dict with 'is_new' flag indicating if user was just created

    Security:
        - Only assigns role to NEW users (is_new=True)
        - Uses get_or_create to avoid errors
        - Logs role assignment for audit trail
    """
    is_new = kwargs.get("is_new", False)

    if is_new:
        # Get or create Patients group
        patients_group, created = Group.objects.get_or_create(name="Patients")

        # Assign user to Patients group
        user.groups.add(patients_group)

        # Log for audit trail
        import logging

        logger = logging.getLogger(__name__)
        logger.info(
            f"OAuth: Assigned PATIENT role to new user {user.username} (email: {user.email})"
        )

    return {"is_new": is_new}
