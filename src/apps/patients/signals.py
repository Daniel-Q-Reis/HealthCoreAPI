"""
Patient Signals

Django signals to publish events when patient actions occur.
"""

import logging
from typing import Any

from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from src.apps.core.kafka import KafkaProducer
from src.apps.patients.events import (
    PatientCreatedEvent,
    PatientDeletedEvent,
    PatientUpdatedEvent,
)
from src.apps.patients.models import Patient

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Patient)
def publish_patient_saved(
    sender: type[Patient], instance: Patient, created: bool, **kwargs: Any
) -> None:
    """Publish event when patient is created or updated"""
    try:
        producer = KafkaProducer.get_instance()

        # Prepare patient data
        patient_data = {
            "mrn": instance.mrn,
            "given_name": instance.given_name,
            "family_name": instance.family_name,
            "email": instance.email if instance.email else None,
            "birth_date": instance.birth_date.isoformat()
            if hasattr(instance.birth_date, "isoformat")
            else str(instance.birth_date),
            "created_at": instance.created_at.isoformat()
            if hasattr(instance, "created_at")
            else None,
        }

        if created:
            # Patient created
            event: PatientCreatedEvent | PatientUpdatedEvent = PatientCreatedEvent(
                patient_id=instance.id, patient_data=patient_data
            )
            producer.publish(
                event_type=event.event_type, data=event.to_dict(), key=str(instance.id)
            )
        else:
            # Patient updated
            event = PatientUpdatedEvent(
                patient_id=instance.id, patient_data=patient_data
            )
            producer.publish(
                event_type=event.event_type, data=event.to_dict(), key=str(instance.id)
            )

    except Exception as e:
        logger.error(f"Failed to publish patient event: {e}")


@receiver(post_delete, sender=Patient)
def publish_patient_deleted(
    sender: type[Patient], instance: Patient, **kwargs: Any
) -> None:
    """Publish event when patient is deleted"""
    try:
        producer = KafkaProducer.get_instance()
        event = PatientDeletedEvent(patient_id=instance.id)

        producer.publish(
            event_type=event.event_type, data=event.to_dict(), key=str(instance.id)
        )

    except Exception as e:
        logger.error(f"Failed to publish patient deleted event: {e}")
