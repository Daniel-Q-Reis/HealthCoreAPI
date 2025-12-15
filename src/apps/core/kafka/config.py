"""
Kafka Configuration

Centralized configuration for Kafka producers and consumers.
"""

import os
from typing import Any


class KafkaConfig:
    """Kafka configuration settings"""

    # Bootstrap servers
    BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092")

    # Enable/disable Kafka
    ENABLED = os.getenv("KAFKA_ENABLED", "True").lower() == "true"

    # Topic prefix for namespacing
    TOPIC_PREFIX = os.getenv("KAFKA_TOPIC_PREFIX", "healthcore")

    # Producer configuration
    PRODUCER_CONFIG: dict[str, Any] = {
        "bootstrap.servers": BOOTSTRAP_SERVERS,
        "client.id": "healthcore-api-producer",
        "acks": "all",  # Wait for all replicas
        "retries": 3,  # Retry failed sends
        "compression.type": "gzip",  # Compress messages
        "linger.ms": 10,  # Batch messages for 10ms
        "batch.size": 16384,  # Batch size in bytes
    }

    # Consumer configuration
    CONSUMER_CONFIG: dict[str, Any] = {
        "bootstrap.servers": BOOTSTRAP_SERVERS,
        "group.id": "healthcore-api-consumer",
        "auto.offset.reset": "earliest",
        "enable.auto.commit": True,
    }

    @classmethod
    def get_topic_name(cls, event_type: str) -> str:
        """
        Get full topic name with prefix

        Args:
            event_type: Event type (e.g., 'patient.created')

        Returns:
            Full topic name (e.g., 'healthcore.patient.created')
        """
        return f"{cls.TOPIC_PREFIX}.{event_type}"
