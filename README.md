# HealthCoreAPI

[![CI](https://github.com/Daniel-Q-Reis/HealthCoreAPI.git/actions/workflows/ci.yml/badge.svg)](https://github.com/Daniel-Q-Reis/HealthCoreAPI.git/actions/workflows/ci.yml)
[![Python 3.12](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/downloads/)
[![Django 5.2](https://img.shields.io/badge/django-5.2-green.svg)](https://docs.djangoproject.com/)
[![Code style: ruff](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/astral-sh/ruff/main/assets/badge/v2.json)](https://github.com/astral-sh/ruff)
[![Coverage](https://img.shields.io/badge/coverage-90%25-brightgreen.svg)]()

**HealthCore API** is a secure, scalable, and high-performance backend system for complete hospital operations management. This project serves as the technological backbone for managing patients, appointments, electronic health records, and administrative processes, built upon an enterprise-grade foundation.

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

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose

### Get Started in 2 Steps

1.  **Start the development environment:**
    The `setup` command builds the containers, runs database migrations, and prepares the `.env` file.
    ```bash
    make setup
    ```

2.  **Access your application:**
    The initial setup automatically creates a superuser for you:
    - **Username:** `admin`
    - **Password:** `admin123`

    You can now access the main endpoints:
    - **API Docs:** [http://127.0.0.1:8000/api/docs/](http://127.0.0.1:8000/api/docs/)
    - **Admin:** [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)
    - **Health:** [http://127.0.0.1:8000/health/](http://127.0.0.1:8000/health/)

---

## ⚙️ Development Commands

All commands are executed via `make`.

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

## 🏗️ Architecture Overview

This project follows **Clean Architecture** principles to ensure separation of concerns and maintainability.

- **`src/apps/`**: Contains the different business domains of the application. Each app is a self-contained module.
- **`src/healthcoreapi/`**: Holds the project-level configuration, including settings, URL routing, and ASGI/WSGI entrypoints.
- **Service Layer**: Business logic is encapsulated in services, decoupled from Django's views.
- **Repository Pattern**: Data access is abstracted through repositories, making it easy to switch data sources and mock for tests.

---

## 🧪 Testing & Quality

This template is configured with a comprehensive quality suite.

Run all checks with a single command:
```bash
make quality
```

This command executes:
- **`pytest`**: For unit and integration tests.
- **`ruff`**: For code formatting and linting.
- **`mypy`**: For static type checking.
- **`bandit` & `safety`**: For security vulnerability scanning.

---

## 🚀 Production & Deployment

This project is configured for production deployment using Docker.

The `docker-compose.prod.yml` file orchestrates the `nginx` and `django` services for a production environment.

**To deploy to production:**

1.  Ensure your production `.env` file is configured with your domain, secrets, and `DJANGO_SETTINGS_MODULE=healthcoreapi.settings.production`.
2.  Build and run the production containers:
    ```bash
    docker-compose -f docker-compose.prod.yml up -d --build
    ```

This will start the application served by Nginx, ready to handle production traffic.

---

## ⚖️ License

Licensed under the **Apache-2.0 License**.

---

**Generated with [Django Enterprise Cookiecutter Template](https://github.com/CFBruna/cookiecutter-django-enterprise)** ⚡
