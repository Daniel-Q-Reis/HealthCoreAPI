# Documentation Index

Quick reference guide for all project documentation.

---

## Core Documentation

| Document | Description |
|----------|-------------|
| [README.md](./README.md) | Project overview, quick start, and tech stack |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture, bounded contexts, and strategic design |
| [STATUS.md](./STATUS.md) | Current development status and module progress |
| [ROADMAP.md](./ROADMAP.md) | Future features, milestones, and phased evolution |
| [SHOWCASE.md](./SHOWCASE.md) | Visual showcase with screenshots and feature demos |

---

## Security & Compliance

| Document | Description |
|----------|-------------|
| [SECURITY.md](./SECURITY.md) | Security policies and vulnerability reporting |
| [CRITICAL_CONTROL_POINTS.md](./docs/CRITICAL_CONTROL_POINTS.md) | Risk management protocols and financial impact analysis |
| [CCP_IMPLEMENTATION_STATUS.md](./docs/CCP_IMPLEMENTATION_STATUS.md) | Implementation status of critical control points |

---

## Development Guides

| Document | Description |
|----------|-------------|
| [README_BACKEND.md](./docs/README_BACKEND.md) | Backend architecture, Django apps, and API structure |
| [README_FRONTEND.md](./docs/README_FRONTEND.md) | Frontend architecture, Feature-Sliced Design, and components |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Contribution guidelines and code standards |
| [ENDPOINTS.md](./docs/ENDPOINTS.md) | API endpoints reference and documentation |

---

## Infrastructure & DevOps

| Document | Description |
|----------|-------------|
| [DOCKER.md](./docs/DOCKER.md) | Docker setup and container configuration |
| [KAFKA.md](./docs/KAFKA.md) | Event streaming setup and Kafka configuration |
| [PROMETHEUS.md](./docs/PROMETHEUS.md) | Metrics collection and Prometheus setup |
| [GRAFANA.md](./docs/GRAFANA.md) | Dashboard configuration and monitoring |
| [Helm Charts](./helm/) | Kubernetes deployment configuration |

### Terraform (Azure Container Apps)

| Document | Description |
|----------|-------------|
| [terraform/README.md](./terraform/README.md) | Terraform setup guide and deployment steps |
| [terraform/terraform.tfvars.example](./terraform/terraform.tfvars.example) | Variables template with placeholders |
| [terraform/setup.ps1.example](./terraform/setup.ps1.example) | PowerShell setup script |
| [ADR-0007](./docs/adr/0007-terraform-for-infrastructure-as-code.md) | Terraform IaC decision |
| [ADR-0018](./docs/adr/0018-azure-container-apps-deployment.md) | Azure Container Apps strategy |

**Terraform Files:**
- `providers.tf` - Azure provider configuration
- `variables.tf` - Input variables with validation
- `main.tf` - Resource Group, Container Apps Environment, Log Analytics
- `managed-services.tf` - PostgreSQL, Redis, Event Hubs, Cosmos DB
- `container-apps.tf` - Django, Go Audit, Celery, Grafana, Prometheus
- `static-web-app.tf` - Frontend hosting (Azure Static Web Apps)
- `outputs.tf` - Deployment URLs and connection strings

### Terraform (Azure AKS - Legacy)

| Document | Description |
|----------|-------------|
| [terraform/terraform-aks-old/](./terraform/terraform-aks-old/) | Legacy AKS configuration (preserved for reference) |

---

## Microservices Architecture

### Go Audit Service (gRPC + MongoDB)

The project implements a **polyglot microservice** alongside the Django monolith, using event-driven architecture with Kafka and gRPC.

```
┌─────────────┐   Kafka Event      ┌──────────────┐   Write    ┌──────────────┐
│   Django    │──healthcore.events─►│ Go Consumer  │──────────►│   MongoDB    │
│  (Python)   │                     │   (Kafka)    │           │ (Cosmos DB)  │
└─────────────┘                     └──────────────┘           └──────────────┘
       │                                    ▲                         │
       │           gRPC Query               │                         │
       └────────────────────────────────────┘                         │
                              (Port 50051)  ◄─────────────────────────┘
```

**Technology Stack:**
| Component | Technology | Purpose |
|-----------|------------|---------|
| Language | Go 1.24 | High concurrency, low memory footprint |
| Database | MongoDB (Azure Cosmos DB) | Audit log storage (NoSQL) |
| Ingestion | Apache Kafka | Event streaming |
| API | gRPC (Port 50051) | Query audit logs by `target_id` |
| Deployment | Azure Container Apps | Serverless containers |

**Source Code & Documentation:**

