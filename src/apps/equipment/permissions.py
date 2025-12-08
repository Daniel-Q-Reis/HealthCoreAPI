from rest_framework import permissions


class IsMedicalStaff(permissions.BasePermission):
    """
    Allows access only to authenticated users who are staff or members of
    'Doctors' or 'Nurses' groups.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Superusers and admin staff always have access
        if request.user.is_superuser or request.user.is_staff:
            return True

        # Check for group membership
        return request.user.groups.filter(name__in=["Doctors", "Nurses"]).exists()
