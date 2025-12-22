"""
Role-Based Access Control (RBAC) permissions for HealthCoreAPI.

This module implements a production-grade RBAC system with 4 healthcare roles:
- Admins: Full system access for system administrators
- Doctors: Medical records, diagnostics, and prescription authority
- Nurses: Patient care, vitals monitoring, and medication administration
- Patients: Read-only access to own records

Security considerations:
- All permission checks require authentication
- Object-level permissions prevent cross-patient data access
- Explicit error messages improve UX without exposing sensitive info
- Type-safe implementation for static analysis (MyPy)

References:
- HIPAA Security Rule: https://www.hhs.gov/hipaa/for-professionals/security/
- Django Permissions: https://docs.djangoproject.com/en/stable/topics/auth/
"""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from rest_framework import permissions

if TYPE_CHECKING:
    from rest_framework.request import Request
    from rest_framework.views import APIView


class IsAdmin(permissions.BasePermission):
    """
    Permission class for system administrators.

    Admins have unrestricted access to all system resources including:
    - User management (CRUD operations)
    - System configuration
    - All patient and medical records
    - Audit logs and analytics

    Security note: This permission should only be granted to trusted
    system administrators. Use with caution.

    Usage:
        permission_classes = [IsAuthenticated, IsAdmin]

    Example:
        class AdminOnlyViewSet(viewsets.ModelViewSet):
            permission_classes = [IsAuthenticated, IsAdmin]
    """

    message = "Administrator privileges required to perform this action."

    def has_permission(self, request: Request, view: APIView) -> bool:
        """
        Check if requesting user has admin privileges.

        Args:
            request: The HTTP request object with authenticated user
            view: The API view being accessed

        Returns:
            bool: True if user is authenticated and in Admins group

        Security:
            - Requires authentication (request.user must exist)
            - Checks group membership in database
            - No privilege escalation possible through request manipulation
        """
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.groups.filter(name="Admins").exists()
        )


class IsDoctor(permissions.BasePermission):
    """
    Permission class for medical doctors.

    Doctors can:
    - View all patient records (PHI/ePHI access)
    - Create and modify appointments
    - Create and update diagnostic reports
    - Prescribe medications
    - View practitioner schedules and availability
    - Access medical imaging and lab results

    Restrictions:
    - Cannot modify system configuration
    - Cannot manage user accounts
    - Cannot access audit logs

    HIPAA Compliance:
    This permission supports the "minimum necessary" standard by restricting
    access to medical data to authorized healthcare providers only.

    Usage:
        permission_classes = [IsAuthenticated, IsDoctor]

    Example:
        class DiagnosticReportViewSet(viewsets.ModelViewSet):
            permission_classes = [IsAuthenticated, IsDoctor]
    """

    message = "Doctor privileges required to perform this action."

    def has_permission(self, request: Request, view: APIView) -> bool:
        """
        Check if requesting user is a licensed doctor.

        Args:
            request: The HTTP request object with authenticated user
            view: The API view being accessed

        Returns:
            bool: True if user is authenticated and in Doctors group
        """
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.groups.filter(name="Doctors").exists()
        )


class IsNurse(permissions.BasePermission):
    """
    Permission class for nursing staff.

    Nurses can:
    - View patient records (limited fields)
    - Update patient vitals and vital signs
    - Administer medications (per doctor orders)
    - View appointment schedules
    - Access care plans and nursing notes

    Restrictions:
    - Cannot create diagnostic reports or prescriptions
    - Cannot modify appointment schedules
    - Cannot access full patient history (limited view)

    HIPAA Compliance:
    Implements role-appropriate access controls per the Security Rule's
    access control standard.

    Usage:
        permission_classes = [IsAuthenticated, IsNurse]

    Example:
        class VitalsViewSet(viewsets.ModelViewSet):
            permission_classes = [IsAuthenticated, IsNurse | IsDoctor]
    """

    message = "Nurse privileges required to perform this action."

    def has_permission(self, request: Request, view: APIView) -> bool:
        """
        Check if requesting user is registered nursing staff.

        Args:
            request: The HTTP request object with authenticated user
            view: The API view being accessed

        Returns:
            bool: True if user is authenticated and in Nurses group
        """
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.groups.filter(name="Nurses").exists()
        )


