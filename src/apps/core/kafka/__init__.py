"""Kafka module for event streaming"""

from .config import KafkaConfig
from .producer import KafkaProducer

__all__ = ["KafkaProducer", "KafkaConfig"]
