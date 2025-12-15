#!/usr/bin/env python
"""
Standalone Kafka Consumer Script

Run this script to consume events from Kafka topics.

Usage:
    python scripts/kafka_consumer.py
"""

import os
import sys

import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "src.healthcoreapi.settings.dev")
django.setup()

from src.apps.core.kafka.consumer import KafkaConsumer  # noqa: E402

if __name__ == "__main__":
    print("🎧 Starting Kafka Consumer...")
    print("📡 Listening for events...")
    print("Press Ctrl+C to stop\n")

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

    consumer.consume()