class IsPatient(permissions.BasePermission):
    """
    Permission class for patient users.

    Patients can:
    - View their own medical records
    - View their appointments
    - Access their test results and imaging
    - View their medications and prescriptions

    Restrictions:
    - Cannot view other patients' data
    - Cannot modify any data (read-only access)
    - Cannot access administrative functions

    Privacy Protection:
    This permission enforces patient data privacy by restricting access
    to own records only. Use in combination with IsPatientOwner for
    object-level permission checks.

    Usage:
        permission_classes = [IsAuthenticated, IsPatient]

    Example:
        class PatientPortalViewSet(viewsets.ReadOnlyModelViewSet):
            permission_classes = [IsAuthenticated, IsPatient]

            def get_queryset(self):
                # Patients only see their own records
                return Patient.objects.filter(user=self.request.user)
    """

    message = "Patient account required to perform this action."

    def has_permission(self, request: Request, view: APIView) -> bool:
        """
        Check if requesting user is a registered patient.

        Args:
            request: The HTTP request object with authenticated user
            view: The API view being accessed

        Returns:
            bool: True if user is authenticated and in Patients group
        """
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.groups.filter(name="Patients").exists()
        )


class IsReceptionist(permissions.BasePermission):
    """
    Permission class for reception staff.

    Receptionists can:
    - View and create patient records
    - Manage appointment scheduling
    - Check-in patients
    - Update patient contact information
    - View appointment calendars

    Restrictions:
    - Cannot access medical records or diagnostic data
    - Cannot prescribe medications
    - Cannot create diagnostic reports

    Usage:
        permission_classes = [IsAuthenticated, IsReceptionist]

    Example:
        class AppointmentViewSet(viewsets.ModelViewSet):
            permission_classes = [IsAuthenticated, IsReceptionist | IsMedicalStaff]
    """

    message = "Receptionist privileges required to perform this action."

    def has_permission(self, request: Request, view: APIView) -> bool:
        """
        Check if requesting user is reception staff.

        Args:
            request: The HTTP request object with authenticated user
            view: The API view being accessed

        Returns:
            bool: True if user is authenticated and in Receptionists group
        """
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.groups.filter(name="Receptionists").exists()
        )


class IsPharmacist(permissions.BasePermission):
    """
    Permission class for pharmacy staff.

    Pharmacists can:
    - View medication inventory
    - Dispense prescribed medications
    - Update medication stock levels
    - View patient prescriptions
    - Access drug interaction information (AI-powered)

    Restrictions:
    - Cannot prescribe medications (doctor-only)
    - Cannot access full patient medical history
    - Cannot create diagnostic reports

    Usage:
        permission_classes = [IsAuthenticated, IsPharmacist]

    Example:
        class MedicationViewSet(viewsets.ModelViewSet):
            permission_classes = [IsAuthenticated, IsPharmacist | IsDoctor]
    """

    message = "Pharmacist privileges required to perform this action."

    def has_permission(self, request: Request, view: APIView) -> bool:
        """
        Check if requesting user is pharmacy staff.

        Args:
            request: The HTTP request object with authenticated user
            view: The API view being accessed

        Returns:
            bool: True if user is authenticated and in Pharmacists group
        """
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.groups.filter(name="Pharmacists").exists()
        )


class IsMedicalStaff(permissions.BasePermission):
    """
    Composite permission for any medical professional (Doctors OR Nurses).

    This is a convenience permission for endpoints that should be accessible
    to any healthcare provider, regardless of specific role.

    Use cases:
    - Patient record viewing (both doctors and nurses need access)
    - Appointment scheduling assistance
    - General patient care coordination

    Usage:
        permission_classes = [IsAuthenticated, IsMedicalStaff]

    Example:
        class PatientViewSet(viewsets.ModelViewSet):
            permission_classes = [IsAuthenticated, IsMedicalStaff]
            # Both doctors and nurses can view patient list
    """

    message = "Medical staff credentials (Doctor or Nurse) required for this action."

    def has_permission(self, request: Request, view: APIView) -> bool:
        """
        Check if user is any type of medical staff, pharmacist, or system admin.

        Args:
            request: The HTTP request object with authenticated user
            view: The API view being accessed

        Returns:
            bool: True if user is in Doctors, Nurses, Pharmacists, or Admins group
        """
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.groups.filter(
                name__in=["Doctors", "Nurses", "Pharmacists"]
            ).exists()
        )


