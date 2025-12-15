# ADR-0014: Observability and Event-Driven Architecture

**Status:** Accepted
**Date:** 2025-12-14

## Context

As HealthCoreAPI evolves toward production readiness, we need comprehensive **observability** and **event-driven capabilities** to ensure system reliability, enable distributed tracing, and support asynchronous workflows.

### Business Drivers

- **Production Monitoring**: Real-time visibility into system health and performance
- **Scalability**: Support for event-driven microservices architecture
- **Operational Excellence**: Proactive issue detection and debugging capabilities
- **Compliance**: Audit trails and system observability for healthcare regulations

### Technical Requirements

- Real-time metrics collection and visualization
- Event streaming for asynchronous processing
- Distributed tracing capabilities
- Low-latency event publishing
- Graceful degradation when services unavailable

## Decision

We will implement a **comprehensive observability stack** with **Prometheus + Grafana** for metrics and **Apache Kafka** for event streaming, creating a production-ready monitoring and event-driven architecture.

### Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    Django Application                       │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   Metrics    │  │   Events     │  │   Logging       │  │
│  │  (Prometheus)│  │   (Kafka)    │  │  (Structured)   │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬────────┘  │
└─────────┼──────────────────┼───────────────────┼───────────┘
          │                  │                   │
          ▼                  ▼                   ▼
┌─────────────────┐  ┌──────────────────┐  ┌──────────────┐
│   Prometheus    │  │   Kafka Broker   │  │  Log Files   │
│   - Scraping    │  │   - KRaft Mode   │  │  - JSON      │
│   - Alerting    │  │   - Topics       │  │  - Rotation  │
│   - Storage     │  │   - Partitions   │  │              │
└────────┬────────┘  └────────┬─────────┘  └──────────────┘
         │                    │
         ▼                    ▼
┌─────────────────┐  ┌──────────────────┐
│    Grafana      │  │   Consumers      │
│   - Dashboards  │  │   - Analytics    │
│   - Alerts      │  │   - Notifications│
│   - Queries     │  │   - Integrations │
└─────────────────┘  └──────────────────┘
```

### Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Metrics** | Prometheus | Time-series metrics collection |
| **Visualization** | Grafana | Dashboards and alerting |
| **Event Streaming** | Apache Kafka | Asynchronous event processing |
| **Kafka Mode** | KRaft | Zookeeper-free Kafka (modern) |
| **Producer** | confluent-kafka | High-performance Python client |
| **Logging** | python-json-logger | Structured logging |

## Implementation

### 1. Prometheus Metrics

**Integration**: `django-prometheus`

```python
# Automatic metrics
- HTTP request duration
- Request count by endpoint
- Database query performance
- Cache hit/miss rates
- Celery task metrics
```

**Custom Metrics**:
```python
from prometheus_client import Counter, Histogram

patient_created = Counter('patients_created_total', 'Total patients created')
api_latency = Histogram('api_request_duration_seconds', 'API latency')
```

**Endpoint**: `http://localhost:8000/metrics`

### 2. Grafana Dashboards

**Pre-configured Dashboards**:
- Django Application Metrics
- Database Performance
- API Endpoint Performance
- Celery Task Monitoring
- System Health Overview

**Features**:
- Auto-provisioned datasources
- Custom dashboard templates
- Alert rules configuration

### 3. Kafka Event Streaming

**Architecture**:
```python
# Domain Events
@dataclass
class PatientCreatedEvent(BaseEvent):
    patient_id: int
    patient_data: dict[str, Any]
    event_type: str = "patient.created"

# Django Signals
@receiver(post_save, sender=Patient)
def publish_patient_saved(sender, instance, created, **kwargs):
    if created:
        event = PatientCreatedEvent(
            patient_id=instance.id,
            patient_data={...}
        )
        producer.publish(event_type=event.event_type, data=event.to_dict())
```

**Topics**:
- `healthcore.patient.created`
- `healthcore.patient.updated`
- `healthcore.patient.deleted`
- `healthcore.appointment.booked`
- `healthcore.appointment.cancelled`
- `healthcore.appointment.completed`

