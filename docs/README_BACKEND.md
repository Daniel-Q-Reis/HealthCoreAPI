# HealthCoreAPI Backend Documentation

[![CI](https://github.com/Daniel-Q-Reis/HealthCoreAPI/actions/workflows/ci.yml/badge.svg)](https://github.com/Daniel-Q-Reis/HealthCoreAPI/actions/workflows/ci.yml)
[![Python 3.12](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/downloads/)
[![Django 5.2](https://img.shields.io/badge/django-5.2-green.svg)](https://docs.djangoproject.com/)
[![Code style: ruff](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/astral-sh/ruff/main/assets/badge/v2.json)](https://github.com/astral-sh/ruff)
[![Coverage: 92.23%](https://img.shields.io/badge/coverage-92.23%25-brightgreen.svg)]()
[![OpenAI Powered](https://img.shields.io/badge/OpenAI-Powered-412991.svg)](https://openai.com/)
[![Kubernetes Ready](https://img.shields.io/badge/kubernetes-ready-blue.svg)](https://kubernetes.io/)
[![Helm Chart](https://img.shields.io/badge/helm-chart-0f1689.svg)](https://helm.sh/)
[![Terraform](https://img.shields.io/badge/terraform-ready-7b42bc.svg)](https://www.terraform.io/)
[![Azure AKS](https://img.shields.io/badge/azure-aks-0078d4.svg)](https://azure.microsoft.com/en-us/services/kubernetes-service/)

**HealthCore API** is a secure, scalable, and high-performance backend system for comprehensive hospital operations management. This enterprise-grade healthcare platform demonstrates modern cloud-native architecture patterns, Infrastructure as Code practices, and production-ready deployment capabilities with Azure Kubernetes Service integration.

---

## 🌐 Services & Access

After running `docker-compose up -d`, access the following services:

| Service | URL | Credentials | Description |
|---------|-----|-------------|-------------|
| **Landing Page** | http://localhost:5173 | - | Modern React + TypeScript landing page with bilingual support (PT/EN) |
| **Django API** | http://localhost:8000 | `user@user.com` / `user1234` | RESTful API with DRF |
| **API Documentation** | http://localhost:5173/api/docs/ | - | Interactive Swagger UI |
| **Django Admin** | http://localhost:8000/admin | `user@user.com` / `user1234` | Admin interface |
| **Grafana** | http://localhost:3000 | `admin` / `admin` | Observability dashboards |
| **Prometheus** | http://localhost:9090 | - | Metrics collection and monitoring |
| **PostgreSQL** | localhost:5432 | `postgres` / `postgres` | Database |
| **Redis** | localhost:6379 | - | Cache & Celery broker |
| **Kafka** | localhost:9092 | - | Event streaming (KRaft mode) |

> **Note**: The landing page showcases the tech stack, features, cost comparison (W-8BEN vs CLT), and project portfolio with animated components and smooth transitions.

---

## 🏆 Project Highlights

### **Enterprise Architecture & Quality**
- **90%+ Test Coverage** with 200+ comprehensive tests
- **100% Type Safety** with MyPy strict mode (zero type errors across 172 source files)
- **Domain-Driven Design** with 12 bounded contexts
- **Clean Architecture** principles with service/repository patterns
- **Production-ready** CI/CD pipeline with automated quality gates
- **Infrastructure as Code** using Terraform for Azure AKS deployment
- **Event-Driven Architecture** with Kafka for asynchronous event streaming
- **Domain Events** automatically published via Django signals

### **Cloud-Native & DevOps Excellence**
- **Kubernetes-native** with professional Helm charts
- **Container orchestration** ready for enterprise scaling
- **Observability** with Grafana dashboards and Prometheus metrics
- **Resilience patterns** including circuit breakers and caching strategies
- **Security scanning** integrated with Bandit and Safety tools
- **Modern Frontend** with React + TypeScript landing page

### **Modern Development Practices**
- **DevContainer** environment for consistent development experience
- **Pre-commit hooks** ensuring code quality standards (Ruff, MyPy, Pytest)
- **Architecture Decision Records** (ADRs) documenting technical decisions
- **Comprehensive documentation** for setup, deployment, and operations
- **Bilingual Support** (PT/EN) in landing page with i18n

---

## 📁 Project Structure

```
HealthCoreAPI/
├── .devcontainer/                 # Development container configuration
│   ├── devcontainer.json         # VS Code devcontainer settings
│   └── setup.sh                  # Automated development environment setup
│
├── .github/                      # GitHub workflows and templates
│   └── workflows/                # CI/CD pipelines with quality gates
│       └── ci.yml                # Main CI pipeline (lint, test, build)
│
├── charts/                       # Production-ready Kubernetes Helm Charts
│   └── healthcoreapi/            # Main application Helm chart
│       ├── Chart.yaml            # Chart metadata and dependencies
│       ├── values.yaml           # Configuration values and defaults
│       └── templates/            # Kubernetes resource templates
│           ├── deployment.yaml   # Application deployment with health checks
│           ├── service.yaml      # Service definition and load balancing
│           ├── ingress.yaml      # Ingress configuration with TLS
│           ├── hpa.yaml          # Horizontal Pod Autoscaling
│           └── configmap.yaml    # Configuration management
│
├── docs/                         # Comprehensive project documentation
│   ├── adr/                      # Architecture Decision Records (17 total)
│   │   ├── 0001-modular-monolith-with-service-repository-pattern.md
│   │   ├── 0002-jwt-for-api-authentication.md
│   │   ├── 0003-celery-and-redis-for-asynchronous-tasks.md
│   │   ├── 0004-prometheus-for-application-metrics.md
│   │   ├── 0005-pybreaker-for-circuit-breaking.md
│   │   ├── 0006-helm-for-kubernetes-packaging.md
│   │   ├── 0007-terraform-for-infrastructure-as-code.md
│   │   ├── 0008-rbac-implementation.md
│   │   ├── 0009-pharmacy-inventory-management.md
│   │   ├── 0010-equipment-logistics-flow.md
│   │   ├── 0011-clinical-orders-service-request.md
│   │   ├── 0012-ai-integration-strategy.md
│   │   ├── 0013-full-stack-architecture-react-frontend.md
│   │   ├── 0014-observability-event-driven-architecture.md
│   │   ├── 0015-modern-dependency-management-uv.md
│   │   ├── 0016-audit-microservice-go.md  # Go microservice extraction (Kafka+gRPC+DynamoDB)
│   │   ├── 0017-pragmatic-linting-strategy.md  # Focused Python linting approach
│   │   └── frontend/             # Frontend-specific ADRs (3)
│   │       ├── 0001-feature-sliced-design-architecture.md
│   │       ├── 0002-healthcare-credential-verification-security.md
│   │       └── 0003-jwt-browser-storage-strategy.md
│   ├── README_BACKEND.md         # Detailed backend documentation
│   ├── README_FRONTEND.md        # Detailed frontend documentation
│   ├── CCP_IMPLEMENTATION_STATUS.md  # Critical Control Points status
│   ├── CRITICAL_CONTROL_POINTS.md    # HIPAA compliance controls
│   ├── DOCKER.md                 # Docker configuration guide
│   ├── GRAFANA.md                # Grafana dashboards guide
│   ├── KAFKA.md                  # Kafka event streaming guide (400+ lines)
│   ├── PROMETHEUS.md             # Prometheus monitoring guide
│   ├── VSCODE_SETUP.md           # VS Code development environment
│   └── WSL2_OPTIMIZATION.md      # Windows WSL2 performance guide
│
├── grafana/                      # Grafana observability configuration
│   └── provisioning/
│       ├── datasources/          # Prometheus datasource
│       └── dashboards/           # Dashboard JSON definitions
│
├── prometheus/                   # Prometheus configuration
│   └── prometheus.yml            # Scrape configuration
│
├── scripts/                      # Utility and deployment scripts
│   ├── entrypoint.sh             # Docker entrypoint
│   ├── wait-for-services.sh      # Service health checks
│   ├── celery-worker.sh          # Celery worker startup with volume checks
│   ├── celery-beat.sh            # Celery beat scheduler startup
│   ├── generate_proto.sh         # Protobuf stub generation (Python from Go .proto)
│   ├── test_grpc.py              # E2E gRPC test (Python → Go → DynamoDB)
│   ├── test_kafka_integration.py # E2E Kafka test (Django → Kafka → Go → DynamoDB)
│   ├── kafka_consumer.py         # Kafka event consumer example
│   └── seed_admin_test.py        # Test data seeding
│
├── services/                     # Microservices (Polyglot Architecture)
│   └── audit-service/            # Go Audit Log Microservice
│       ├── cmd/
│       │   └── server/
│       │       └── main.go       # Application entry point
│       ├── internal/
│       │   ├── grpc/
│       │   │   └── server.go     # gRPC server implementation (LogEvent, GetAuditLogs)
│       │   ├── kafka/
│       │   │   └── consumer.go   # Kafka consumer (healthcore.events topic)
│       │   └── repository/
│       │       └── dynamo.go     # DynamoDB repository (PK: target_id, SK: timestamp)
│       ├── proto/
│       │   ├── audit.proto       # Protobuf contract (gRPC service definition)
│       │   ├── audit_pb2.go      # Generated Go protobuf code
│       │   └── audit_grpc.pb.go  # Generated Go gRPC code
│       ├── Dockerfile            # Multi-stage build (Go 1.24)
│       ├── go.mod                # Go module definition
│       └── go.sum                # Go dependencies lockfile
│
├── terraform/                    # Infrastructure as Code (Azure AKS)
│   ├── providers.tf              # Terraform & Azure provider config
│   ├── variables.tf              # Configurable parameters
│   └── main.tf                   # Azure resources (AKS, RG, Monitoring)
│
├── src/                          # Django Backend Source Code
│   ├── apps/                     # Bounded Contexts (12 domains)
│   │   ├── admissions/           # Hospital admissions & bed management
│   │   │   ├── models.py         # Admission, Bed, Ward models
│   │   │   ├── services.py       # Admission business logic
│   │   │   ├── views.py          # API viewsets
│   │   │   └── tests/            # Unit & integration tests
│   │   │
│   │   ├── core/                 # Shared functionality & RBAC
│   │   │   ├── fixtures/
│   │   │   │   └── roles.json    # 6 RBAC roles (Admins, Doctors, Nurses, Patients, Receptionists, Pharmacists)
│   │   │   ├── grpc_proto/       # Generated Python protobuf stubs
│   │   │   │   ├── __init__.py
│   │   │   │   ├── audit_pb2.py  # Protobuf message definitions
│   │   │   │   ├── audit_pb2.pyi # Type stubs for MyPy
│   │   │   │   └── audit_pb2_grpc.py  # gRPC service stubs
│   │   │   ├── kafka/            # Kafka integration
│   │   │   │   ├── __init__.py
│   │   │   │   ├── producer.py   # Kafka producer (singleton, healthcore.* topics)
│   │   │   │   └── events.py     # Domain events (Patient, Appointment, 6 types)
│   │   │   ├── services/         # Business services
│   │   │   │   ├── __init__.py
│   │   │   │   ├── core_services.py  # Core business logic (create_post)
│   │   │   │   ├── grpc_client.py    # gRPC client for Audit Service
│   │   │   │   ├── audit_logger.py   # Kafka audit logger (wrapper)
│   │   │   │   └── dto.py            # Data Transfer Objects (KafkaAuditEvent)
│   │   │   ├── permissions.py    # RBAC permission classes (490 lines)
│   │   │   ├── ai_client.py      # Unified AI client (Gemini + OpenAI)
│   │   │   ├── middleware.py     # Correlation ID, logging
│   │   │   └── health.py         # Health check endpoints
│   │   │
│   │   ├── departments/          # Department & specialty management
│   │   ├── equipment/            # Medical equipment tracking
│   │   ├── experience/           # Patient feedback & AI analysis
│   │   ├── orders/               # Clinical orders (FHIR ServiceRequest)
│   │   ├── patients/             # Patient records & EHR
│   │   ├── pharmacy/             # Medication inventory & AI drug info
│   │   ├── practitioners/        # Medical staff management
│   │   ├── results/              # Diagnostic results & imaging
│   │   ├── scheduling/           # Appointment booking
│   │   └── shifts/               # Staff shift management
│   │
│   ├── healthcoreapi/            # Django project configuration
│   │   ├── settings/             # Environment-specific settings
│   │   │   ├── base.py           # Base settings
│   │   │   ├── development.py    # Development overrides
│   │   │   ├── production.py     # Production settings
│   │   │   └── test.py           # Test configuration
│   │   ├── celery.py             # Celery configuration
│   │   ├── urls.py               # URL routing & API versioning
│   │   └── wsgi.py               # WSGI configuration
│   │
│   ├── static/                   # Static files
│   ├── templates/                # HTML & email templates
│   └── conftest.py               # Pytest fixtures
│
├── .dockerignore                 # Docker build optimization
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore patterns
├── .pre-commit-config.yaml       # Code quality hooks
├── ARCHITECTURE.md               # System architecture documentation
├── CONTRIBUTING.md               # Contribution guidelines
├── Dockerfile                    # Multi-stage Docker build
├── LICENSE                       # Apache-2.0 License
├── Makefile                      # Development automation
├── README.md                     # This file
├── ROADMAP.md                    # Project roadmap
├── SECURITY.md                   # Security policies
├── SHOWCASE.md                   # Technical showcase with screenshots
├── STATUS.md                     # Current project status
├── docker-compose.yml            # Development orchestration
├── docker-compose.prod.yml       # Production configuration
├── docker-compose.override.yml   # Local overrides
├── manage.py                     # Django management script
├── mypy.ini                      # MyPy configuration
├── nginx.conf                    # Nginx production config
├── pyproject.toml                # Python project config
├── pytest.ini                    # Pytest configuration
├── requirements.in               # Production dependencies
├── requirements.txt              # Pinned dependencies
├── requirements-dev.in           # Development dependencies
└── requirements-dev.txt          # Pinned dev dependencies
```

---

## 🏗️ Architecture & Design

This project demonstrates **Enterprise-Grade Software Architecture** designed as a **Modular Monolith** with microservices-ready internal structure. Built with Clean Architecture principles, Domain-Driven Design, and cloud-native patterns for scalability and maintainability.

### **Architectural Foundations**

- **Domain-Driven Design**: Clear bounded contexts representing distinct business capabilities
- **Clean Architecture**: Dependency inversion and separation of concerns throughout
- **Service Layer Pattern**: Business logic encapsulated and decoupled from framework concerns
- **Repository Pattern**: Data access abstraction enabling testability and flexibility
- **Circuit Breaker Pattern**: Resilience and fault tolerance for external dependencies
- **Infrastructure as Code**: Complete automation of cloud resources with Terraform

### **Cloud-Native Design Principles**

- **Container-First**: Docker-native development and deployment
- **Kubernetes-Ready**: Helm charts with enterprise production standards
- **Observable**: Built-in health checks, metrics, and monitoring integration
- **Scalable**: Horizontal scaling capabilities with load balancing support
- **Resilient**: Circuit breakers, retry logic, and graceful degradation
- **Secure**: Security scanning, non-root containers, and secret management

### **Documentation Strategy**

- **Strategic Vision**: Overall architectural strategy and principles in [ARCHITECTURE.md](ARCHITECTURE.md)
- **Technical Decisions**: Architecture Decision Records (ADRs) in [docs/adr/](docs/adr/)
- **Operational Guides**: Setup and optimization documentation in [docs/](docs/)
- **API Documentation**: Auto-generated OpenAPI specs with DRF Spectacular

---

## ✨ Core Features & Bounded Contexts

The system implements a **comprehensive healthcare management platform** with the following business domains:

### **Patient & Staff Management**
- **Patients**: Electronic health records, medical history, and patient data management
- **Practitioners**: Medical staff credentials, specializations, and profile management
- **Departments**: Hospital department organization and medical specialty management

### **Clinical Operations**
- **Scheduling**: Advanced appointment booking with conflict resolution and availability management
- **Admissions**: Hospital admission workflows with bed allocation and ward management
- **Orders**: Clinical order management with FHIR ServiceRequest alignment (Lab, Imaging, Procedures)
- **Results**: Diagnostic report management with imaging and laboratory result integration
- **Shifts**: Staff scheduling, availability tracking, and shift management

### **Pharmacy & Logistics**
- **Pharmacy**: Medication inventory management with dispensation tracking and low-stock alerts
- **Equipment**: Medical equipment tracking, QR-based handoffs, and maintenance scheduling

### **Patient Experience & Quality**
- **Experience Management**: Patient feedback collection and complaint resolution systems
- **Quality Metrics**: Patient satisfaction tracking and experience analytics

### **System Reliability & Operations**
- **Health Monitoring**: Comprehensive health checks for databases, cache, and external services
- **Observability**: Prometheus metrics export and monitoring integration
- **Resilience**: Circuit breaker patterns for fault tolerance and system stability
- **Security**: Authentication, authorization, and audit logging

### **🤖 AI-Powered Intelligence** ⭐ **(NEW - Production Ready)**

HealthCoreAPI integrates **Google Gemini 2.5 Flash** (with OpenAI GPT fallback) to provide intelligent clinical decision support and operational insights, setting it apart from typical healthcare management systems.

#### **Pharmacy AI: Drug Information Assistant**
Intelligent medication management powered by Gemini 2.5 Flash:

- **Drug Interactions**: Real-time analysis of potential drug-drug interactions
- **Dosage Guidance**: Evidence-based dosing recommendations by patient demographics
- **Contraindications**: Automated detection of contraindications and warnings
- **Clinical Context**: Contextual information for prescribers and pharmacists
- **API Endpoint**: `POST /api/v1/pharmacy/ai/drug-info/`

**Example Use Case**:
```json
POST /api/v1/pharmacy/ai/drug-info/
{
  "medication_name": "Warfarin",
  "patient_context": "65-year-old with atrial fibrillation, taking aspirin"
}

Response:
{
  "drug_info": "Warfarin is an anticoagulant... [detailed AI-generated guidance]",
  "interactions": ["Aspirin increases bleeding risk with warfarin..."],
  "dosage_recommendations": "Typical starting dose 2-5mg daily...",
  "contraindications": ["Active bleeding", "Severe liver disease..."]
}
```

#### **Experience AI: Patient Feedback Analyzer**
Automated sentiment analysis and actionable insights from patient feedback:

- **Sentiment Detection**: Multi-class sentiment analysis (positive, neutral, negative)
- **Key Issues Extraction**: Automatic identification of recurring themes and problems
- **Actionable Insights**: AI-generated recommendations for service improvement
- **Trend Analysis**: Pattern recognition across multiple feedback submissions
- **API Endpoint**: `POST /api/v1/experience/ai/analyze/`

**Example Use Case**:
```json
POST /api/v1/experience/ai/analyze/
{
  "feedback_text": "The wait time was too long, but the doctor was very professional and caring."
}

Response:
{
  "sentiment": "mixed",
  "sentiment_score": 0.65,
  "key_issues": ["Long wait times", "Professional staff"],
  "actionable_insights": [
    "Consider optimizing appointment scheduling to reduce wait times",
    "Recognize and maintain high-quality patient-doctor interactions"
  ],
  "summary": "Patient appreciates medical care quality but concerned about wait times"
}
```

#### **Unified AIClient Architecture**
- **Multi-Provider Support**: Gemini 2.5 Flash (primary) + OpenAI GPT (fallback)
- **Multimodal Ready**: Architecture prepared for image/video analysis (future)
- **Cost Optimized**: Using Gemini 2.5 Flash free tier (15 RPM, 1M tokens/month)
- **Graceful Degradation**: System continues functioning if AI service unavailable
- **Configurable Models**: Easy switching between providers and models
- **Rate Limiting**: Built-in retry logic and error handling
- **Testing**: Fully mocked in CI/CD (no real API calls during tests)

**Technical Implementation**:
```python
# Centralized AI client with multi-provider support
from src.apps.core.ai_client import AIClient

client = AIClient()  # Uses Gemini 2.5 Flash by default
response = client.generate_completion(
    prompt="Analyze drug interaction between...",
    max_tokens=500
)
# Returns None if AI unavailable, allowing system to continue
```

**AI Provider Configuration**:
```bash
# Environment variables
OPENAI_API_KEY=your_openai_key  # Optional fallback
OPENAI_MODEL=gpt-3.5-turbo      # Fallback model

# Currently using Gemini 2.5 Flash (free tier)
# 5 requests/minute
# 20 requests/day free
# Note: Google offers $300 credit for 3 months for extended testing
```

**Why This Matters**:
- ✅ **Differentiation**: Few portfolio projects integrate real AI capabilities
- ✅ **Production-Ready**: Not a proof-of-concept, fully functional with error handling
- ✅ **Modern Stack**: Gemini 2.5 Flash (latest Google AI) + OpenAI fallback
- ✅ **Cost Efficient**: Free tier usage with 1M tokens/month
- ✅ **Multimodal Ready**: Architecture prepared for future image/video analysis
- ✅ **Business Value**: Tangible clinical decision support and operational insights

📚 **Complete Documentation**: See [AI_INTEGRATION.md](AI_INTEGRATION.md) for architecture, configuration, and advanced use cases


---

## 🛠️ Tech Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|----------|
| **Framework** | Django | 5.2 | Web Framework & ORM |
| **API** | Django REST Framework | 3.15+ | RESTful API Development & OpenAPI Documentation |
| **Database** | PostgreSQL | 15+ | Primary Database with ACID Compliance |
| **Cache & Queue** | Redis | 7+ | Caching Layer & Message Broker |
| **Background Tasks** | Celery | 5.5+ | Asynchronous Task Processing |
| **Testing** | Pytest | 8.4+ | Test Framework with Fixtures |
| **Code Quality** | Ruff + MyPy | Latest | Linting, Formatting & Static Type Checking |
| **Security** | Bandit + Safety | Latest | Security Vulnerability Scanning |
| **Error Tracking** | Sentry | 2.10+ | Production Error Monitoring & Alerting |
| **Metrics** | Prometheus | Latest | Application Metrics Collection & Export |
| **Resilience** | PyBreaker | 1.2+ | Circuit Breaker Pattern Implementation |
| **Containerization** | Docker | 24+ | Application Packaging & Isolation |
| **Orchestration** | Kubernetes + Helm | 1.29+ | Container Orchestration & Package Management |
| **Infrastructure** | Terraform | 1.5+ | Infrastructure as Code for Azure AKS |
| **Development** | VS Code + DevContainers | Latest | Consistent Development Environment |

---

## 🚀 Quick Start

### **Prerequisites**
- **Local Development**: Docker Desktop & Docker Compose
- **DevContainer**: VS Code with Remote-Containers extension
- **Cloud Deployment**: Kubernetes cluster with Helm 3+
- **Infrastructure**: Terraform CLI and Azure CLI for cloud provisioning

### **Development Setup**

#### **Option 1: DevContainer Development (Recommended)**

1. **Configure your development environment:**
   ```
   cp .env.example .env
   ```

2. **Update `.env` with your personal configuration:**
   ```
   # Personal configuration (required for git operations)
   GIT_AUTHOR_NAME="Your Full Name"
   GIT_AUTHOR_EMAIL="your.email@example.com"

   # Development settings (defaults provided)
   DEBUG=True
   DATABASE_URL=postgres://healthcore:healthcore123@postgres:5432/healthcoreapi
   CELERY_BROKER_URL=redis://redis:6379/0
   CACHE_URL=redis://redis:6379/1
   ```

3. **Launch DevContainer environment:**
   - Install VS Code "Dev Containers" extension
   - Open project folder in VS Code
   - Select "Reopen in Container" when prompted
   - Or use Command Palette: `Dev Containers: Reopen in Container`

4. **Automated setup includes:**
   - ✅ Python 3.12 development environment
   - ✅ All project dependencies pre-installed
   - ✅ Git configuration from environment variables
   - ✅ Kubernetes tools (kubectl + helm) for deployment testing
   - ✅ Enhanced terminal with git branch display
   - ✅ Pre-commit hooks for code quality
   - ✅ Database migrations applied automatically
   - ✅ RBAC roles loaded from fixtures

#### **Option 2: Standard Docker Development**

1. **Complete setup with single command:**
   ```
   make setup
   ```

2. **Access your development environment:**
   - **API Documentation**: [http://127.0.0.1:8000/api/docs/](http://127.0.0.1:8000/api/docs/)
   - **Django Admin**: [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/) (admin/admin123)
   - **Health Monitoring**: [http://127.0.0.1:8000/health/](http://127.0.0.1:8000/health/)
   - **Prometheus Metrics**: [http://127.0.0.1:8000/metrics](http://127.0.0.1:8000/metrics)

---

## ⚙️ Development Commands

All development workflows are automated through `make` commands. Execute `make help` for complete command reference.

### **Core Development Workflow**
| Command | Description |
|---------|-------------|
| `make setup` | 🚀 **Complete initial setup**: builds containers, applies migrations, creates superuser |
| `make up` | ⬆️ **Start services**: launches all containers in background |
| `make down` | ⬇️ **Stop services**: gracefully stops all containers |
| `make restart` | 🔄 **Restart services**: stops and starts all containers |

### **Quality Assurance & Testing**
| Command | Description |
|---------|-------------|
| `make test` | 🧪 **Run test suite**: executes all tests with coverage reporting |
| `make quality` | ✅ **Full quality check**: runs linting, formatting, type checking, and tests |
| `make lint` | 📋 **Code linting**: runs ruff linting with automatic fixes |
| `make format` | 🎨 **Code formatting**: formats code with ruff formatter |

### **Development Utilities**
| Command | Description |
|---------|-------------|
| `make shell` | 🐚 **Django shell**: interactive Python shell with Django context |
| `make superuser` | 👤 **Create superuser**: interactive superuser creation |
| `make migrations` | 🔄 **Generate migrations**: creates Django database migrations |
| `make logs` | 📋 **View logs**: streams logs from all running services |

### **Kubernetes & Cloud Development**
| Command | Description |
|---------|-------------|
| `k get nodes` | 🔍 **Check cluster**: validate Kubernetes cluster connectivity |
| `helm template charts/healthcoreapi/` | 📋 **Render templates**: preview Kubernetes manifests |
| `helm lint charts/healthcoreapi/` | ✅ **Validate chart**: check Helm chart for errors |
| `helm install healthcore charts/healthcoreapi/` | 🚀 **Deploy locally**: install to local Kubernetes cluster |

---

## 🧪 Testing & Quality Assurance

### **Comprehensive Testing Strategy**
This project implements **enterprise-grade quality assurance** with multiple testing layers:

- **Unit Tests**: Business logic validation with 92.23% coverage
- **Integration Tests**: API endpoint testing with authentication
- **Service Tests**: Domain service behavior validation
- **Repository Tests**: Data access layer verification
- **Security Tests**: Vulnerability scanning with Bandit and Safety

### **Quality Gates & Automation**
Execute complete quality validation:
```
make quality
```

This automated pipeline includes:
- **pytest**: 191 tests with comprehensive coverage reporting
- **ruff**: Code formatting and linting with automatic fixes
- **mypy**: Static type checking for type safety
- **bandit**: Security vulnerability detection
- **safety**: Dependency vulnerability scanning
- **pre-commit**: Automated checks on every commit

### **CI/CD Pipeline Integration**
- **Migration Validation**: Prevents production deployment failures
- **Requirements Consistency**: Ensures dependency synchronization
- **Security Scanning**: Automated vulnerability detection
- **Test Coverage**: Enforces minimum 75% coverage threshold
- **Docker Build**: Multi-architecture container build validation

---

## ☸️ Kubernetes & Cloud Deployment

### **Production-Ready Helm Charts**
Professional Kubernetes deployment with enterprise features:

- **Health Checks**: Liveness and readiness probes for reliability
- **Resource Management**: CPU/memory limits and requests optimization
- **Horizontal Scaling**: HPA configuration for automatic scaling
- **Security**: Security contexts and non-root container execution
- **Configuration**: ConfigMaps and Secrets management
- **Ingress**: Load balancing with TLS termination support

### **Local Kubernetes Testing**
```
# Validate Helm chart configuration
helm lint charts/healthcoreapi/

# Preview generated Kubernetes manifests
helm template healthcore charts/healthcoreapi/

# Deploy to local development cluster
helm install healthcore charts/healthcoreapi/ \
  --set image.repository=healthcoreapi \
  --set image.tag=latest \
  --set ingress.enabled=false
```

### **Azure AKS Production Deployment**
```
# Deploy complete infrastructure with Terraform
cd terraform/
terraform init
terraform plan
terraform apply

# Deploy application to provisioned AKS cluster
helm install healthcore charts/healthcoreapi/ \
  --set image.repository=your-registry.azurecr.io/healthcoreapi \
  --set image.tag=v1.0.0 \
  --set ingress.enabled=true \
  --set ingress.hosts.host=api.yourdomain.com
```

---

## 🌩️ Infrastructure as Code

### **Terraform Azure Integration**
Complete infrastructure automation for enterprise Azure deployment:

#### **Infrastructure Components**
- **Azure Resource Group**: Logical container for all project resources
- **Azure Kubernetes Service (AKS)**: Managed Kubernetes cluster with latest versions
- **Log Analytics Workspace**: Enterprise monitoring and observability integration
- **System Managed Identity**: Secure Azure AD authentication without credential management

#### **Configuration & Deployment**
```
# Initialize Terraform workspace
cd terraform/
terraform init

# Review infrastructure changes
terraform plan

# Deploy complete Azure infrastructure
terraform apply

# Verify AKS cluster provisioning
az aks get-credentials --resource-group healthcore-rg-prod --name healthcore-aks-prod
kubectl get nodes
```

#### **Enterprise Features**
- **Production Naming**: Clear `-prod` environment identification
- **Modern VM Series**: Cost-optimized `Standard_D2s_v5` virtual machines
- **Latest Kubernetes**: Version 1.29.4 for security and feature support
- **Integrated Monitoring**: Log Analytics workspace with OMS agent configuration

---

## 🔧 Development Environment

### **DevContainer Professional Features**
The development environment provides a **complete, consistent setup** for all team members:

#### **Pre-configured Development Tools**
- **🐍 Python 3.12**: Latest Python with optimized performance
- **🐳 Docker-in-Docker**: Container development and testing capabilities
- **☸️ Kubernetes Tools**: kubectl and helm for deployment workflows
- **🔧 Development Utilities**: git, pre-commit, and quality assurance tools
- **🎨 Enhanced Terminal**: Git branch display and Kubernetes context awareness
- **⚡ Shell Completion**: Auto-completion for kubectl and helm commands
- **🔒 Security Tools**: Integrated vulnerability scanning and code analysis

#### **VS Code Extension Suite**
Automatically installed extensions for optimal development experience:
- **Python Development**: IntelliSense, debugging, and testing support
- **Docker & Kubernetes**: Container and orchestration management
- **Code Quality**: Automated formatting, linting, and error detection
- **Git Integration**: Advanced version control and collaboration features

#### **Developer Experience Optimization**
- **Instant Environment**: Zero-configuration development setup
- **Performance Optimized**: WSL2 integration with optimized I/O operations
- **Team Consistency**: Identical development environment for all contributors
- **Professional Workflow**: Pre-commit hooks and quality gates integrated

---

## 🚀 Production Deployment Options

### **Docker Compose Production**
```
# Build and deploy production stack
docker-compose -f docker-compose.prod.yml up -d --build

# Scale application instances
docker-compose -f docker-compose.prod.yml up -d --scale web=3
```

### **Kubernetes Enterprise Deployment**
```
# Deploy with production-grade configuration
helm install healthcore charts/healthcoreapi/ \
  --values charts/healthcoreapi/values.prod.yaml \
  --set image.repository=your-registry.azurecr.io/healthcoreapi \
  --set image.tag=v1.0.0 \
  --set ingress.enabled=true \
  --set autoscaling.enabled=true \
  --set autoscaling.minReplicas=3 \
  --set autoscaling.maxReplicas=10
```

### **Environment Configuration Management**
Production deployments require proper environment configuration:

```
# Critical production environment variables
DJANGO_SETTINGS_MODULE=healthcoreapi.settings.production
DATABASE_URL=postgres://user:password@your-postgres.com:5432/healthcore
REDIS_URL=redis://your-redis.com:6379/0
CELERY_BROKER_URL=redis://your-redis.com:6379/0
SENTRY_DSN=https://your-sentry-dsn
SECRET_KEY=your-production-secret-key
ALLOWED_HOSTS=api.yourdomain.com,your-load-balancer.com
```

---

## 🔮 Strategic Roadmap & Vision

### **Current Status: Phase 10 Completed** ✅
- **Enterprise Backend**: Complete Django API with domain-driven design (12 bounded contexts)
- **Quality Assurance**: 92.23% test coverage with 191 comprehensive tests
- **DevOps Pipeline**: Hardened CI/CD with automated quality gates and security scanning
- **Cloud Infrastructure**: Production-ready Kubernetes deployment and Terraform automation
- **Observability**: Health monitoring, Prometheus metrics, correlation ID logging for distributed tracing
- **Security & Compliance**: RBAC implementation with HIPAA-aligned access controls
- **Clinical Ordering**: FHIR-aligned ServiceRequest implementation linking clinical workflows
- **Pharmacy & Equipment**: Complete medication inventory and equipment logistics management
- **Performance**: Query optimization with N+1 prevention and database performance tests

### **Upcoming Development Phases**
| Phase | Focus Area | Strategic Value |
|-------|------------|-----------------|
| **Phase 9** | **Advanced CI/CD & Compliance** | Security automation, compliance scanning, multi-environment deployment |
| **Phase 10** | **Microservices Extraction** | Strangler Fig pattern implementation beginning with Notifications service |
| **Phase 11** | **Advanced Observability** | Distributed tracing, APM integration, and advanced monitoring dashboards |
| **Phase 12** | **Multi-Cloud Strategy** | Cloud provider abstraction and disaster recovery automation |

**Detailed roadmap**: See [ROADMAP.md](ROADMAP.md) for complete feature development timeline.

---

## 📊 Quality & Performance Metrics

### **Code Quality Standards**
- **Test Coverage**: 92.23% with 191 comprehensive unit and integration tests
- **Code Analysis**: Zero critical security vulnerabilities (Bandit + Safety)
- **Type Safety**: Full MyPy static type checking compliance
- **Code Style**: Enforced formatting and linting standards with Ruff
- **Architecture**: Clean separation of concerns with domain-driven design

### **Performance & Reliability**
- **Response Times**: Sub-200ms API response times for standard operations
- **Error Handling**: Circuit breaker patterns for external service resilience
- **Caching Strategy**: Redis-based caching for frequently accessed data
- **Database Optimization**: Proper indexing and query optimization
- **Container Efficiency**: Multi-stage Docker builds with minimal attack surface

---

## 🛡️ Security & Compliance

### **Security Implementation**
- **Authentication**: JWT-based authentication with refresh token support
- **Authorization**: Role-based access control (RBAC) for API endpoints
- **Data Protection**: Encrypted sensitive data and secure configuration management
- **Vulnerability Scanning**: Automated security scanning in CI/CD pipeline
- **Container Security**: Non-root containers with minimal base images

### **Authorization (RBAC)**

HealthCoreAPI implements **Role-Based Access Control (RBAC)** with four healthcare roles:

| Role | Description | Permissions |
|------|-------------|-------------|
| **Admin** | System administrators | Full system access including user management |
| **Doctor** | Licensed physicians | View all patients, create appointments, diagnostics, prescriptions |
| **Nurse** | Nursing staff | View patients, update vitals, administer medications |
| **Patient** | Registered patients | View own records only (read-only) |

#### Permission Classes

All endpoints are protected with role-based permissions:

```
from src.apps.core.permissions import IsDoctor, IsMedicalStaff, IsPatientOwner

# Example: Doctors only
class DiagnosticReportViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsDoctor]

# Example: Medical staff (Doctors OR Nurses)
class PatientViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsMedicalStaff]

# Example: Patients can only access own records
class PatientPortalViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated, IsPatientOwner]

    def get_queryset(self):
        return Patient.objects.filter(user=self.request.user)
```

#### Loading Roles

Roles are defined in fixtures and loaded automatically during container startup:

```
# Roles are loaded automatically in entrypoint.sh
# Manual loading if needed:
python manage.py loaddata roles

# Assign role to user (in Django shell)
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group

User = get_user_model()
user = User.objects.get(username='johndoe')
doctor_group = Group.objects.get(name='Doctors')
user.groups.add(doctor_group)
```

#### Testing Permissions

```
# Run RBAC test suite
pytest src/apps/core/tests/test_rbac_permissions.py -v

# Test specific role
pytest src/apps/core/tests/test_rbac_permissions.py::TestIsDoctorPermission -v
```

#### HIPAA Compliance

This RBAC implementation supports HIPAA Security Rule requirements:
- **§ 164.308(a)(4)**: Role-based access control
- **§ 164.308(a)(3)**: Minimum necessary access
- **§ 164.312(a)(1)**: Access control technical safeguards

See [ADR-0008](docs/adr/0008-rbac-implementation.md) for architectural decisions and [docs/CRITICAL_CONTROL_POINTS.md](docs/CRITICAL_CONTROL_POINTS.md) for compliance details.

### **Healthcare Compliance Readiness**
- **Audit Trail**: Comprehensive logging for all data access and modifications
- **Data Integrity**: Database constraints and validation for medical data accuracy
- **Access Controls**: Fine-grained permissions for healthcare role requirements
- **Data Retention**: Configurable retention policies for compliance requirements

---

## 📚 Documentation & Developer Resources

### **Comprehensive Documentation Suite**
- **[ARCHITECTURE.md](ARCHITECTURE.md)**: System design principles and strategic architectural vision
- **[CONTRIBUTING.md](CONTRIBUTING.md)**: Contribution guidelines and development workflow
- **[SECURITY.md](SECURITY.md)**: Security policies and vulnerability reporting procedures
- **[docs/adr/](docs/adr/)**: Architecture Decision Records documenting technical choices
- **[docs/CRITICAL_CONTROL_POINTS.md](docs/CRITICAL_CONTROL_POINTS.md)**: HIPAA/healthcare compliance critical controls
- **[docs/CCP_IMPLEMENTATION_STATUS.md](docs/CCP_IMPLEMENTATION_STATUS.md)**: Implementation status of compliance controls
- **[docs/DOCKER.md](docs/DOCKER.md)**: Docker configuration best practices and troubleshooting
- **[docs/VSCODE_SETUP.md](docs/VSCODE_SETUP.md)**: Complete VS Code development environment guide
- **[docs/WSL2_OPTIMIZATION.md](docs/WSL2_OPTIMIZATION.md)**: Performance optimization for Windows development

### **API Documentation**
- **Interactive API Docs**: Swagger UI available at `/api/docs/`
- **OpenAPI Schema**: Machine-readable API specification at `/api/schema/`
- **Postman Collection**: Complete API collection for testing and integration

---

## 🚀 Microservices Integration

### Audit Log Microservice (Go + DynamoDB)

The HealthCoreAPI implements a **polyglot microservices architecture** with a dedicated Go service for high-performance audit logging, demonstrating event-driven architecture and inter-service communication.

#### Architecture Overview

```
Django (Python) ──[Kafka Event]──> Go Consumer ──[Write]──> DynamoDB
       │                                ▲                        │
       └──────────[gRPC Query]──────────┘                        │
                  (Port 50051) <───────────────────────────────┘
```

**Technology Stack:**
- **Language**: Go 1.24 (high concurrency, low memory footprint)
- **Database**: DynamoDB Local/AWS (infinite-scaling NoSQL)
- **Communication**: Kafka (async ingestion) + gRPC (sync queries)
- **Deployment**: Docker-ready for Azure Container Apps

#### Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **Go gRPC Server** | services/audit-service/internal/grpc/ | Exposes LogEvent and GetAuditLogs RPC methods |
| **Kafka Consumer** | services/audit-service/internal/kafka/ | Consumes healthcore.events topic |
| **DynamoDB Repository** | services/audit-service/internal/repository/ | Stores logs (PK: 	arget_id, SK: 	imestamp) |
| **Protobuf Contract** | services/audit-service/proto/audit.proto | gRPC service definition |
| **Python gRPC Client** | src/apps/core/services/grpc_client.py | Django integration for querying logs |
| **Kafka Producer** | src/apps/core/services/audit_logger.py | Publishes audit events from Django |
| **DTOs** | src/apps/core/services/dto.py | Type-safe event payloads |

#### Using the gRPC Client

```python
from src.apps.core.services.grpc_client import AuditGRPCClient

# Context manager usage (recommended)
with AuditGRPCClient(host='audit-service', port=50051) as client:
    # Log an event
    event_id = client.log_event(
        actor_id='DOC-456',
        action='PATIENT_VIEW',
        target_id='PAT-789',
        resource_type='PATIENT',
        ip_address='192.168.1.100',
        user_agent='Mozilla/5.0...',
        details={'reason': 'Treatment review'}
    )
    print(f"Event logged: {event_id}")

    # Query logs
    logs = client.get_audit_logs(target_id='PAT-789', limit=10)
    for log in logs:
        print(f"{log['timestamp']}: {log['action']} by {log['actorId']}")
```

#### Using the Kafka Audit Logger

```python
from src.apps.core.services.audit_logger import (
    log_audit_event,
    log_user_login,
    log_resource_access
)

# Generic audit event
log_audit_event(
    actor_id='USER-123',
    action='PATIENT_UPDATE',
    target_id='PAT-456',
    resource_type='PATIENT',
    ip_address=request.META.get('REMOTE_ADDR'),
    user_agent=request.META.get('HTTP_USER_AGENT'),
    details={'fields_changed': ['email', 'phone']}
)

# Helper for login events
log_user_login(
    user_id='USER-123',
    ip_address='192.168.1.1',
    user_agent='Mozilla/5.0...',
    success=True
)

# Helper for resource access
log_resource_access(
    actor_id='DOC-789',
    resource_type='PATIENT',
    resource_id='PAT-456',
    action='VIEW',
    ip_address='10.0.0.1',
    user_agent='...'
)
```

#### Testing Microservices

```bash
# E2E gRPC Test (Python → Go → DynamoDB)
docker-compose exec web python scripts/test_grpc.py

# E2E Kafka Test (Django → Kafka → Go → DynamoDB)
docker-compose exec web python scripts/test_kafka_integration.py

# Generate protobuf stubs
bash scripts/generate_proto.sh
```

#### Querying DynamoDB

```bash
# Scan all audit logs
docker-compose exec dynamodb-local aws dynamodb scan \\
  --table-name AuditLogs \\
  --endpoint-url http://localhost:8000 \\
  --region us-east-1

# Query specific target ID
docker-compose exec dynamodb-local aws dynamodb query \\
  --table-name AuditLogs \\
  --key-condition-expression \"target_id = :tid\" \\
  --expression-attribute-values '{\":tid\":{\"S\":\"PATIENT-123\"}}' \\
  --endpoint-url http://localhost:8000 \\
  --region us-east-1
```

#### Performance Characteristics

- **Cold Start**: ~100ms (Go service)
- **Event Ingestion**: <5ms (Kafka publish from Django)
- **DynamoDB Write**: ~10-20ms (local), <5ms (AWS production)
- **gRPC Query**: <100ms round-trip (local)

#### Implementation Reference

- **ADR**: [0016-audit-microservice-go.md](adr/0016-audit-microservice-go.md)
- **Go Source**: [services/audit-service/](../services/audit-service/)
- **Protobuf**: [proto/audit.proto](../services/audit-service/proto/audit.proto)

---


---

## ⚖️ License

Licensed under the **Apache-2.0 License** - see [LICENSE](LICENSE) file for complete terms and conditions.

---

## 🤝 Contributing

### **Development Workflow**
1. **Fork the repository** and create a feature branch
2. **Use DevContainer** for consistent development environment
3. **Follow quality standards** - all checks must pass (`make quality`)
4. **Maintain test coverage** - aim for 90%+ coverage on new code
5. **Update documentation** as needed for architectural changes
6. **Submit pull request** with comprehensive description

### **Code Quality Requirements**
- All code must pass `ruff` linting and formatting
- MyPy type checking must pass without errors
- Maintain or improve overall test coverage
- Follow existing architectural patterns and conventions
- Update ADRs for significant architectural decisions

For detailed contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).

---

**🏥 Built with Enterprise Architecture Principles for Healthcare Technology Excellence**

---

**Author**: Daniel de Queiroz Reis
**Email**: [danielqreis@gmail.com](mailto:danielqreis@gmail.com)
**LinkedIn**: [Daniel Q. Reis](https://www.linkedin.com/in/danielqreis)
**Portfolio**: Professional Healthcare Software Development & Cloud Architecture
