# Contributing to HealthCoreAPI

First off, thank you for considering contributing to HealthCoreAPI! This healthcare management platform is designed with enterprise-grade architecture and patient safety in mind, and your contributions help make it better.

---

## 🎯 Project Vision

HealthCoreAPI is an **enterprise-grade healthcare management system** built with:
- **Domain-Driven Design** for clear business context separation
- **Production-ready practices** including comprehensive testing and monitoring
- **Healthcare compliance awareness** with HIPAA-ready architecture patterns
- **Cloud-native deployment** capabilities with Kubernetes and Terraform

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Architecture Decision Records](#architecture-decision-records)
- [Community](#community)

---

## 📜 Code of Conduct

### Our Standards

- **Be respectful**: Treat everyone with respect and kindness
- **Be collaborative**: Work together toward common goals
- **Be professional**: Maintain professional conduct in all interactions
- **Be patient**: Healthcare systems are complex - ask questions and help others learn

### Healthcare Context

This project deals with **patient healthcare data** (even if simulated). Please:
- Take security and privacy concerns seriously
- Follow HIPAA-awareness guidelines in code and discussions
- Report security vulnerabilities responsibly (see [SECURITY.md](SECURITY.md))

---

## 🚀 Getting Started

### Prerequisites

- **Docker Desktop** or **Docker Engine + Docker Compose**
- **VS Code** (recommended) with Dev Containers extension
- **Git** for version control
- **Python 3.12** knowledge (for local development)

### Initial Setup

#### Option 1: DevContainer (Recommended)

```
# 1. Clone the repository
git clone https://github.com/Daniel-Q-Reis/HealthCoreAPI.git
cd HealthCoreAPI

# 2. Copy environment template
cp .env.example .env

# 3. Update .env with your information
# Edit GIT_AUTHOR_NAME and GIT_AUTHOR_EMAIL

# 4. Open in VS Code
code .

# 5. Reopen in Container when prompted
# Or: Command Palette > Dev Containers: Reopen in Container
```

#### Option 2: Standard Docker

```
# 1. Clone and configure
git clone https://github.com/Daniel-Q-Reis/HealthCoreAPI.git
cd HealthCoreAPI
cp .env.example .env

# 2. Start development environment
make setup

# 3. Verify installation
make test
```

---

## 🔄 Development Workflow

### Branch Strategy

We follow **GitHub Flow** with feature branches:

```
# 1. Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

# 2. Make your changes
# ... code, test, commit ...

# 3. Push and create Pull Request
git push -u origin feature/your-feature-name
```

### Branch Naming Conventions

- **Features**: `feature/short-description`
- **Bug fixes**: `fix/short-description`
- **Documentation**: `docs/short-description`
- **Refactoring**: `refactor/short-description`

**Examples:**
- `feature/notifications-service`
- `fix/appointment-double-booking`
- `docs/deployment-runbook`

### Commit Message Format

We use **Conventional Commits** for clear change history:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Test additions or modifications
- `chore`: Build process or auxiliary tool changes
- `perf`: Performance improvements

**Examples:**

```
# Feature commit
git commit -m "feat(scheduling): add idempotency middleware for appointment booking

Implements idempotency pattern to prevent duplicate appointments from
network retries. Uses Idempotency-Key header for request deduplication.

Closes #42"

# Bug fix commit
git commit -m "fix(admissions): prevent bed double-booking race condition

Adds select_for_update() in bed allocation service to prevent concurrent
booking of same bed. Resolves critical patient safety issue.

Fixes #38"

# Documentation commit
git commit -m "docs: add API authentication guide

Documents JWT authentication flow, token refresh process, and common
authentication errors with troubleshooting steps."
```

---

## 💻 Coding Standards

### Python Style Guide

We enforce code quality through automated tools:

```
# Run all quality checks
make quality

# Individual checks
make lint      # Ruff linting
make format    # Ruff formatting
make typecheck # MyPy type checking
```

### Code Quality Requirements

- **Ruff**: All code must pass linting (configured in `pyproject.toml`)
- **MyPy**: Type hints required for public APIs and service layer
- **Line length**: 88 characters (Black/Ruff default)
- **Imports**: Sorted with isort conventions
- **Docstrings**: Required for all public classes and functions

**Example:**

```
"""
Service layer for the Scheduling bounded context.
"""
from typing import Optional

from .models import Appointment, Slot
from .repositories import SlotRepository


class SlotUnavailableError(Exception):
    """Raised when attempting to book an unavailable slot."""
    pass


def book_appointment(patient_id: int, slot_id: int) -> Appointment:
    """
    Books an appointment for a patient in the specified slot.

    Args:
        patient_id: ID of the patient booking the appointment
        slot_id: ID of the time slot to book

    Returns:
        The created Appointment instance

    Raises:
        SlotUnavailableError: If the slot is already booked or unavailable
    """
    slot = SlotRepository.get_available_slot(slot_id)
    if not slot or slot.is_booked:
        raise SlotUnavailableError(f"Slot {slot_id} is not available")

    # Implementation...
```

### Django Best Practices

#### Models
- Use `ActivatableModel` for soft-delete pattern
- Always include `__str__()` methods
- Define `Meta` with `verbose_name`, `ordering`
- Use explicit `related_name` for relationships

#### Services
- Keep business logic in service layer, not views
- Services should be stateless functions
- Use explicit error types for business rule violations

#### Views
- Use ViewSets for CRUD operations
- Keep views thin - delegate to services
- Use `@extend_schema` for API documentation

#### Tests
- Follow AAA pattern (Arrange, Act, Assert)
- Use descriptive test names: `test_<what>_<condition>_<expected_result>`
- Mock external dependencies
- Test both success and error scenarios

---

## 🧪 Testing Requirements

### Test Coverage

- **Minimum coverage**: 75% (enforced in CI)
- **Target coverage**: 90%+
- **Current coverage**: 93.31% ✅

### Running Tests

```
# Run all tests with coverage
make test

# Run specific test file
pytest src/apps/scheduling/tests.py

# Run specific test
pytest src/apps/scheduling/tests.py::TestSchedulingAPI::test_create_appointment

# Run with verbose output
pytest -vv
```

### Test Structure

```
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from .models import Appointment, Slot

User = get_user_model()


@pytest.fixture
def authenticated_client(api_client):
    """Returns an authenticated API client."""
    user = User.objects.create_user(username='testuser', password='password123')
    api_client.force_authenticate(user=user)
    return api_client


@pytest.mark.django_db
class TestSchedulingAPI:
    """Tests for the Scheduling API endpoints."""

    def test_create_appointment_success(self, authenticated_client):
        """Test successful appointment creation with available slot."""
        # Arrange
        slot = Slot.objects.create(...)
        data = {"patient": 1, "slot": slot.id}

        # Act
        response = authenticated_client.post("/api/v1/scheduling/appointments/", data)

        # Assert
        assert response.status_code == 201
        assert Appointment.objects.count() == 1
```

### Required Test Types

- **Unit tests**: Service layer business logic
- **Integration tests**: API endpoint behavior
- **Repository tests**: Data access layer
- **Edge cases**: Boundary conditions and error scenarios

---

## 🔍 Pull Request Process

### Before Submitting

1. **✅ All tests pass**: `make test`
2. **✅ Code quality passes**: `make quality`
3. **✅ Coverage maintained**: Check coverage report
4. **✅ Documentation updated**: README, ADRs if needed
5. **✅ Branch updated**: Rebase on latest main

### Pull Request Template

```
## Description
Brief description of changes and motivation.

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project coding standards
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added proving fix/feature works
- [ ] Dependent changes merged
```

### Review Process

1. **Automated checks**: CI pipeline must pass (tests, linting, coverage)
2. **Code review**: At least one approval required
3. **Healthcare considerations**: Special attention to patient data handling
4. **Architecture alignment**: Changes should follow existing patterns

### Approval Criteria

- ✅ All CI checks passing
- ✅ Code review approval
- ✅ No merge conflicts
- ✅ Documentation updated
- ✅ Test coverage maintained or improved

---

## 📐 Architecture Decision Records

For **significant architectural decisions**, create an ADR:

### When to Create an ADR

- Adding new external dependencies (libraries, services)
- Changing database schema patterns
- Introducing new architectural patterns
- Significant performance or security decisions
- Changes affecting multiple bounded contexts

### ADR Template

Location: `docs/adr/NNNN-title-with-dashes.md`

```
# ADR-NNNN: Title

**Status:** Proposed | Accepted | Deprecated | Superseded
**Date:** YYYY-MM-DD

## Context
What is the issue that we're seeing that is motivating this decision?

## Decision
What is the change that we're proposing and/or doing?

## Consequences
What becomes easier or more difficult to do because of this change?

### Positive
- ...

### Negative
- ...
```

**Example**: `docs/adr/0008-idempotency-middleware.md`

---

## 🏗️ Project Structure

### Bounded Contexts (Apps)

```
src/apps/
├── core/           # Shared models, middleware, utilities
├── patients/       # Patient data management
├── practitioners/  # Medical staff management
├── scheduling/     # Appointment scheduling
├── admissions/     # Hospital admissions and beds
├── results/        # Diagnostic results and imaging
├── shifts/         # Staff shift management
├── experience/     # Patient feedback and complaints
└── departments/    # Department and specialty management
```

### Adding a New App

```
# 1. Create Django app
docker exec <container> python manage.py startapp <app_name> src/apps/

# 2. Register in settings
# Add to INSTALLED_APPS in src/healthcoreapi/settings/base.py

# 3. Create standard files
src/apps/<app_name>/
├── models.py          # Domain models
├── serializers.py     # API serializers
├── views.py           # API views
├── services.py        # Business logic
├── repositories.py    # Data access (optional)
├── urls.py            # URL routing
├── admin.py           # Django admin
└── tests.py           # Test suite

# 4. Add URL routing
# Include in src/healthcoreapi/urls.py
```

---

## 🛡️ Security Guidelines

### Sensitive Data Handling

- **Never commit secrets**: Use environment variables
- **Patient data**: Always use test/mock data in development
- **HIPAA awareness**: Follow privacy-first patterns
- **SQL injection**: Use Django ORM, never raw SQL with user input
- **XSS prevention**: Use Django templates, validate all input

### Security Checklist

- [ ] No hardcoded credentials or API keys
- [ ] Environment variables used for configuration
- [ ] Input validation on all user-provided data
- [ ] Proper authentication on all endpoints
- [ ] HTTPS enforced in production (see `settings/production.py`)

### Reporting Vulnerabilities

See [SECURITY.md](SECURITY.md) for responsible disclosure process.

---

## 🤝 Community

### Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Pull Requests**: For code contributions

### Recognition

Contributors will be recognized in:
- Project README.md
- Release notes
- Commit history

---

## 📚 Additional Resources

- **README.md**: Quick start and project overview
- **ARCHITECTURE.md**: System design and strategic vision
- **ROADMAP.md**: Future development plans
- **docs/adr/**: Architecture decision records
- **docs/CRITICAL_CONTROL_POINTS.md**: Risk management analysis

---

## ⚖️ License

By contributing to HealthCoreAPI, you agree that your contributions will be licensed under the [Apache-2.0 License](LICENSE).

---

**Thank you for contributing to HealthCoreAPI!** 🏥💙

Your contributions help build a more robust, secure, and healthcare-ready platform.

---

**Project Maintainer**: Daniel de Queiroz Reis
**Email**: danielqreis@gmail.com
**GitHub**: [@Daniel-Q-Reis](https://github.com/Daniel-Q-Reis)
```
