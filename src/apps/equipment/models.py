"""
Domain models for the Equipment & Logistics bounded context.
"""

from django.conf import settings
from django.db import models

from src.apps.core.models import AuthorableModel


class EquipmentStatus(models.TextChoices):
    AVAILABLE = "AVAILABLE", "Available"
    RESERVED = "RESERVED", "Reserved"
    IN_USE = "IN_USE", "In Use"
    MAINTENANCE = "MAINTENANCE", "Maintenance"
    LOST = "LOST", "Lost"
    CLEANING = "CLEANING", "Cleaning"


class EquipmentType(models.TextChoices):
    STRETCHER = "STRETCHER", "Stretcher"
    WHEELCHAIR = "WHEELCHAIR", "Wheelchair"
    INFUSION_PUMP = "INFUSION_PUMP", "Infusion Pump"
    DEFIBRILLATOR = "DEFIBRILLATOR", "Defibrillator"
    ECG = "ECG", "ECG Machine"
    PORTABLE_XRAY = "PORTABLE_XRAY", "Portable X-Ray"
    OTHER = "OTHER", "Other"


class Equipment(AuthorableModel):
    """
    Represents a trackable asset within the hospital.
    """

    name = models.CharField(max_length=255)
    type = models.CharField(max_length=50, choices=EquipmentType.choices)
    brand = models.CharField(max_length=100, blank=True)
    model = models.CharField(max_length=100, blank=True)
    serial_number = models.CharField(max_length=100, unique=True)
    qr_code = models.CharField(
        max_length=255, unique=True, help_text="Unique QR code content"
    )

    current_location = models.CharField(
        max_length=255, help_text="Current ward/room ID or name"
    )

    status = models.CharField(
        max_length=20,
        choices=EquipmentStatus.choices,
        default=EquipmentStatus.AVAILABLE,
    )

    # For soft deletion functionality
    is_active = models.BooleanField(
        default=True, help_text="Whether this equipment record is active"
    )

    maintenance_due_at = models.DateTimeField(null=True, blank=True)
    accessories = models.TextField(
        blank=True, help_text="Comma-separated list of accessories"
    )

    class Meta:
        verbose_name = "Equipment"
        verbose_name_plural = "Equipment"

    def __str__(self) -> str:
        return f"{self.name} ({self.serial_number})"

    def soft_delete(self) -> None:
        """Mark equipment as inactive instead of deleting."""
        self.is_active = False
        self.save(update_fields=["is_active", "updated_at"])

    def activate(self) -> None:
        """Mark equipment as active."""
        self.is_active = True
        self.save(update_fields=["is_active", "updated_at"])


class EquipmentReservation(AuthorableModel):
    """
    Reservation of equipment for a specific timeframe.
    """

    equipment = models.ForeignKey(
        Equipment, on_delete=models.CASCADE, related_name="reservations"
    )
    requester = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="equipment_requests",
    )
    department_id = models.CharField(max_length=100)
    purpose = models.TextField()
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(
        max_length=20, default="ACTIVE"
    )  # ACTIVE, COMPLETED, CANCELLED


class EquipmentMovement(models.Model):
    """
    Audit trail for equipment physical movement (Handoffs).
    """

    equipment = models.ForeignKey(
        Equipment, on_delete=models.CASCADE, related_name="movements"
    )
    from_location = models.CharField(max_length=255)
    to_location = models.CharField(max_length=255)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    method = models.CharField(max_length=50, default="SCAN")  # SCAN or MANUAL
    notes = models.TextField(blank=True)


class EquipmentIncident(AuthorableModel):
    """
    Reports of damage or malfunction.
    """

    SEVERITY_CHOICES = (
        ("LOW", "Low - Cosmetic/Minor"),
        ("MEDIUM", "Medium - Functional limitation"),
        ("HIGH", "High - Unusable/Dangerous"),
    )
    STATUS_CHOICES = (
        ("OPEN", "Open"),
        ("INVESTIGATING", "Investigating"),
        ("RESOLVED", "Resolved"),
    )

    equipment = models.ForeignKey(
        Equipment, on_delete=models.CASCADE, related_name="incidents"
    )
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="OPEN")
    resolved_at = models.DateTimeField(null=True, blank=True)
