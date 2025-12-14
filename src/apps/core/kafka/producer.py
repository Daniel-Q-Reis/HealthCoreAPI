"""
Kafka Producer Service

Singleton Kafka producer for publishing events.
"""

import json
import logging
from typing import Any, Optional

from confluent_kafka import KafkaException, Producer

from .config import KafkaConfig

logger = logging.getLogger(__name__)


class KafkaProducer:
    """
    Singleton Kafka producer for publishing events

    Usage:
        producer = KafkaProducer.get_instance()
        producer.publish('patient.created', {'patient_id': 123})
    """

    _instance: Optional["KafkaProducer"] = None

    def __init__(self) -> None:
        """Initialize Kafka producer"""
        if not KafkaConfig.ENABLED:
            logger.info("Kafka is disabled, events will not be published")
            self._producer = None
            return

        try:
            self._producer = Producer(KafkaConfig.PRODUCER_CONFIG)
            logger.info(f"Kafka producer initialized: {KafkaConfig.BOOTSTRAP_SERVERS}")
        except KafkaException as e:
            logger.error(f"Failed to initialize Kafka producer: {e}")
            self._producer = None

    @classmethod
    def get_instance(cls) -> "KafkaProducer":
        """Get singleton instance"""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def publish(
        self, event_type: str, data: dict[str, Any], key: Optional[str] = None
    ) -> bool:
        """
        Publish event to Kafka

        Args:
            event_type: Event type (e.g., 'patient.created')
            data: Event data dictionary
            key: Optional partition key

        Returns:
            True if published successfully, False otherwise
        """
        if not KafkaConfig.ENABLED or self._producer is None:
            logger.debug(f"Kafka disabled, skipping event: {event_type}")
            return False

        topic = KafkaConfig.get_topic_name(event_type)

        try:
            # Serialize data to JSON
            value = json.dumps(data).encode("utf-8")
            key_bytes = key.encode("utf-8") if key else None

            # Publish to Kafka
            self._producer.produce(
                topic=topic,
                value=value,
                key=key_bytes,
                callback=self._delivery_callback,
            )

            # Trigger delivery reports
            self._producer.poll(0)

            logger.info(f"Published event: {event_type} to topic: {topic}")
            return True

        except Exception as e:
            logger.error(f"Failed to publish event {event_type}: {e}")
            return False

    def flush(self, timeout: float = 5.0) -> int:
        """
        Wait for all messages to be delivered

        Args:
            timeout: Maximum time to wait in seconds

        Returns:
            Number of messages still in queue
        """
        if self._producer is None:
            return 0

        return int(self._producer.flush(timeout))

    @staticmethod
    def _delivery_callback(err: Any, msg: Any) -> None:
        """Callback for delivery reports"""
        if err:
            logger.error(f"Message delivery failed: {err}")
        else:
            logger.debug(
                f"Message delivered to {msg.topic()} "
                f"[partition {msg.partition()}] at offset {msg.offset()}"
            )

    def close(self) -> None:
        """Close producer and flush pending messages"""
        if self._producer is not None:
            self._producer.flush()
            logger.info("Kafka producer closed")
