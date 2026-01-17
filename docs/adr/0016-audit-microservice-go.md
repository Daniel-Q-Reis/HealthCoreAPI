# ADR 0016: Audit Log Microservice Extraction (Go + NoSQL)

## Status
Accepted

## Date
2026-01-15

## Context
The HealthCoreAPI system is growing into an enterprise-grade Modular Monolith. However, certain responsibilities such as **Audit Logging** impose specific challenges that differ from the core transactional domain:

1.  **Write Volume**: Audit logs are generated for every significant action, creating high write throughput.
2.  **Data Shape**: Logs are immutable, schemaless (JSON payloads), and time-series based, which is suboptimal for Relational Databases (PostgreSQL).
3.  **Performance**: Writing logs synchronously in the main transaction loop slows down user requests.
4.  **Compliance**: HIPAA requires strict, tamper-evident logging of access to Protected Health Information (PHI).

## Decision
We will extract the **Audit Logging** domain into a dedicated **Microservice**.

### Technology Stack
*   **Language**: **Go (Golang) v1.24**. Chosen for its high concurrency, low memory footprint, and fast startup time (millisecond cold starts), making it ideal for Serverless execution.
*   **Database**: **DynamoDB**. A managed NoSQL database chosen for its ability to handle infinite scaling of immutable log data and predictable low-latency writes.
*   **Communication (Ingestion)**: **Apache Kafka**. The monolith will emit events (e.g., `PatientViewed`, `UserLoggedIn`) asynchronously. The Go service will consume these events.
*   **Communication (Query)**: **gRPC**. The monolith (Admin Dashboard) will query the Go service via gRPC for high-performance retrieval of log history.
*   **Infrastructure**: Dockerized container, deployable to **Azure Container Apps** (Serverless Containers) with KEDA autoscaling based on Kafka lag.

### Data Model (DynamoDB)
*   **Partition Key (PK)**: `EntityID` (e.g., `PATIENT#123`). Grouping logs by entity allows O(1) retrieval of "Who accessed Patient X?".
*   **Sort Key (SK)**: `Timestamp#EventID`. Ensures chronological ordering.
*   **TTL**: Auto-expiry of logs after 7 years (compliance standard).

## Consequences

### Positive
*   **Performance**: Offloads write pressure from the main PostgreSQL database.
*   **Decoupling**: The core system is resilient; if the Audit Service is down, events queue in Kafka without breaking user flows.
*   **Scalability**: The service can scale to zero or to thousands of replicas independently of the monolith.
*   **Observability**: Go service will export Prometheus metrics, allowing granular monitoring in Grafana.

### Negative
*   **Complexity**: Introduces a new language (Go) and database (DynamoDB) to the stack.
*   **Consistency**: Reads are eventually consistent (logs appear milliseconds after the event).

## Compliance (HIPAA)
*   Logs will store `ActorID`, `Action`, `Resource`, `Timestamp`, and `IPAddress`.
*   Data in DynamoDB will be encrypted at rest (AWS/Azure default).
