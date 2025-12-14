# Kafka Event Streaming Guide

## Overview

Kafka is used for event-driven architecture in HealthCoreAPI. When important domain actions occur (patient created, appointment booked), events are automatically published to Kafka topics for asynchronous processing.

---

## Architecture

```
Django Model Change → Django Signal → Kafka Producer → Kafka Topic → Consumers
```

**Flow**:
1. User creates/updates a resource via API
2. Django saves model to database
3. Django signal fires automatically
4. Signal handler publishes event to Kafka
5. External consumers process events asynchronously

---

## Available Events

### Patient Events
- `healthcore.patient.created` - Patient created
- `healthcore.patient.updated` - Patient updated
- `healthcore.patient.deleted` - Patient deleted

### Appointment Events
- `healthcore.appointment.booked` - Appointment booked
- `healthcore.appointment.cancelled` - Appointment cancelled
- `healthcore.appointment.completed` - Appointment completed

---

## Event Schema

All events follow this structure:

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "event_type": "patient.created",
  "timestamp": "2025-12-14T19:00:00Z",
  "data": {
    "patient_id": 123,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "metadata": {
    "source": "healthcore-api",
    "version": "1.0"
  }
}
```

---

## Configuration

### Environment Variables
```bash
KAFKA_BOOTSTRAP_SERVERS=kafka:9092
KAFKA_ENABLED=True
KAFKA_TOPIC_PREFIX=healthcore
```

### Django Settings
Located in `src/healthcoreapi/settings/base.py`:
```python
KAFKA_BOOTSTRAP_SERVERS = 'kafka:9092'
KAFKA_ENABLED = True
KAFKA_TOPIC_PREFIX = 'healthcore'
```

---

## Publishing Events

Events are published **automatically** via Django signals. No manual code needed!

### Example: Creating a Patient
```python
# Just use the Django ORM normally
patient = Patient.objects.create(
    name="John Doe",
    email="john@example.com"
)

# Event is automatically published to Kafka! ✅
```

### Manual Publishing (Advanced)
```python
from src.apps.core.kafka import KafkaProducer
from src.apps.patients.events import PatientCreatedEvent

# Create event
event = PatientCreatedEvent(
    patient_id=123,
    patient_data={'name': 'John Doe'}
)

# Publish
producer = KafkaProducer.get_instance()
producer.publish(
    event_type=event.event_type,
    data=event.to_dict(),
    key=str(123)
)
```

---

## Consuming Events

### Using the Example Consumer
```bash
# Run consumer script
python scripts/kafka_consumer.py
```

### Custom Consumer
```python
from src.apps.core.kafka.consumer import KafkaConsumer

# Subscribe to events
consumer = KafkaConsumer([
    'patient.created',
    'appointment.booked'
])

# Start consuming
consumer.consume()
```

---

## Testing

### 1. Check Kafka is Running
```bash
docker-compose ps kafka
# Should show: Up
```

### 2. Create a Patient
```bash
curl -X POST http://localhost:8000/api/v1/patients/ \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Patient", "email": "test@example.com"}'
```

### 3. Check Kafka Topics
```bash
# List topics
docker-compose exec kafka kafka-topics --list --bootstrap-server localhost:9092

# Should show:
# healthcore.patient.created
# healthcore.appointment.booked
# etc.
```

### 4. Consume Events
```bash
# Console consumer
docker-compose exec kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic healthcore.patient.created \
  --from-beginning
```

---

## Troubleshooting

### Events Not Publishing
1. Check Kafka is running: `docker-compose ps kafka`
2. Check `KAFKA_ENABLED=True` in settings
3. Check Django logs: `docker-compose logs web`
4. Verify signals are registered in `apps.py`

### Consumer Not Receiving Events
1. Verify topic exists: `docker-compose exec kafka kafka-topics --list --bootstrap-server localhost:9092`
2. Check consumer group: `docker-compose exec kafka kafka-consumer-groups --list --bootstrap-server localhost:9092`
3. Check consumer logs for errors

### Connection Errors
1. Verify `KAFKA_BOOTSTRAP_SERVERS` is correct
2. Check network connectivity: `docker-compose exec web ping kafka`
3. Restart Kafka: `docker-compose restart kafka`

---

## Best Practices

### 1. Event Naming
- Use dot notation: `resource.action`
- Be specific: `patient.created` not `created`
- Use past tense: `created`, `updated`, `deleted`

### 2. Event Data
- Include resource ID
- Include relevant data for consumers
- Don't include sensitive data (passwords, tokens)
- Keep events small (<1MB)

### 3. Error Handling
- Events are fire-and-forget
- Don't block API requests on Kafka
- Log failures but don't fail requests
- Implement retry logic in consumers

### 4. Idempotency
- Consumers should be idempotent
- Use `event_id` to deduplicate
- Handle duplicate events gracefully

---

## Production Considerations

### Scaling
- Add more Kafka brokers for HA
- Increase partitions for parallelism
- Use consumer groups for load balancing

### Monitoring
- Monitor lag in consumer groups
- Track event publish rate
- Alert on failed deliveries

### Security
- Enable SASL authentication
- Use TLS for encryption
- Implement ACLs for topics

---

## Resources

- [Kafka Documentation](https://kafka.apache.org/documentation/)
- [confluent-kafka Python](https://docs.confluent.io/kafka-clients/python/current/overview.html)
- [Event-Driven Architecture](https://martinfowler.com/articles/201701-event-driven.html)

---

## Quick Reference

| Task | Command |
|------|---------|
| List topics | `docker-compose exec kafka kafka-topics --list --bootstrap-server localhost:9092` |
| Create topic | `docker-compose exec kafka kafka-topics --create --topic healthcore.test --bootstrap-server localhost:9092` |
| Consume events | `python scripts/kafka_consumer.py` |
| Check consumer groups | `docker-compose exec kafka kafka-consumer-groups --list --bootstrap-server localhost:9092` |
| Describe topic | `docker-compose exec kafka kafka-topics --describe --topic healthcore.patient.created --bootstrap-server localhost:9092` |

---

**Last Updated**: 2025-12-14
**Version**: 1.0
