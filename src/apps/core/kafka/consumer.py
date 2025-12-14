"""
Kafka Consumer Example

Example consumer for testing and demonstrating event consumption.
"""

import json
import logging
from typing import Any

from confluent_kafka import Consumer

from src.apps.core.kafka.config import KafkaConfig

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class KafkaConsumer:
    """
    Example Kafka consumer for testing

    Usage:
        consumer = KafkaConsumer(['patient.created', 'appointment.booked'])
        consumer.consume()
    """

    def __init__(self, event_types: list[str]):
        """
        Initialize consumer

        Args:
            event_types: List of event types to subscribe to
        """
        self.event_types = event_types
        self.topics = [KafkaConfig.get_topic_name(et) for et in event_types]

        # Create consumer
        self.consumer = Consumer(KafkaConfig.CONSUMER_CONFIG)
        self.consumer.subscribe(self.topics)

        logger.info(f"Consumer subscribed to topics: {self.topics}")

    def consume(self, timeout: float = 1.0) -> None:
        """
        Consume messages from Kafka

        Args:
            timeout: Poll timeout in seconds
        """
        try:
            while True:
                msg = self.consumer.poll(timeout)

                if msg is None:
                    continue

                if msg.error():
                    logger.error(f"Consumer error: {msg.error()}")
                    continue

                # Decode message
                try:
                    event_data = json.loads(msg.value().decode("utf-8"))
                    logger.info(f"Received event from {msg.topic()}: {event_data}")

                    # Process event (implement your logic here)
                    self.process_event(msg.topic(), event_data)

                except json.JSONDecodeError as e:
                    logger.error(f"Failed to decode message: {e}")

        except KeyboardInterrupt:
            logger.info("Consumer interrupted by user")
        finally:
            self.close()

    def process_event(self, topic: str, event_data: dict[str, Any]) -> None:
        """
        Process received event

        Args:
            topic: Kafka topic
            event_data: Event data dictionary
        """
        # Example processing
        event_type = event_data.get("event_type", "unknown")
        event_id = event_data.get("event_id", "unknown")

        logger.info(f"Processing {event_type} (ID: {event_id})")

        # Add your business logic here
        # For example:
        # - Send notifications
        # - Update analytics
        # - Trigger workflows
        # - Sync with external systems

    def close(self) -> None:
        """Close consumer"""
        self.consumer.close()
        logger.info("Consumer closed")


if __name__ == "__main__":
    # Example usage
    consumer = KafkaConsumer(
        [
            "patient.created",
            "patient.updated",
            "patient.deleted",
            "appointment.booked",
            "appointment.cancelled",
            "appointment.completed",
        ]
    )

    logger.info("Starting consumer... Press Ctrl+C to stop")
    consumer.consume()