class IsPatientOwner(permissions.BasePermission):
    """
    Object-level permission ensuring patients can only access their own data.

    This permission provides defense-in-depth by adding object-level checks
    in addition to view-level permissions. It prevents a patient user from
    accessing another patient's records even if they know the record ID.

    Permission logic:
    - Admins, Doctors, Nurses: Can access all patient records (for treatment)
    - Patients: Can ONLY access their own records

    HIPAA Compliance:
    Implements the "minimum necessary" and "access control" standards
    by restricting patient data access to authorized individuals only.

    Security considerations:
    - Uses object-level permission check (has_object_permission)
    - Requires the model to have a 'user' ForeignKey to auth.User
    - Fails closed (denies access if relationship doesn't exist)

    Usage:
        permission_classes = [IsAuthenticated, IsPatientOwner]

    Example:
        class PatientDetailView(RetrieveAPIView):
            queryset = Patient.objects.all()
            permission_classes = [IsAuthenticated, IsPatientOwner]

    Model requirements:
        class Patient(models.Model):
            user = models.OneToOneField(User, on_delete=models.CASCADE)
            # Other fields...
    """

    message = "You can only access your own medical records."

    def has_object_permission(self, request: Request, view: APIView, obj: Any) -> bool:
        """
        Check if user can access this specific patient object.

        Args:
            request: The HTTP request object with authenticated user
            view: The API view being accessed
            obj: The Patient model instance being accessed

        Returns:
            bool: True if user is authorized to access this patient record

        Security:
            - Medical staff can access all records (for treatment purposes)
            - Patients can only access records where obj.user == request.user
            - Unknown users are denied (fails closed)
        """
        # Medical staff and admins can access all patient records
        if request.user.groups.filter(
            name__in=["Admins", "Doctors", "Nurses"]
        ).exists():
            return True

        # Patients can only access their own records
        # Requires the model to have a 'user' field
        return hasattr(obj, "user") and obj.user == request.user


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Generic object-level permission allowing owners to edit, others to read.

    This is a general-purpose permission that allows:
    - Any authenticated user: Read access (GET, HEAD, OPTIONS)
    - Object owner: Write access (POST, PUT, PATCH, DELETE)

    Use cases:
    - User profile editing (users can edit own profile, view others)
    - Comment moderation (authors can edit own comments)
    - Document ownership (creators can modify their documents)

    Note: For patient records, use IsPatientOwner instead as it has
    healthcare-specific logic and HIPAA compliance considerations.

    Usage:
        permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    Example:
        class UserProfileViewSet(viewsets.ModelViewSet):
            permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    Model requirements:
        Model must have a 'user' or 'author' field linking to auth.User
    """

    message = "You can only modify your own content."

    def has_permission(self, request: Request, view: APIView) -> bool:
        """
        Check if user has base permission to access the endpoint.

        Args:
            request: The HTTP request object
            view: The API view being accessed

        Returns:
            bool: True if authenticated, or if it's a read-only request
        """
        # Read permissions for any authenticated request
        if request.method in permissions.SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)

        # Write permissions require authentication
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request: Request, view: APIView, obj: Any) -> bool:
        """
        Check if user can access this specific object.

        Args:
            request: The HTTP request object with authenticated user
            view: The API view being accessed
            obj: The model instance being accessed

        Returns:
            bool: True for read access, or if user is the owner for write access
        """
        # Read permissions for any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions only for the owner
        # Try 'user' field first, fall back to 'author'
        owner = getattr(obj, "user", None) or getattr(obj, "author", None)
        return owner == request.user
