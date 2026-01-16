# HealthCoreAPI

[![CI](https://github.com/Daniel-Q-Reis/HealthCoreAPI/actions/workflows/ci.yml/badge.svg)](https://github.com/Daniel-Q-Reis/HealthCoreAPI/actions/workflows/ci.yml)
[![Python 3.12](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/downloads/)
[![Django 5.2](https://img.shields.io/badge/django-5.2-green.svg)](https://docs.djangoproject.com/)
[![React 18](https://img.shields.io/badge/react-18-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/typescript-5-3178c6.svg)](https://www.typescriptlang.org/)
[![Code style: ruff](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/astral-sh/ruff/main/assets/badge/v2.json)](https://github.com/astral-sh/ruff)
[![Coverage: 90%](https://img.shields.io/badge/coverage-90%25-brightgreen.svg)]()
[![Kubernetes Ready](https://img.shields.io/badge/kubernetes-ready-blue.svg)](https://kubernetes.io/)
[![Helm Chart](https://img.shields.io/badge/helm-chart-0f1689.svg)](https://helm.sh/)
[![Terraform](https://img.shields.io/badge/terraform-ready-7b42bc.svg)](https://www.terraform.io/)
[![Azure AKS](https://img.shields.io/badge/azure-aks-0078d4.svg)](https://azure.microsoft.com/en-us/services/kubernetes-service/)

**HealthCoreAPI** is an enterprise-grade, full-stack healthcare management platform demonstrating modern cloud-native architecture patterns, Domain-Driven Design, and production-ready deployment capabilities. Built with HIPAA-aligned security controls and comprehensive RBAC authorization.

---

## 🛠️ Technology Stack

### **Backend**
| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.12 | Programming Language |
| **Django** | 5.2 | Web Framework & ORM |
| **Django REST Framework** | 3.16+ | RESTful API & OpenAPI |
| **PostgreSQL** | 15+ | Primary Database (ACID) |
| **Redis** | 7+ | Cache & Message Broker |
| **Celery** | 5.5+ | Async Task Processing |
| **Apache Kafka** | Latest (KRaft) | Event Streaming |
| **Prometheus** | Latest | Metrics Collection |
| **PyBreaker** | 1.2+ | Circuit Breaker Pattern |
| **Google Gemini** | 2.5 Flash | AI Integration |
| **Go** | 1.24 | Audit Microservice |
| **gRPC** | 1.60+ | Inter-service Communication |
| **DynamoDB** | Local/AWS | Audit Log Storage (NoSQL) |

### **Frontend**
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18 | UI Framework |
| **TypeScript** | 5+ | Type-Safe JavaScript |
| **Vite** | 5+ | Build Tool & Dev Server |
| **Tailwind CSS** | 3+ | Utility-First Styling |
| **i18next** | Latest | Internationalization (PT/EN) |
| **React Router** | 6+ | Client-Side Routing |

### **DevOps & Infrastructure**
| Technology | Version | Purpose |
|------------|---------|---------|
| **Docker** | 24+ | Containerization |
| **Kubernetes** | 1.29+ | Container Orchestration |
| **Helm** | 3+ | Kubernetes Package Manager |
| **Terraform** | 1.5+ | Infrastructure as Code (Azure AKS) |
| **GitHub Actions** | Latest | CI/CD Pipeline |
| **Grafana** | Latest | Observability Dashboards |

### **Quality & Testing**
| Technology | Purpose |
|------------|---------|
| **Pytest** | Test Framework (250 tests, 90% coverage) |
| **MyPy** | Static Type Checking (strict mode, 0 errors) |
| **Ruff** | Linting & Formatting |
| **Bandit + Safety** | Security Vulnerability Scanning |
| **Pre-commit** | Automated Quality Gates |

---

## 📸 Project Gallery

| Landing Page | Scheduling | Pharmacy Management |
|:---:|:---:|:---:|
| ![Landing Page](frontend/public/images/project/landingpage5173.png) | ![Scheduling](frontend/public/images/project/schedule.png) | ![Pharmacy](frontend/public/images/project/pharmacy_management.png) |

| API Documentation | Observability | Google OAuth |
|:---:|:---:|:---:|
| ![Swagger](frontend/public/images/project/swagger.png) | ![Grafana](frontend/public/images/project/grafana3000.png) | ![Google Login](frontend/public/images/project/google_login.png) |

> 📷 **[View Full Screenshot Gallery with Descriptions →](SHOWCASE.md)**

---

## 🏆 Project Highlights

### **Enterprise Architecture & Quality**
- **90%+ Test Coverage** with 250+ comprehensive tests
- **100% Type Safety** with MyPy strict mode (zero type errors)
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

### **Full-Stack Capabilities**
- **Backend**: Django 5.2 + DRF with 12 Domain-Driven Design bounded contexts
- **Frontend**: React 18 + TypeScript with Feature-Sliced Design (FSD) architecture
- **Infrastructure**: Docker, Kubernetes (Helm), Terraform (Azure AKS)
- **Observability**: Prometheus, Grafana, Kafka event streaming
- **AI Integration**: Google Gemini 2.5 Flash for clinical decision support

### **Modern Development Practices**
- **DevContainer** environment for consistent development experience
- **Pre-commit hooks** ensuring code quality standards (Ruff, MyPy, Pytest)
- **Architecture Decision Records** (18+ ADRs) documenting technical decisions
- **Comprehensive documentation** for setup, deployment, and operations
- **Bilingual Support** (PT/EN) in frontend with i18next

---

## 🏗️ Architecture Overview

This project demonstrates **Enterprise-Grade Software Architecture** designed as a **Modular Monolith** with microservices-ready internal structure.

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React/TS)                     │
│  Landing Page • Dashboard • Scheduling • Pharmacy • Auth    │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST + JWT
┌──────────────────────────┴──────────────────────────────────┐
│                     Backend (Django/DRF)                     │
│  12 Bounded Contexts • RBAC (6 Roles) • AI Services         │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                      Infrastructure                          │
│  PostgreSQL • Redis • Kafka • Prometheus • Grafana          │
└─────────────────────────────────────────────────────────────┘
```

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

- **Strategic Vision**: Overall architectural strategy in [ARCHITECTURE.md](ARCHITECTURE.md)
- **Technical Decisions**: Architecture Decision Records in [docs/adr/](docs/adr/)
- **Operational Guides**: Setup and optimization in [docs/](docs/)
- **API Documentation**: Auto-generated OpenAPI specs with DRF Spectacular
- **Backend Details**: Comprehensive guide in [docs/README_BACKEND.md](docs/README_BACKEND.md)
- **Frontend Details**: FSD architecture guide in [docs/README_FRONTEND.md](docs/README_FRONTEND.md)

---

## 🔐 RBAC & HIPAA Compliance

**HealthCoreAPI implements production-grade Role-Based Access Control (RBAC)** with 6 healthcare roles, designed to meet HIPAA Security Rule requirements.

### **Healthcare Roles**

| Role | Description | Permissions |
|------|-------------|-------------|
| **Admin** | System administrators | Full system access, user management, audit logs |
| **Doctor** | Licensed physicians | Patient records, diagnostics, prescriptions, appointments |
| **Nurse** | Nursing staff | Patient care, vitals, medication administration |
| **Pharmacist** | Pharmacy staff | Medication inventory, dispensation, drug info (AI) |
| **Receptionist** | Front desk staff | Appointments, check-in, patient registration |
| **Patient** | Registered patients | Own records only (read-only access) |

### **Permission Classes**

All endpoints are protected with role-based permissions:

```python
from src.apps.core.permissions import IsDoctor, IsMedicalStaff, IsPatientOwner

# Doctors only - full medical authority
class DiagnosticReportViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsDoctor]

# Medical staff (Doctors OR Nurses OR Pharmacists)
class PatientViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsMedicalStaff]

# Patients can only access own records (object-level)
class PatientPortalViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated, IsPatientOwner]
```

### **HIPAA Security Rule Compliance**

| HIPAA Requirement | Implementation |
|-------------------|----------------|
| **§ 164.308(a)(4)** - Access Control | Role-based permissions with 6 healthcare roles |
| **§ 164.308(a)(3)** - Minimum Necessary | Object-level permissions (IsPatientOwner) |
| **§ 164.312(a)(1)** - Access Control Safeguards | Permission classes on all endpoints |
| **§ 164.312(b)** - Audit Controls | Comprehensive logging with correlation IDs |
| **§ 164.312(d)** - Authentication | JWT tokens with secure storage |

> 📚 See [ADR-0008](docs/adr/0008-rbac-implementation.md) and [CRITICAL_CONTROL_POINTS.md](docs/CRITICAL_CONTROL_POINTS.md)

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
│   ├── adr/                      # Architecture Decision Records (15+ backend)
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
├── frontend/                     # React + TypeScript Frontend (FSD Architecture)
│   ├── public/
│   │   └── images/project/       # Project screenshots (19 images)
│   ├── src/
│   │   ├── app/                  # App initialization, providers
│   │   ├── pages/                # Route components
│   │   │   ├── landing/          # Landing page module
│   │   │   └── dqr-health/       # Main application
│   │   │       ├── dashboard/    # Dashboard page
│   │   │       ├── appointments/ # Appointments management
│   │   │       ├── pharmacy/     # Pharmacy module
│   │   │       └── admin/        # Admin area (RBAC approval)
│   │   ├── widgets/              # Composite UI blocks
│   │   │   ├── landing/          # Navbar, Hero, TechStack, Footer
│   │   │   └── dqr-health/       # Sidebar, Dashboard widgets
│   │   ├── features/             # Business logic features
│   │   │   ├── auth/             # Authentication (JWT, OAuth, RBAC)
│   │   │   │   ├── context/      # AuthProvider, AuthContext
│   │   │   │   ├── components/   # ProtectedRoute, LoginForm
│   │   │   │   └── pages/        # LoginPage, OAuthCallback
│   │   │   ├── pharmacy/         # Pharmacy module
│   │   │   │   ├── components/   # InventoryTable, DispenseForm
│   │   │   │   └── pages/        # InventoryPage, DispensePage
│   │   │   ├── scheduling/       # Appointment scheduling
│   │   │   └── patients/         # Patient management
│   │   ├── modules/              # Legacy feature modules
│   │   │   └── dqr-health/
│   │   │       └── services/     # API services, auth service
│   │   ├── shared/               # Shared utilities
│   │   │   ├── ui/               # UI components (Button, Card, Modal)
│   │   │   ├── api/              # API client, security (token storage)
│   │   │   └── layout/           # Layout components
│   │   ├── main.tsx              # Application entry point
│   │   └── App.tsx               # Root component
│   ├── Dockerfile                # Frontend container
│   ├── package.json              # Node.js dependencies
│   ├── tsconfig.json             # TypeScript configuration
│   ├── vite.config.ts            # Vite build configuration
│   ├── tailwind.config.js        # Tailwind CSS configuration
│   └── ROADMAP.md                # Frontend implementation roadmap
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
│   ├── kafka_consumer.py         # Kafka event consumer example
│   └── seed_admin_test.py        # Test data seeding
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

## 🚀 Quick Start

### Prerequisites
- Docker Desktop & Docker Compose
- (Optional) VS Code with Dev Containers extension

### Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/Daniel-Q-Reis/HealthCoreAPI.git
cd HealthCoreAPI

# 2. Configure environment
cp .env.example .env

# 3. Start all services (backend + frontend + infrastructure)
docker-compose up -d

# 4. Wait for services to initialize (~30 seconds)
```

### Access Services

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | - |
| **API Docs (Swagger)** | http://localhost:5173/api/docs/ | - |
| **Django API** | http://localhost:8000 | `user@user.com` / `user1234` |
| **Django Admin** | http://localhost:8000/admin | `user@user.com` / `user1234` |
| **Grafana** | http://localhost:3000 | `admin` / `admin` |
| **Prometheus** | http://localhost:9090 | - |
| **Kafka** | localhost:9092 | - |

### Development Commands

```bash
make setup      # Complete initial setup (build, migrate, seed)
make up         # Start all services
make down       # Stop all services
make test       # Run test suite (250 tests)
make quality    # Full quality check (lint, type check, tests)
make logs       # View service logs
make shell      # Django interactive shell
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[Backend Documentation](docs/README_BACKEND.md)** | Detailed backend architecture, API, deployment |
| **[Frontend Documentation](docs/README_FRONTEND.md)** | FSD architecture, components, authentication |
| **[Architecture Decisions](docs/adr/)** | 18+ ADRs documenting technical choices |
| **[Technical Showcase](SHOWCASE.md)** | Full project showcase with screenshots |
| **[RBAC Implementation](docs/adr/0008-rbac-implementation.md)** | Role-based access control details |
| **[HIPAA Controls](docs/CRITICAL_CONTROL_POINTS.md)** | Healthcare compliance documentation |
| **[Kafka Guide](docs/KAFKA.md)** | Event streaming patterns (400+ lines) |
| **[Project Roadmap](ROADMAP.md)** | Feature development timeline |
| **[Project Status](STATUS.md)** | Current implementation status |

---

## 📊 Quality Metrics

| Metric | Value |
|--------|-------|
| **Test Coverage** | 90% (250 tests) |
| **Type Safety** | 100% (MyPy strict, 0 errors) |
| **Code Quality** | 0 Ruff violations |
| **Security** | 0 critical vulnerabilities |
| **ADRs** | 18 architecture decisions |
| **Bounded Contexts** | 12 domains |
| **API Endpoints** | 50+ RESTful endpoints |
| **RBAC Roles** | 6 healthcare roles |
| **Kafka Events** | 6 event types |
| **Grafana Dashboards** | 5 monitoring dashboards |

---

## ⚖️ License

Licensed under the **Apache-2.0 License** - see [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development workflow and guidelines.

---

**🏥 Built with Enterprise Architecture Principles for Healthcare Technology Excellence**

---

**Author**: Daniel de Queiroz Reis
📧 [danielqreis@gmail.com](mailto:danielqreis@gmail.com) | 💼 [LinkedIn](https://www.linkedin.com/in/danielqreis) | 🐙 [GitHub](https://github.com/Daniel-Q-Reis)
