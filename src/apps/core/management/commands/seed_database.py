import datetime
import random
from typing import Any

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand, CommandParser
from django.db import transaction

from src.apps.admissions.models import Admission, Bed, Ward

# Import Models
from src.apps.departments.models import Department
from src.apps.equipment.models import (
    Equipment,
    EquipmentIncident,
    EquipmentStatus,
    EquipmentType,
)
from src.apps.experience.models import PatientComplaint, PatientFeedback
from src.apps.orders.models import (
    ClinicalOrder,
    OrderCategory,
    OrderPriority,
    OrderStatus,
)
from src.apps.patients.models import Patient
from src.apps.pharmacy.models import Dispensation, Medication
from src.apps.practitioners.models import Practitioner
from src.apps.results.models import DiagnosticReport, Observation
from src.apps.scheduling.models import Appointment, Slot
from src.apps.shifts.models import Shift

try:
    from faker import Faker

    HAS_FAKER = True
except ImportError:
    Faker = None  # type: ignore
    HAS_FAKER = False

User = get_user_model()


class Command(BaseCommand):
    help = "Seeds the database with realistic initial data for development and demo."
    fake: Any
    patients: list[Patient]
    medications: list[Medication]
    depts: list[Department]

    def add_arguments(self, parser: CommandParser) -> None:
        parser.add_argument(
            "--no-input",
            action="store_true",
            help="Do not prompt for confirmation",
        )

    def handle(self, *args: Any, **options: Any) -> None:
        if not HAS_FAKER:
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

            # 5. Setup Equipment
            self.setup_equipment()

            # 6. Setup Shifts & Scheduling
            self.setup_shifts_and_scheduling()

            # 7. Setup Admissions
            self.setup_admissions()

            # 8. Setup Clinical Orders & Results
            self.setup_clinical_data()

            # 9. Create Transactions (Dispensations, Feedback)
            self.create_activity_data()

            self.stdout.write(
                self.style.SUCCESS("Database seeding completed successfully! 🚀")
            )

    def setup_groups(self) -> None:
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

    def setup_infrastructure(self) -> None:
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

    def setup_users(self) -> None:
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

        # === Admin Test User (Explicit request) ===
        admin_test, _ = User.objects.get_or_create(
            username="admin_test",
            defaults={
                "email": "admin_test@healthcore.local",
                "is_staff": True,
                "is_superuser": True,
            },
        )
        admin_test.set_password("admin123")
        admin_test.save()
        admin_test.groups.add(Group.objects.get(name="Admins"))

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

            # Deterministic License to prevent duplicates on re-runs
            Practitioner.objects.get_or_create(
                license_number=f"MED-{10000 + i}",
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
                license_number=f"NUR-{10000 + i}",
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

    def setup_pharmacy(self) -> None:
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

    def setup_equipment(self) -> None:
        self.stdout.write("Setting up equipment...")
        if Equipment.objects.exists():
            return

        equipment_types = [
            (EquipmentType.STRETCHER, "Stretcher"),
            (EquipmentType.WHEELCHAIR, "Wheelchair"),
            (EquipmentType.INFUSION_PUMP, "Infusion Pump"),
            (EquipmentType.DEFIBRILLATOR, "Defibrillator"),
            (EquipmentType.ECG, "ECG Monitor"),
            (EquipmentType.PORTABLE_XRAY, "Portable X-Ray"),
        ]

        # Use wards as locations
        wards = list(Ward.objects.all())
        if not wards:
            wards_names = ["Emergency", "General Ward"]
        else:
            wards_names = [w.name for w in wards]

        for _ in range(30):
            eq_type, type_name = random.choice(equipment_types)
            Equipment.objects.create(
                name=f"{type_name} {random.randint(100, 999)}",
                type=eq_type,
                brand=random.choice(["GE Healthcare", "Philips", "Siemens", "Drager"]),
                model=f"Model-{random.choice(['X', 'Y', 'Z'])}-{random.randint(10, 99)}",
                serial_number=self.fake.unique.bothify(text="SN-????-####"),
                qr_code=self.fake.unique.uuid4(),
                current_location=random.choice(wards_names),
                status=random.choice(EquipmentStatus.values),
                is_active=True,
            )

        # Incidents
        equipment_list = list(Equipment.objects.all())
        for _ in range(10):
            EquipmentIncident.objects.create(
                equipment=random.choice(equipment_list),
                severity=random.choice(["LOW", "MEDIUM", "HIGH"]),
                description=self.fake.sentence(),
                status=random.choice(["OPEN", "INVESTIGATING", "RESOLVED"]),
                created_at=self.fake.date_time_this_year(tzinfo=datetime.timezone.utc),
            )

    def setup_shifts_and_scheduling(self) -> None:
        self.stdout.write("Setting up shifts and scheduling...")

        # 1. Shifts
        if not Shift.objects.exists():
            practitioners = list(
                Practitioner.objects.filter(role__in=["doctor", "nurse"])
            )
            today = datetime.datetime.now(datetime.timezone.utc).date()

            for practitioner in practitioners:
                # Create shifts for the next 7 days
                for i in range(7):
                    day = today + datetime.timedelta(days=i)
                    # Randomly assign a shift type or off
                    shift_choice = random.choice(
                        ["morning", "afternoon", "night", "off"]
                    )

                    if shift_choice == "morning":
                        start = datetime.datetime.combine(
                            day, datetime.time(8, 0), tzinfo=datetime.timezone.utc
                        )
                        end = datetime.datetime.combine(
                            day, datetime.time(16, 0), tzinfo=datetime.timezone.utc
                        )
                    elif shift_choice == "afternoon":
                        start = datetime.datetime.combine(
                            day, datetime.time(16, 0), tzinfo=datetime.timezone.utc
                        )
                        end = datetime.datetime.combine(
                            day + datetime.timedelta(days=1),
                            datetime.time(0, 0),
                            tzinfo=datetime.timezone.utc,
                        )
                    elif shift_choice == "night":
                        start = datetime.datetime.combine(
                            day, datetime.time(0, 0), tzinfo=datetime.timezone.utc
                        )
                        end = datetime.datetime.combine(
                            day, datetime.time(8, 0), tzinfo=datetime.timezone.utc
                        )
                    else:
                        continue

                    Shift.objects.create(
                        practitioner=practitioner,
                        start_time=start,
                        end_time=end,
                        role=f"{practitioner.role.capitalize()} on Duty",
                    )

        # 2. Slots and Appointments
        if not Slot.objects.exists():
            doctors = list(Practitioner.objects.filter(role="doctor"))
            today = datetime.datetime.now(datetime.timezone.utc).date()

            for doctor in doctors:
                # Create slots for the next 14 days (2 weeks)
                for i in range(14):
                    day = today + datetime.timedelta(days=i)

                    # Slot times: 5 AM to 5 PM (12 hours = 24 slots)
                    start_hour = 5

                    # 24 slots per day (12 hours * 2 slots/hr) to cover 5am - 5pm
                    for j in range(24):
                        start_time = datetime.datetime.combine(
                            day,
                            datetime.time(start_hour + (j // 2), (j % 2) * 30),
                            tzinfo=datetime.timezone.utc,
                        )
                        end_time = start_time + datetime.timedelta(minutes=30)

                        slot = Slot.objects.create(
                            practitioner=doctor,
                            start_time=start_time,
                            end_time=end_time,
                            is_booked=False,
                        )

                        # Randomly book
                        if random.random() > 0.6 and self.patients:
                            patient = random.choice(self.patients)
                            is_completed = day < today

                            status = "completed" if is_completed else "booked"

                            Appointment.objects.create(
                                slot=slot,
                                patient=patient,
                                practitioner=doctor,
                                status=status,
                                notes=self.fake.sentence(),
                            )
                            slot.is_booked = True
                            slot.save()

    def setup_admissions(self) -> None:
        self.stdout.write("Setting up admissions...")
        if Admission.objects.exists():
            return

        beds = list(Bed.objects.filter(is_occupied=False))
        patients_to_admit = random.sample(self.patients, k=min(len(self.patients), 10))

        for patient in patients_to_admit:
            if not beds:
                break

            bed = beds.pop()

            admission_date = self.fake.date_time_this_year(tzinfo=datetime.timezone.utc)

            # 80% active, 20% discharged
            is_active = random.random() > 0.2

            if is_active:
                status = "admitted"
                discharge_date = None
                bed.is_occupied = True
                bed.save()
            else:
                status = "discharged"
                discharge_date = admission_date + datetime.timedelta(
                    days=random.randint(1, 10)
                )
                # Bed remains free since they are discharged

            Admission.objects.create(
                patient=patient,
                bed=bed if is_active else None,
                admission_date=admission_date,
                discharge_date=discharge_date,
                status=status,
            )

    def setup_clinical_data(self) -> None:
        self.stdout.write("Setting up clinical orders and results...")
        if ClinicalOrder.objects.exists():
            return

        doctors = list(Practitioner.objects.filter(role="doctor"))
        if not doctors:
            return

        # Ensure we have a target department
        lab_dept, _ = Department.objects.get_or_create(
            name="Laboratory", defaults={"description": "Pathology and Lab Services"}
        )
        imaging_dept, _ = Department.objects.get_or_create(
            name="Radiology", defaults={"description": "X-Ray, MRI, CT"}
        )

        for patient in self.patients:
            # Create 1-3 orders per patient
            for _ in range(random.randint(1, 3)):
                requester = random.choice(doctors)
                is_lab = random.random() > 0.5

                if is_lab:
                    category = OrderCategory.LABORATORY
                    code = random.choice(["CBC", "BMP", "LIPID", "TSH"])
                    desc = f"{code} Panel"
                    dept = lab_dept
                else:
                    category = OrderCategory.IMAGING
                    code = random.choice(["CXR", "MRI-BRAIN", "CT-ABD"])
                    desc = f"Exam {code}"
                    dept = imaging_dept

                status = random.choice(OrderStatus.values)

                order = ClinicalOrder.objects.create(
                    patient=patient,
                    requester=requester,
                    target_department=dept,
                    category=category,
                    code=code,
                    description=desc,
                    status=status,
                    priority=random.choice(OrderPriority.values),
                    requested_date=self.fake.date_time_this_year(
                        tzinfo=datetime.timezone.utc
                    ),
                    reason=self.fake.sentence(),
                )

                # Create Results for Completed orders
                if status == OrderStatus.COMPLETED:
                    report = DiagnosticReport.objects.create(
                        patient=patient,
                        performer=requester,
                        status="final",
                        conclusion=self.fake.paragraph(),
                        issued_at=order.requested_date + datetime.timedelta(hours=4),
                    )

                    # Observations
                    for i in range(3):
                        Observation.objects.create(
                            report=report,
                            code=f"{code}-OBS-{i}",
                            value_text=f"{random.randint(10, 100)} units"
                            if is_lab
                            else "Normal findings",
                        )

    def create_activity_data(self) -> None:
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
