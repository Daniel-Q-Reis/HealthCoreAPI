"""
Tests for Kafka Producer Service
"""

from unittest.mock import Mock, patch

import pytest

from src.apps.core.kafka.config import KafkaConfig
from src.apps.core.kafka.producer import KafkaProducer


@pytest.fixture
def mock_kafka_producer():
    """Mock confluent_kafka Producer"""
    with patch("src.apps.core.kafka.producer.Producer") as mock:
        yield mock


@pytest.fixture
def kafka_producer(mock_kafka_producer):
    """Get KafkaProducer instance with mocked Producer"""
    # Reset singleton
    KafkaProducer._instance = None
    producer = KafkaProducer.get_instance()
    return producer


class TestKafkaProducer:
    """Test Kafka Producer"""

    def test_singleton_pattern(self, mock_kafka_producer):
        """Test that KafkaProducer is a singleton"""
        # Reset singleton
        KafkaProducer._instance = None

        producer1 = KafkaProducer.get_instance()
        producer2 = KafkaProducer.get_instance()

        assert producer1 is producer2

    def test_producer_initialization_when_enabled(self, mock_kafka_producer):
        """Test producer initializes when Kafka is enabled"""
        KafkaProducer._instance = None

        with patch.object(KafkaConfig, "ENABLED", True):
            producer = KafkaProducer.get_instance()

            assert producer._producer is not None
            mock_kafka_producer.assert_called_once_with(KafkaConfig.PRODUCER_CONFIG)

    def test_producer_not_initialized_when_disabled(self, mock_kafka_producer):
        """Test producer doesn't initialize when Kafka is disabled"""
        KafkaProducer._instance = None

        with patch.object(KafkaConfig, "ENABLED", False):
            producer = KafkaProducer.get_instance()

            assert producer._producer is None
            mock_kafka_producer.assert_not_called()

    def test_publish_event_success(self, kafka_producer, mock_kafka_producer):
        """Test publishing event successfully"""
        mock_producer_instance = mock_kafka_producer.return_value
        kafka_producer._producer = mock_producer_instance

        with patch.object(KafkaConfig, "ENABLED", True):
            result = kafka_producer.publish(
                event_type="patient.created",
                data={"patient_id": 123, "name": "Test"},
                key="123",
            )

            assert result is True
            mock_producer_instance.produce.assert_called_once()
            mock_producer_instance.poll.assert_called_once_with(0)

    def test_publish_event_when_disabled(self, kafka_producer):
        """Test publishing event when Kafka is disabled"""
        kafka_producer._producer = None

        with patch.object(KafkaConfig, "ENABLED", False):
            result = kafka_producer.publish(
                event_type="patient.created", data={"patient_id": 123}
            )

            assert result is False

    def test_publish_event_with_exception(self, kafka_producer, mock_kafka_producer):
        """Test publishing event handles exceptions"""
        mock_producer_instance = mock_kafka_producer.return_value
        mock_producer_instance.produce.side_effect = Exception("Kafka error")
        kafka_producer._producer = mock_producer_instance

        with patch.object(KafkaConfig, "ENABLED", True):
            result = kafka_producer.publish(
                event_type="patient.created", data={"patient_id": 123}
            )

            assert result is False

    def test_flush(self, kafka_producer, mock_kafka_producer):
        """Test flushing messages"""
        mock_producer_instance = mock_kafka_producer.return_value
        mock_producer_instance.flush.return_value = 0
        kafka_producer._producer = mock_producer_instance

        remaining = kafka_producer.flush(timeout=5.0)

        assert remaining == 0
        mock_producer_instance.flush.assert_called_once_with(5.0)

    def test_flush_when_no_producer(self, kafka_producer):
        """Test flushing when producer is None"""
        kafka_producer._producer = None

        remaining = kafka_producer.flush()

        assert remaining == 0

    def test_close(self, kafka_producer, mock_kafka_producer):
        """Test closing producer"""
        mock_producer_instance = mock_kafka_producer.return_value
        kafka_producer._producer = mock_producer_instance

        kafka_producer.close()

        mock_producer_instance.flush.assert_called_once()

    def test_delivery_callback_success(self):
        """Test delivery callback on success"""
        mock_msg = Mock()
        mock_msg.topic.return_value = "test-topic"
        mock_msg.partition.return_value = 0
        mock_msg.offset.return_value = 123

        # Should not raise exception
        KafkaProducer._delivery_callback(None, mock_msg)

    def test_delivery_callback_error(self):
        """Test delivery callback on error"""
        mock_err = Mock()
        mock_msg = Mock()

        # Should not raise exception
        KafkaProducer._delivery_callback(mock_err, mock_msg)