| Document | Description |
|----------|-------------|
| [services/audit-service/](./services/audit-service/) | Go microservice source code |
| [services/audit-service/proto/](./services/audit-service/proto/) | Protobuf definitions (.proto) |
| [gRPC Client](./src/apps/core/services/grpc_client.py) | Python gRPC client for Django integration |
| [Kafka Producer](./src/apps/core/services/audit_logger.py) | Django audit event publisher |
| [ADR-0016](./docs/adr/0016-audit-microservice-go.md) | Audit Microservice extraction decision |
| [ADR-0019](./docs/adr/0019-mongodb-audit-service.md) | MongoDB for Audit Service (Cosmos DB) |

**Integration Tests:**

| Script | Description |
|--------|-------------|
| [test_grpc.py](./scripts/test_grpc.py) | E2E gRPC test (Python → Go → MongoDB) |
| [test_kafka_integration.py](./scripts/test_kafka_integration.py) | E2E Kafka test (Django → Kafka → Go → MongoDB) |

---

## AI Integration

| Document | Description |
|----------|-------------|
| [AI_INTEGRATION.md](./AI_INTEGRATION.md) | Multi-provider AI architecture (Gemini/OpenAI) |

---

## Architecture Decision Records (ADRs)

### Backend ADRs

| ADR | Title |
|-----|-------|
| [ADR-0001](./docs/adr/0001-modular-monolith-with-service-repository-pattern.md) | Modular Monolith with Service-Repository Pattern |
| [ADR-0002](./docs/adr/0002-jwt-for-api-authentication.md) | JWT for API Authentication |
| [ADR-0003](./docs/adr/0003-celery-and-redis-for-asynchronous-tasks.md) | Celery and Redis for Asynchronous Tasks |
| [ADR-0004](./docs/adr/0004-prometheus-for-application-metrics.md) | Prometheus for Application Metrics |
| [ADR-0005](./docs/adr/0005-pybreaker-for-circuit-breaking.md) | PyBreaker for Circuit Breaking |
| [ADR-0006](./docs/adr/0006-helm-for-kubernetes-packaging.md) | Helm for Kubernetes Packaging |
| [ADR-0007](./docs/adr/0007-terraform-for-infrastructure-as-code.md) | Terraform for Infrastructure as Code |
| [ADR-0008](./docs/adr/0008-rbac-implementation.md) | RBAC Implementation |
| [ADR-0009](./docs/adr/0009-pharmacy-inventory-management.md) | Pharmacy Inventory Management |
| [ADR-0010](./docs/adr/0010-equipment-logistics-flow.md) | Equipment Logistics Flow |
| [ADR-0011](./docs/adr/0011-clinical-orders-service-request.md) | Clinical Orders Service Request |
| [ADR-0012](./docs/adr/0012-ai-integration-strategy.md) | AI Integration Strategy |
| [ADR-0013](./docs/adr/0013-full-stack-architecture-react-frontend.md) | Full-Stack Architecture React Frontend |
| [ADR-0014](./docs/adr/0014-observability-event-driven-architecture.md) | Observability Event-Driven Architecture |
| [ADR-0015](./docs/adr/0015-modern-dependency-management-uv.md) | Modern Dependency Management (uv) |
| [ADR-0016](./docs/adr/0016-audit-microservice-go.md) | Audit Log Microservice (Go + DynamoDB) |
| [ADR-0017](./docs/adr/0017-pragmatic-linting-strategy.md) | Pragmatic Linting Strategy |
| [ADR-0018](./docs/adr/0018-azure-container-apps-deployment.md) | Azure Container Apps Deployment Strategy |
| [ADR-0019](./docs/adr/0019-mongodb-audit-service.md) | MongoDB for Audit Service (Azure Cosmos DB) |
| [ADR-0020](./docs/adr/0020-ai-response-caching.md) | AI Response Caching with Semantic Search |

### Frontend ADRs

| ADR | Title |
|-----|-------|
| [Frontend ADR-0001](./docs/adr/frontend/0001-feature-sliced-design-architecture.md) | Feature-Sliced Design Architecture |
| [Frontend ADR-0002](./docs/adr/frontend/0002-healthcare-credential-verification-security.md) | Healthcare Credential Verification Security |
| [Frontend ADR-0003](./docs/adr/frontend/0003-jwt-browser-storage-strategy.md) | JWT Browser Storage Strategy |

---

## Development Environment

| Document | Description |
|----------|-------------|
| [VSCODE_SETUP.md](./docs/VSCODE_SETUP.md) | VS Code configuration and extensions |
| [WSL2_OPTIMIZATION.md](./docs/WSL2_OPTIMIZATION.md) | WSL2 performance optimization guide |

---

## Frontend

| Document | Description |
|----------|-------------|
| [frontend/README.md](./frontend/README.md) | Frontend quick start and setup |
| [frontend/ROADMAP.md](./frontend/ROADMAP.md) | Frontend-specific roadmap and features |

---

## Quick Navigation

- **New to the project?** Start with [README.md](./README.md)
- **Understanding architecture?** Read [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Setting up locally?** Check [DOCKER.md](./docs/DOCKER.md)
- **Contributing?** See [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Visual overview?** Browse [SHOWCASE.md](./SHOWCASE.md)
