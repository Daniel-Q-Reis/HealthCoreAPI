# HealthCoreAPI

[![CI](https://github.com/Daniel-Q-Reis/HealthCoreAPI.git/actions/workflows/ci.yml/badge.svg)](https://github.com/Daniel-Q-Reis/HealthCoreAPI.git/actions/workflows/ci.yml)
[![Python 3.12](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/downloads/)
[![Django 5.2](https://img.shields.io/badge/django-5.2-green.svg)](https://docs.djangoproject.com/)
[![Code style: ruff](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/astral-sh/ruff/main/assets/badge/v2.json)](https://github.com/astral-sh/ruff)
[![Coverage: 95.26%](https://img.shields.io/badge/coverage-95.26%25-brightgreen.svg)]()

**HealthCore API** is a secure, scalable, and high-performance backend system for complete hospital operations management. This project serves as the technological backbone for managing patients, appointments, electronic health records, and administrative processes, built upon an enterprise-grade foundation.

---

## 📁 Project Structure

```
HealthCoreAPI/
├── .devcontainer/                 # Development container configuration
├── .github/                      # GitHub workflows and templates
│   └── workflows/                # CI/CD pipelines
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
├── Dockerfile                    # Docker image configuration
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

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose

### Get Started in 2 Steps

1.  **Start the development environment:**
    The `setup` command builds the containers, runs database migrations, and prepares the `.env` file.
    ```
    make setup
    ```

2.  **Access your application:**
    The initial setup automatically creates a superuser for you:
    - **Username:** `admin`
    - **Password:** `admin123`

    You can now access the main endpoints:
    - **API Docs:** [http://127.0.0.1:8000/api/docs/](http://127.0.0.1:8000/api/docs/)
    - **Admin:** [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)
    - **Health Checks:** [http://127.0.0.1:8000/health/](http://127.0.0.1:8000/health/)
    - **Prometheus Metrics:** [http://127.0.0.1:8000/metrics](http://127.0.0.1:8000/metrics)

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

---

## 🧪 Testing & Quality

This template is configured with a comprehensive quality suite.

Run all checks with a single command:
```
make quality
```

This command executes:
- **`pytest`**: For unit and integration tests.
- **`ruff`**: For code formatting and linting.
- **`mypy`**: For static type checking.
- **`bandit` & `safety`**: For security vulnerability scanning.

---

## 🔮 Future Roadmap

This project is actively developed with a clear vision for future enhancements. Key items on the roadmap include:

- **Phase 6: Resilience & Caching:** Implementing advanced resilience patterns like Circuit Breakers and refining caching strategies.
- **Phase 7: Kubernetes/AKS Delivery:** Building Helm charts and defining deployment patterns for Kubernetes environments.
- **Phase 8: CI/CD and Compliance:** Hardening the CI/CD pipeline with advanced security scanning (image signing, SBOM) and compliance checks.
- **Phase 9: Extraction to Microservices:** Executing the Strangler Fig Pattern to extract the first service (e.g., Notifications) from the monolith.

For a detailed breakdown, please see the **[ROADMAP.md](ROADMAP.md)** file.

---

## 🚀 Production & Deployment

This project is configured for production deployment using Docker.

The `docker-compose.prod.yml` file orchestrates the `nginx` and `django` services for a production environment.

**To deploy to production:**

1.  Ensure your production `.env` file is configured with your domain, secrets, and `DJANGO_SETTINGS_MODULE=healthcoreapi.settings.production`.
2.  Build and run the production containers:
    ```
    docker-compose -f docker-compose.prod.yml up -d --build
    ```

This will start the application served by Nginx, ready to handle production traffic.

---

## ⚖️ License

Licensed under the **Apache-2.0 License**. See the [LICENSE](LICENSE) file for details.

---

**Generated with [Django Enterprise Cookiecutter Template]** ⚡
```
