import datetime
import random

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand
from django.db import transaction

from src.apps.admissions.models import Bed, Ward

# Import Models
from src.apps.departments.models import Department
from src.apps.experience.models import PatientComplaint, PatientFeedback
from src.apps.patients.models import Patient
from src.apps.pharmacy.models import Dispensation, Medication
from src.apps.practitioners.models import Practitioner

try:
    from faker import Faker
except ImportError:
    Faker = None

User = get_user_model()


class Command(BaseCommand):
    help = "Seeds the database with realistic initial data for development and demo."

    def add_arguments(self, parser):
        parser.add_argument(
            "--no-input",
            action="store_true",
            help="Do not prompt for confirmation",
        )

    def handle(self, *args, **options):
        if not Faker:
            self.stdout.write(
                self.style.ERROR(
                    "Faker is required. Please install it with 'pip install Faker'"
                )
            )
            return

        self.fake = Faker()

        # Confirmation
        if not options["no_input"]:
            self.stdout.write(
                self.style.WARNING("This will POPULATE the database with fake data.")
            )
            confirm = input("Are you sure? (y/N): ")
            if confirm.lower() != "y":
                return

        with transaction.atomic():
            self.stdout.write("Starting database seeding...")

            # 1. Setup Groups & Permissions
            self.setup_groups()

            # 2. Setup Core Infrastructure (Departments, Wards, Beds)
            self.setup_infrastructure()

            # 3. Create Users & Profiles
            self.setup_users()

            # 4. Setup Pharmacy (Medications)
            self.setup_pharmacy()

            # 5. Create Transactions (Dispensations, Feedback)
            self.create_activity_data()

            self.stdout.write(
                self.style.SUCCESS("Database seeding completed successfully! 🚀")
            )

    def setup_groups(self):
        self.stdout.write("Setting up groups...")
        # Ensure fixtures are loaded or groups exist
        # We can just rely on the existing fixture loader or create them here if missing
        groups = [
            "Admins",
            "Doctors",
            "Nurses",
            "Patients",
            "Receptionists",
            "Pharmacists",
        ]
        for name in groups:
            Group.objects.get_or_create(name=name)

    def setup_infrastructure(self):
        self.stdout.write("Setting up departments and wards...")

        depts_data = [
            ("Emergency", "EMG"),
            ("Cardiology", "CARD"),
            ("Pediatrics", "PED"),
            ("Neurology", "NEURO"),
            ("Oncology", "ONCO"),
            ("Pharmacy", "PHARM"),
        ]

        self.depts = []
        for name, code in depts_data:
            dept, _ = Department.objects.get_or_create(
                name=name, defaults={"description": f"{name} Department ({code})"}
            )
            self.depts.append(dept)

            # Create Wards for each Dept (except Pharmacy)
            if name != "Pharmacy":
                for i in range(1, 3):  # 2 Wards per dept
                    ward, _ = Ward.objects.get_or_create(
                        name=f"{name} Ward {i}", defaults={"capacity": 10}
                    )

                    # Create Beds
                    for b in range(1, 11):  # 10 Beds per ward
                        Bed.objects.get_or_create(
                            ward=ward,
                            bed_number=f"{code}-W{i}-B{b}",
                            defaults={"is_occupied": False},
                        )

    def setup_users(self):
        self.stdout.write("Setting up users and profiles...")

        # === Admins ===
        admin_user, _ = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@healthcore.local",
                "is_staff": True,
                "is_superuser": True,
            },
        )
        admin_user.set_password("admin123")
        admin_user.save()
        admin_user.groups.add(Group.objects.get(name="Admins"))

        # === Doctors ===
        for i in range(5):
            username = f"doctor_{i + 1}"
            user, _ = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": f"{username}@healthcore.local",
                    "first_name": self.fake.first_name(),
                    "last_name": self.fake.last_name(),
                },
            )
            user.set_password("doctor123")
            user.save()
            user.groups.add(Group.objects.get(name="Doctors"))

            Practitioner.objects.get_or_create(
                license_number=f"MED-{random.randint(10000, 99999)}",
                defaults={
                    "given_name": user.first_name,
                    "family_name": user.last_name,
                    "role": "doctor",
                    "specialty": random.choice(
                        ["Cardiology", "Emergency", "Pediatrics"]
                    ),
                },
            )

        # === Nurses ===
        for i in range(5):
            username = f"nurse_{i + 1}"
            user, _ = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": f"{username}@healthcore.local",
                    "first_name": self.fake.first_name(),
                    "last_name": self.fake.last_name(),
                },
            )
            user.set_password("nurse123")
            user.save()
            user.groups.add(Group.objects.get(name="Nurses"))

            Practitioner.objects.get_or_create(
                license_number=f"NUR-{random.randint(10000, 99999)}",
                defaults={
                    "given_name": user.first_name,
                    "family_name": user.last_name,
                    "role": "nurse",
                    "specialty": "General",
                },
            )

        # === Receptionists ===
        for i in range(2):
            username = f"recep_{i + 1}"
            user, _ = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": f"{username}@healthcore.local",
                    "first_name": self.fake.first_name(),
                    "last_name": self.fake.last_name(),
                },
            )
            user.set_password("recep123")
            user.save()
            user.groups.add(Group.objects.get(name="Receptionists"))

            # Receptionists are staff, so we create a Practitioner profile for them too
            Practitioner.objects.get_or_create(
                license_number=f"REC-{random.randint(10000, 99999)}",
                defaults={
                    "given_name": user.first_name,
                    "family_name": user.last_name,
                    "role": "receptionist",
                    "specialty": "Front Desk",
                },
            )

        # === Pharmacists ===
        for i in range(2):
            username = f"pharm_{i + 1}"
            user, _ = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": f"{username}@healthcore.local",
                    "first_name": self.fake.first_name(),
                    "last_name": self.fake.last_name(),
                },
            )
            user.set_password("pharm123")
            user.save()
            user.groups.add(Group.objects.get(name="Pharmacists"))

            Practitioner.objects.get_or_create(
                license_number=f"PHARM-{random.randint(10000, 99999)}",
                defaults={
                    "given_name": user.first_name,
                    "family_name": user.last_name,
                    "role": "pharmacist",
                    "specialty": "Pharmacy",
                },
            )

        # === Patients ===
        self.patients = []
        for i in range(20):
            username = f"patient_{i + 1}"
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": f"{username}@healthcore.local",
                    "first_name": self.fake.first_name(),
                    "last_name": self.fake.last_name(),
                },
            )
            user.set_password("patient123")
            user.save()
            user.groups.add(Group.objects.get(name="Patients"))

            patient, _ = Patient.objects.get_or_create(
                mrn=f"MRN-{random.randint(100000, 999999)}",
                defaults={
                    "given_name": user.first_name,
                    "family_name": user.last_name,
                    "birth_date": self.fake.date_of_birth(
                        minimum_age=18, maximum_age=90
                    ),
                    "sex": random.choice(["male", "female", "other"]),
                    "phone_number": self.fake.phone_number()[:15],
                    "email": user.email,
                    "blood_type": random.choice(["A+", "O+", "B+", "AB+", "O-"]),
                },
            )
            self.patients.append(patient)

    def setup_pharmacy(self):
        self.stdout.write("Setting up pharmacy inventory...")
        meds_data = [
            ("Amoxicillin 500mg", "Amoxil", "ABX-001"),
            ("Lisinopril 10mg", "Zestril", "BP-001"),
            ("Metformin 500mg", "Glucophage", "DIA-001"),
            ("Ibuprofen 400mg", "Advil", "PAIN-001"),
            ("Acetaminophen 500mg", "Tylenol", "PAIN-002"),
            ("Simvastatin 20mg", "Zocor", "CHOL-001"),
            ("Omeprazole 20mg", "Prilosec", "GERD-001"),
            ("Levothyroxine 50mcg", "Synthroid", "THY-001"),
            ("Amlodipine 5mg", "Norvasc", "BP-002"),
            ("Metoprolol 25mg", "Lopressor", "BP-003"),
        ]

        self.medications = []
        for name, brand, sku in meds_data:
            med, _ = Medication.objects.get_or_create(
                sku=sku,
                defaults={
                    "name": name,
                    "brand": brand,
                    "description": self.fake.sentence(),
                    "batch_number": f"BATCH-{random.randint(1000, 9999)}",
                    "expiry_date": self.fake.future_date(end_date="+2y"),
                    "stock_quantity": random.randint(50, 500),
                },
            )
            self.medications.append(med)

    def create_activity_data(self):
        # Check if activity data already exists to avoid duplication on restarts
        if Dispensation.objects.exists() or PatientFeedback.objects.exists():
            self.stdout.write(
                self.style.WARNING("Activity data already exists. Skipping generation.")
            )
            return

        self.stdout.write("Generating activity (dispensations, feedback)...")

        # Dispensations
        pharmacists = Practitioner.objects.filter(role="pharmacist")
        if pharmacists.exists() and self.patients and self.medications:
            for _ in range(30):
                Dispensation.objects.create(
                    medication=random.choice(self.medications),
                    patient=random.choice(self.patients),
                    practitioner=random.choice(pharmacists),
                    quantity=random.randint(1, 30),
                    notes=self.fake.sentence() if random.random() > 0.5 else "",
                    dispensed_at=self.fake.date_time_this_year(
                        tzinfo=datetime.timezone.utc
                    ),
                )

        # Patient Feedback & Complaints
        for _ in range(20):
            PatientFeedback.objects.create(
                patient=random.choice(self.patients),
                # Linking to admission is optional/complex to seed perfectly without admission seed, keeping null for MVP
                overall_rating=random.randint(1, 5),
                comments=self.fake.paragraph(),
                created_at=self.fake.date_time_this_year(tzinfo=datetime.timezone.utc),
            )

        for _ in range(10):
            PatientComplaint.objects.create(
                patient=random.choice(self.patients),
                category=random.choice(["quality", "service", "billing", "other"]),
                description=self.fake.paragraph(),
                status=random.choice(["open", "investigating", "resolved"]),
                created_at=self.fake.date_time_this_year(tzinfo=datetime.timezone.utc),
            )
