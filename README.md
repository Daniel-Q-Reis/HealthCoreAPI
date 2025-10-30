# HealthCoreAPI

[![CI](https://github.com/Daniel-Q-Reis/HealthCoreAPI.git/actions/workflows/ci.yml/badge.svg)](https://github.com/Daniel-Q-Reis/HealthCoreAPI.git/actions/workflows/ci.yml)
[![Python 3.12](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/downloads/)
[![Django 5.2](https://img.shields.io/badge/django-5.2-green.svg)](https://docs.djangoproject.com/)
[![Code style: ruff](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/astral-sh/ruff/main/assets/badge/v2.json)](https://github.com/astral-sh/ruff)
[![Coverage: 93.46%](https://img.shields.io/badge/coverage-93.46%25-brightgreen.svg)]()
[![Kubernetes Ready](https://img.shields.io/badge/kubernetes-ready-blue.svg)](https://kubernetes.io/)
[![Helm Chart](https://img.shields.io/badge/helm-chart-0f1689.svg)](https://helm.sh/)

**HealthCore API** is a secure, scalable, and high-performance backend system for complete hospital operations management. This project serves as the technological backbone for managing patients, appointments, electronic health records, and administrative processes, built upon an enterprise-grade foundation with cloud-native deployment capabilities.

---

## 📁 Project Structure

```
HealthCoreAPI/
├── .devcontainer/                 # Development container configuration
│   ├── devcontainer.json         # VS Code devcontainer settings
│   └── setup.sh                  # Automated development environment setup
├── .github/                      # GitHub workflows and templates
│   └── workflows/                # CI/CD pipelines
├── charts/                       # Kubernetes Helm Charts
│   └── healthcoreapi/            # Main application Helm chart
│       ├── Chart.yaml            # Chart metadata
│       ├── values.yaml           # Configuration values
│       └── templates/            # Kubernetes resource templates
│           ├── deployment.yaml   # Application deployment
│           ├── service.yaml      # Service definition
│           └── ingress.yaml      # Ingress configuration
├── docs/                         # Project documentation
│   ├── adr/                      # Architecture Decision Records
│   ├── DOCKER.md                 # Docker usage guide
│   ├── VSCODE_SETUP.md           # VS Code setup instructions
│   └── WSL2_OPTIMIZATION.md      # WSL2 optimization guide
├── logs/                         # Application log files
├── scripts/                      # Utility scripts
├── src/                          # Source code
│   ├── apps/                     # Django applications (Bounded Contexts)
│   │   ├── admissions/           # Hospital admissions management
│   │   ├── core/                 # Core shared functionality
│   │   ├── departments/          # Department and specialty management
│   │   ├── experience/           # Patient experience and feedback
│   │   ├── patients/             # Patient data management
│   │   ├── practitioners/        # Medical staff management
│   │   ├── results/              # Diagnostic results and imaging
│   │   ├── scheduling/           # Appointment scheduling
│   │   └── shifts/               # Staff shift management
│   ├── healthcoreapi/            # Django project configuration
│   │   ├── settings/             # Environment-specific settings
│   │   ├── asgi.py               # ASGI configuration
│   │   ├── celery.py             # Celery configuration
│   │   ├── urls.py               # URL routing
│   │   └── wsgi.py               # WSGI configuration
│   ├── static/                   # Static files
│   ├── templates/                # HTML templates
│   └── conftest.py               # Pytest configuration
├── .dockerignore                 # Docker ignore patterns
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore patterns
├── .pre-commit-config.yaml       # Pre-commit hooks configuration
├── ARCHITECTURE.md               # Architectural documentation
├── Dockerfile                    # Multi-stage Docker image configuration
├── LICENSE                       # Apache-2.0 License
├── Makefile                      # Development commands
├── README.md                     # This file
├── ROADMAP.md                    # Project roadmap
├── STATUS.md                     # Project status
├── deploy.sh                     # Deployment script
├── docker-compose.yml            # Development environment
├── docker-compose.prod.yml       # Production environment
├── docker-compose.override.yml   # Local overrides
├── manage.py                     # Django management script
├── mypy.ini                      # MyPy type checking configuration
├── nginx.conf                    # Nginx configuration for production
├── pyproject.toml                # Python project configuration
├── pytest.ini                   # Pytest configuration
├── requirements.in               # Production dependencies
├── requirements.txt              # Pinned production dependencies
├── requirements-dev.in           # Development dependencies
└── requirements-dev.txt          # Pinned development dependencies
```

---

## 🏗️ Architecture & Design

This project was intentionally designed as a **Modular Monolith**, architected with Clean Architecture principles to be inherently ready for future evolution. While it currently operates as a single deployable unit, its internal structure is prepared for a seamless transition to a microservices ecosystem as scalability demands grow.

### Architecture Principles

- **`src/apps/`**: Contains the different business domains of the application. Each app is a self-contained module.
- **`src/healthcoreapi/`**: Holds the project-level configuration, including settings, URL routing, and ASGI/WSGI entrypoints.
- **Service Layer**: Business logic is encapsulated in services, decoupled from Django's views.
- **Repository Pattern**: Data access is abstracted through repositories, making it easy to switch data sources and mock for tests.
- **Cloud-Native Design**: Built with containerization and Kubernetes deployment in mind.

### Documentation

- **Strategic Vision:** The overall architectural strategy, guiding principles, and long-term vision are documented in **[ARCHITECTURE.md](ARCHITECTURE.md)**.
- **Tactical Decisions:** Significant architectural decisions are recorded as **Architecture Decision Records (ADRs)**, available in the **[docs/adr/](docs/adr/)** directory.

---

## ✨ Core Features & Bounded Contexts

The system is organized into clear Bounded Contexts, each representing a distinct business capability:

- **Patients & Practitioners:** Core data management for patients and medical staff.
- **Scheduling & Admissions:** APIs for managing appointments, hospital admissions, and bed allocation.
- **Results & Imaging:** Creating and retrieving diagnostic reports and observations.
- **Staffing & Operations:** Management of shifts, departments, and specialties.
- **Patient Experience:** Endpoints for capturing patient feedback and complaints.
- **Observability:** Foundational monitoring with health checks and Prometheus metrics.
- **Resilience:** Circuit breaker patterns for fault tolerance and system stability.

---

## 🛠️ Tech Stack

| Component | Technology | Purpose |
|-----------|------------|----------|
| **Framework** | Django 5.2 | Web Framework |
| **API** | Django REST Framework | API Development & OpenAPI Docs |
| **Database** | PostgreSQL 15+ | Primary Database |
| **Cache & Message Broker** | Redis 7+ | Caching & Background Task Queues |
| **Async Tasks** | Celery 5.5 | Background Task Processing |
| **Testing** | Pytest | Test Framework |
| **Code Quality** | Ruff + MyPy | Linting, Formatting & Type Checking |
| **Security** | Bandit + Safety | Vulnerability Scanning |
| **Error Tracking** | Sentry | Real-time Error Monitoring |
| **Monitoring** | Prometheus | Application Metrics Export |
| **Resilience** | PyBreaker | Circuit Breaker Pattern |
| **Containerization** | Docker | Application Packaging |
| **Orchestration** | Kubernetes + Helm | Container Orchestration |
| **Development** | VS Code + DevContainers | Consistent Development Environment |

---

## 🚀 Quick Start

### Prerequisites
- **For Local Development:** Docker & Docker Compose
- **For DevContainer Development:** VS Code with Dev Containers extension
- **For Production:** Kubernetes cluster with Helm 3+

### Development Setup

#### Option 1: Standard Docker Development

1.  **Start the development environment:**
    ```
    make setup
    ```

2.  **Access your application:**
    - **API Docs:** [http://127.0.0.1:8000/api/docs/](http://127.0.0.1:8000/api/docs/)
    - **Admin:** [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/) (admin/admin123)
    - **Health Checks:** [http://127.0.0.1:8000/health/](http://127.0.0.1:8000/health/)
    - **Prometheus Metrics:** [http://127.0.0.1:8000/metrics](http://127.0.0.1:8000/metrics)

#### Option 2: DevContainer Development (Recommended)

1.  **Configure environment:**
    ```
    cp .env.example .env
    ```

2.  **Update your `.env` file with your information:**
    ```
    # Personal configuration (required)
    GIT_AUTHOR_NAME="Your Full Name"
    GIT_AUTHOR_EMAIL="your.email@example.com"

    # Other settings remain as defaults for development
    ```

3.  **Open in VS Code:**
    - Install the "Dev Containers" extension
    - Open the project folder in VS Code
    - When prompted, click "Reopen in Container"
    - Or use Command Palette: `Dev Containers: Reopen in Container`

4.  **Automated setup includes:**
    - ✅ Python 3.12 environment
    - ✅ All dependencies installed
    - ✅ Git configuration
    - ✅ kubectl + Helm tools for Kubernetes development
    - ✅ Enhanced bash with git branch display
    - ✅ Pre-commit hooks configured
    - ✅ Database ready with migrations applied

---

## ⚙️ Development Commands

All commands are executed via `make`. Run `make help` to see all available options.

| Command | Description |
|---|---|
| `make setup` | 🚀 **Initial setup:** builds containers, runs migrations, and creates a default superuser. |
| `make up` | ⬆️ Starts all services in the background. |
| `make down` | ⬇️ Stops all services. |
| `make test` | 🧪 Runs the full test suite with coverage report. |
| `make quality` | ✅ Runs all code quality checks (lint, format, types, tests). |
| `make shell` | 🐚 Opens a Django shell inside the running container. |
| `make superuser` | 👤 Creates a new, interactive superuser. |
| `make logs` | 📋 Tails the logs for all running services. |
| `make help` | ❓ Shows all available commands. |

### Kubernetes Development Commands (in DevContainer)

| Command | Description |
|---|---|
| `k get nodes` | 🔍 Check Kubernetes cluster status |
| `helm template charts/healthcoreapi/` | 📋 Render Helm templates |
| `helm lint charts/healthcoreapi/` | ✅ Validate Helm chart |
| `helm install healthcore charts/healthcoreapi/` | 🚀 Deploy to Kubernetes |

---

## 🧪 Testing & Quality

This template is configured with a comprehensive quality suite.

Run all checks with a single command:
```
make quality
```

This command executes:
- **`pytest`**: For unit and integration tests with 95%+ coverage.
- **`ruff`**: For code formatting and linting.
- **`mypy`**: For static type checking.
- **`bandit` & `safety`**: For security vulnerability scanning.

---

## ☸️ Kubernetes Deployment

This project includes production-ready Helm charts for Kubernetes deployment.

### Helm Chart Features

- **Production-ready**: Health checks, resource limits, and security contexts
- **Configurable**: Customizable through `values.yaml`
- **Scalable**: Support for horizontal pod autoscaling
- **Secure**: Non-root containers and security best practices
- **Observable**: Integrated health checks and metrics endpoints

### Local Kubernetes Testing

```
# Validate chart
helm lint charts/healthcoreapi/

# Test template rendering
helm template healthcore charts/healthcoreapi/

# Deploy to local cluster
helm install healthcore charts/healthcoreapi/ \
  --set image.repository=your-registry/healthcoreapi \
  --set image.tag=latest
```

### Production Deployment

```
# Deploy to production cluster
helm install healthcore charts/healthcoreapi/ \
  --values charts/healthcoreapi/values.prod.yaml \
  --set image.repository=your-registry/healthcoreapi \
  --set image.tag=v1.0.0
```

---

## 🔮 Future Roadmap

This project is actively developed with a clear vision for future enhancements:

### **Current Phase: Cloud-Native Deployment**
- **✅ Phase 6: Resilience & Caching** - Circuit breakers and caching strategies implemented
- **✅ Phase 7: Kubernetes/Helm Charts** - Production-ready Helm charts and DevContainer integration
- **🔄 Phase 7: Terraform + AKS** - Infrastructure as Code for Azure Kubernetes Service *(In Progress)*

### **Upcoming Phases:**
- **Phase 8: CI/CD and Compliance** - Advanced security scanning, image signing, and compliance checks
- **Phase 9: Extraction to Microservices** - Strangler Fig Pattern for service extraction
- **Phase 10: Advanced Observability** - Distributed tracing and advanced monitoring

For a detailed breakdown, please see the **[ROADMAP.md](ROADMAP.md)** file.

---

## 🚀 Production & Deployment

### Docker Production Deployment

```
# Build and deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d --build
```

### Kubernetes Production Deployment

```
# Deploy using Helm
helm install healthcore charts/healthcoreapi/ \
  --set image.repository=your-registry/healthcoreapi \
  --set image.tag=v1.0.0 \
  --set ingress.enabled=true \
  --set ingress.hosts.host=your-domain.com
```

### Environment Configuration

Ensure your production `.env` file includes:
- `DJANGO_SETTINGS_MODULE=healthcoreapi.settings.production`
- Proper database credentials
- Redis configuration
- Security keys and certificates

---

## 🔧 Development Environment

### DevContainer Features

The development environment includes:

- **🐍 Python 3.12** with all dependencies
- **🐳 Docker-in-Docker** support
- **☸️ Kubernetes tools** (kubectl, helm)
- **🔧 Development tools** (git, pre-commit, quality tools)
- **🎨 Enhanced terminal** with git branch and Kubernetes context display
- **⚡ Auto-completion** for kubectl and helm commands
- **🔒 Security tools** pre-configured

### VS Code Extensions

Recommended extensions are automatically installed:
- Python development tools
- Docker and Kubernetes support
- Code quality and formatting tools
- Git integration enhancements

---

## ⚖️ License

Licensed under the **Apache-2.0 License**. See the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Use the DevContainer for consistent development
4. Ensure all tests pass with `make quality`
5. Submit a pull request

---

**Built with Enterprise Architecture Principles & Cloud-Native Best Practices** ⚡
```

Author: Daniel de Queiroz Reis

Email: danielqreis@gmail.com

WhatsApp: +55 35 99190-2471
