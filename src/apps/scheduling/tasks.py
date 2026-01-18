"""
Celery tasks for appointment scheduling automation.

This module implements three key automated tasks:
1. Daily appointment reminders (8 AM UTC)
2. Hourly auto-completion of past appointments
3. Weekly slot generation for 14-day rolling availability

All tasks use dynamic date calculations to ensure automation works correctly
regardless of when they run.
"""

import logging
from datetime import timedelta

from celery import shared_task
from django.db.models import QuerySet
from django.utils import timezone

from src.apps.practitioners.models import Practitioner
from src.apps.scheduling.models import Appointment, Slot

logger = logging.getLogger(__name__)


@shared_task  # type: ignore[misc]
def send_appointment_reminders() -> None:
    """
    Send reminders for appointments in the next 24 hours.

    Runs daily at 8 AM UTC. Finds all booked appointments scheduled
    for the next 24 hours and logs reminder notifications.

    Future enhancement: Send actual email/SMS notifications.
    """
    now = timezone.now()
    reminder_window_end = now + timedelta(hours=24)

    # Query appointments that are booked and starting within 24 hours
    upcoming_appointments: QuerySet[Appointment] = Appointment.objects.filter(
        status="booked",
        slot__start_time__gte=now,
        slot__start_time__lte=reminder_window_end,
    ).select_related("patient", "practitioner", "slot")

    reminder_count = 0
    for appointment in upcoming_appointments:
        logger.info(
            f"REMINDER: Appointment {appointment.id} for patient "
            f"{appointment.patient.given_name} {appointment.patient.family_name} "
            f"with Dr. {appointment.practitioner.family_name} "
            f"at {appointment.slot.start_time.isoformat()}"
        )
        reminder_count += 1

    logger.info(
        f"Appointment reminders task completed. Sent {reminder_count} reminders."
    )


@shared_task  # type: ignore[misc]
def auto_complete_past_appointments() -> None:
    """
    Automatically mark past appointments as completed.

    Runs hourly. Finds all appointments with status='booked' where the
    slot end time has passed, and updates their status to 'completed'.

    This ensures the appointment status reflects reality without manual updates.
    """
    now = timezone.now()

    # Query booked appointments where the slot has ended
    past_appointments: QuerySet[Appointment] = Appointment.objects.filter(
        status="booked",
        slot__end_time__lt=now,
    ).select_related("slot")

    updated_count = past_appointments.update(status="completed")

    logger.info(
        f"Auto-completion task completed. Updated {updated_count} appointments "
        f"to 'completed' status."
    )


@shared_task  # type: ignore[misc]
def generate_future_slots() -> None:
    """
    Generate appointment slots for the next 14 days.

    Runs weekly on Monday at 00:00 UTC. Ensures all doctors have available
    slots for the next 14 days, creating 30-minute slots from 8 AM to 5 PM
    (18 slots per day).

    Idempotent: Skips slot creation if slots already exist for a given time.
    """
    doctors: QuerySet[Practitioner] = Practitioner.objects.filter(role="doctor")

    if not doctors.exists():
        logger.warning("No doctors found. Skipping slot generation.")
        return

    # Dynamic date calculation - always works relative to current time
    today = timezone.now().date()
    target_end_date = today + timedelta(days=14)

    slots_created = 0

    for doctor in doctors:
        # Generate slots for each day in the 14-day window
        current_date = today

        while current_date <= target_end_date:
            # Create 18 slots per day (8 AM to 5 PM, 30-minute intervals)
            for hour_offset in range(9):  # 9 hours: 8 AM to 5 PM
                for minute_offset in [0, 30]:  # Two slots per hour
                    start_hour = 8 + hour_offset
                    from datetime import datetime, time

                    start_time = timezone.make_aware(
                        datetime.combine(
                            current_date,
                            time(hour=start_hour, minute=minute_offset),
                        )
                    )
                    end_time = start_time + timedelta(minutes=30)

                    # Idempotent: Only create if slot doesn't exist
                    slot, created = Slot.objects.get_or_create(
                        practitioner=doctor,
                        start_time=start_time,
                        end_time=end_time,
                        defaults={"is_booked": False},
                    )

                    if created:
                        slots_created += 1

            current_date += timedelta(days=1)

    logger.info(
        f"Slot generation task completed. Created {slots_created} new slots "
        f"for {doctors.count()} doctors covering {today} to {target_end_date}."
    )