**Configuration**:
```bash
KAFKA_BOOTSTRAP_SERVERS=kafka:9092
KAFKA_ENABLED=True
KAFKA_TOPIC_PREFIX=healthcore
```

### 4. Structured Logging

**Format**: JSON with correlation IDs

```json
{
  "timestamp": "2025-12-14T20:00:00Z",
  "level": "INFO",
  "correlation_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Patient created",
  "patient_id": 123,
  "user_id": 456
}
```

## Consequences

### Positive

✅ **Observability**
- Real-time system health monitoring
- Performance bottleneck identification
- Proactive issue detection
- Historical trend analysis

✅ **Event-Driven Architecture**
- Decoupled services
- Asynchronous processing
- Scalability support
- Audit trail capabilities

✅ **Operational Excellence**
- Faster debugging with correlation IDs
- Better incident response
- Data-driven optimization
- Compliance support (audit logs)

✅ **Production Readiness**
- Enterprise-grade monitoring
- Distributed system support
- Scalability foundation
- Modern architecture patterns

### Negative

❌ **Infrastructure Complexity**
- Additional services to manage (Prometheus, Grafana, Kafka)
- More resource consumption
- Learning curve for operations team

❌ **Development Overhead**
- Need to instrument code with metrics
- Event schema management
- Testing complexity (mocking Kafka)

❌ **Operational Costs**
- Additional infrastructure resources
- Storage for metrics and events
- Monitoring and maintenance effort

### Mitigation Strategies

1. **Complexity Management**
   - Docker Compose for local development
   - Auto-provisioned Grafana dashboards
   - Graceful degradation (Kafka optional)

2. **Development Efficiency**
   - Automatic metrics via django-prometheus
   - Django signals for event publishing
   - Mocked tests (no real Kafka in CI/CD)

3. **Cost Optimization**
   - Metrics retention policies
   - Event topic compaction
   - Resource limits in Kubernetes

## Technical Details

### Prometheus Configuration

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'django'
    static_configs:
      - targets: ['web:8000']
    metrics_path: '/metrics'
    scrape_interval: 15s
```

### Kafka Producer (Singleton)

```python
class KafkaProducer:
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def publish(self, event_type: str, data: dict, key: str = None):
        topic = f"{TOPIC_PREFIX}.{event_type}"
        self._producer.produce(topic=topic, value=json.dumps(data), key=key)
```

### Event Schema

```python
@dataclass
class BaseEvent:
    event_type: str
    data: dict[str, Any]
    event_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: str = field(default_factory=lambda: datetime.now(UTC).isoformat())
    metadata: dict[str, Any] = field(default_factory=dict)
```

## Alternatives Considered

### 1. ELK Stack (Elasticsearch + Logstash + Kibana)

**Pros**: Powerful log aggregation, full-text search
**Cons**: Heavy resource usage, complex setup
**Decision**: Rejected - overkill for current scale

### 2. DataDog / New Relic (SaaS)

**Pros**: Managed service, less operational overhead
**Cons**: Expensive, vendor lock-in
**Decision**: Rejected - cost prohibitive for portfolio project

### 3. RabbitMQ for Events

**Pros**: Simpler than Kafka, good for small scale
**Cons**: Less scalable, no event replay
**Decision**: Rejected - Kafka better for event streaming

## Success Metrics

- ✅ Prometheus scraping Django metrics every 15s
- ✅ Grafana dashboards auto-provisioned on startup
- ✅ Kafka events published for all domain actions
- ✅ 90%+ test coverage including Kafka integration
- ✅ Zero errors in MyPy --strict mode
- ✅ Graceful degradation when Kafka disabled

## References

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
- [confluent-kafka Python](https://docs.confluent.io/kafka-clients/python/)
- [KRaft Mode](https://kafka.apache.org/documentation/#kraft)

## Related ADRs

- ADR-0004: Prometheus for Application Metrics
- ADR-0001: Modular Monolith (Event-driven preparation)
- ADR-0003: Celery and Redis (Async processing)

## Documentation

- `docs/PROMETHEUS.md` - Prometheus setup and queries
- `docs/GRAFANA.md` - Dashboard configuration
- `docs/KAFKA.md` - Event streaming guide (400+ lines)
