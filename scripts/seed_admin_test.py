from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group

from src.apps.core.models import ProfessionalRoleRequest

User = get_user_model()


def run() -> None:
    print("--- Seeding Test Data ---")

    # 1. Create Groups
    print("Ensuring groups exist...")
    admins_group, _ = Group.objects.get_or_create(name="Admins")
    patients_group, _ = Group.objects.get_or_create(name="Patients")
    doctors_group, _ = Group.objects.get_or_create(name="Doctors")

    # 2. Create Admin User
    print("Creating/Getting admin_test user...")
    admin_user, created = User.objects.get_or_create(
        username="admin_test", defaults={"email": "admin@test.com"}
    )
    if created:
        admin_user.set_password("password123")
        admin_user.is_staff = True
        admin_user.first_name = "Admin"
        admin_user.last_name = "Tester"
        admin_user.save()
    admin_user.groups.add(admins_group)
    print(f"Admin User: {admin_user.username} (password123)")

    # 3. Create Patient User
    print("Creating/Getting patient_test user...")
    patient_user, created = User.objects.get_or_create(
        username="patient_test", defaults={"email": "patient@test.com"}
    )
    if created:
        patient_user.set_password("password123")
        patient_user.first_name = "John"
        patient_user.last_name = "Doe"
        patient_user.save()
    patient_user.groups.add(patients_group)
    print(f"Patient User: {patient_user.username} (password123)")

    # 4. Create Role Request
    print("Creating Role Request...")
    # Delete existing pending requests for this user to ensure clean state
    ProfessionalRoleRequest.objects.filter(user=patient_user, status="pending").delete()

    ProfessionalRoleRequest.objects.create(
        user=patient_user,
        role_requested="Doctors",
        license_number="MD-998877",
        license_state="CA",
        specialty="Cardiology",
        reason="I am a test doctor needing access.",
        status="pending",
    )
    print(f"Created Pending Request for {patient_user.username}")
    print("--- DONE ---")


run()
