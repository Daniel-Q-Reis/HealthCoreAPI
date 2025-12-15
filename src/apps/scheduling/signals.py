"""
Scheduling Signals

Django signals to publish events when appointment actions occur.
"""

import logging
from typing import Any

from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from src.apps.core.kafka import KafkaProducer
from src.apps.scheduling.events import (
    AppointmentBookedEvent,
    AppointmentCancelledEvent,
    AppointmentCompletedEvent,
)
from src.apps.scheduling.models import Appointment

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Appointment)
def publish_appointment_saved(
    sender: type[Appointment], instance: Appointment, created: bool, **kwargs: Any
) -> None:
    """Publish event when appointment is created or updated"""
    try:
        producer = KafkaProducer.get_instance()

        # Prepare appointment data
        appointment_data = {
            "patient_id": instance.patient_id
            if hasattr(instance, "patient_id")
            else None,
            "practitioner_id": instance.practitioner_id
            if hasattr(instance, "practitioner_id")
            else None,
            "scheduled_time": instance.scheduled_time.isoformat()
            if hasattr(instance, "scheduled_time")
            else None,
            "status": instance.status if hasattr(instance, "status") else None,
        }

        if created:
            # Appointment booked
            event: AppointmentBookedEvent | AppointmentCompletedEvent = (
                AppointmentBookedEvent(
                    appointment_id=instance.id, appointment_data=appointment_data
                )
            )
            producer.publish(
                event_type=event.event_type, data=event.to_dict(), key=str(instance.id)
            )
        else:
            # Check if appointment was completed
            if hasattr(instance, "status") and instance.status == "completed":
                event = AppointmentCompletedEvent(
                    appointment_id=instance.id, appointment_data=appointment_data
                )
                producer.publish(
                    event_type=event.event_type,
                    data=event.to_dict(),
                    key=str(instance.id),
                )

    except Exception as e:
        logger.error(f"Failed to publish appointment event: {e}")


@receiver(post_delete, sender=Appointment)
def publish_appointment_deleted(
    sender: type[Appointment], instance: Appointment, **kwargs: Any
) -> None:
    """Publish event when appointment is deleted (cancelled)"""
    try:
        producer = KafkaProducer.get_instance()
        event = AppointmentCancelledEvent(
            appointment_id=instance.id, reason="Appointment deleted"
        )

        producer.publish(
            event_type=event.event_type, data=event.to_dict(), key=str(instance.id)
        )

    except Exception as e:
        logger.error(f"Failed to publish appointment cancelled event: {e}")
