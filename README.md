# HealthCoreAPI

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

## 🏆 Project Highlights

### **Enterprise Architecture & Quality**
- **91.17% Test Coverage** with 200+ comprehensive tests
- **Domain-Driven Design** with 12+ bounded contexts
- **Clean Architecture** principles with service/repository patterns
- **Production-ready** CI/CD pipeline with automated quality gates
- **Infrastructure as Code** using Terraform for Azure AKS deployment

### **Cloud-Native & DevOps Excellence**
- **Kubernetes-native** with professional Helm charts
- **Container orchestration** ready for enterprise scaling
- **Observability** built-in with health checks and Prometheus metrics
- **Resilience patterns** including circuit breakers and caching strategies
- **Security scanning** integrated with Bandit and Safety tools

### **Modern Development Practices**
- **DevContainer** environment for consistent development experience
- **Pre-commit hooks** ensuring code quality standards
- **Architecture Decision Records** (ADRs) documenting technical decisions
- **Comprehensive documentation** for setup, deployment, and operations

---

## 📁 Project Structure

```
HealthCoreAPI/
├── .devcontainer/                 # Development container configuration
│   ├── devcontainer.json         # VS Code devcontainer settings
│   └── setup.sh                  # Automated development environment setup
├── .github/                      # GitHub workflows and templates
│   └── workflows/                # CI/CD pipelines with quality gates
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
├── docs/                         # Comprehensive project documentation
│   ├── adr/                      # Architecture Decision Records (ADRs)
│   │   ├── 0001-django-rest-framework.md
│   │   ├── 0002-postgresql-database.md
│   │   ├── 0003-celery-redis-async-tasks.md
│   │   ├── 0004-prometheus-monitoring.md
│   │   ├── 0005-circuit-breaker-resilience.md
│   │   ├── 0006-kubernetes-helm-deployment.md
│   │   ├── 0007-terraform-infrastructure-code.md
│   │   ├── 0008-rbac-implementation.md
│   │   ├── 0009-pharmacy-module.md
│   │   ├── 0010-equipment-module.md
│   │   └── 0011-clinical-orders-service-request.md
│   ├── CCP_IMPLEMENTATION_STATUS.md  # Critical Control Points implementation status
│   ├── CRITICAL_CONTROL_POINTS.md    # HIPAA/healthcare compliance critical controls
│   ├── DOCKER.md                 # Docker configuration and best practices
│   ├── VSCODE_SETUP.md           # VS Code development environment guide
│   └── WSL2_OPTIMIZATION.md      # WSL2 performance optimization guide
├── logs/                         # Application log files
├── scripts/                      # Utility and deployment scripts
├── terraform/                    # Infrastructure as Code (Azure AKS)
│   ├── providers.tf              # Terraform and Azure provider configuration
│   ├── variables.tf              # Configurable infrastructure parameters
│   └── main.tf                   # Azure resources (AKS, Resource Group, Monitoring)
├── src/                          # Source code organized by domain
│   ├── apps/                     # Django applications (Bounded Contexts)
│   │   ├── admissions/           # Hospital admissions and bed management
│   │   ├── core/                 # Shared core functionality and base models
│   │   │   └── fixtures/         # Initial data fixtures
│   │   │       └── roles.json    # RBAC role definitions (Admins, Doctors, Nurses, Patients)
│   │   ├── departments/          # Department and medical specialty management
│   │   ├── equipment/            # Medical equipment tracking and maintenance
│   │   ├── experience/           # Patient experience and feedback systems
│   │   ├── orders/               # Clinical orders and service requests (FHIR ServiceRequest)
│   │   ├── patients/             # Patient data management and electronic records
│   │   ├── pharmacy/             # Medication inventory and dispensation tracking
│   │   ├── practitioners/        # Medical staff management and credentials
│   │   ├── results/              # Diagnostic results and medical imaging
│   │   ├── scheduling/           # Appointment scheduling and calendar management
│   │   └── shifts/               # Staff shift management and availability
│   ├── healthcoreapi/            # Django project configuration
│   │   ├── settings/             # Environment-specific settings (dev/test/prod)
│   │   ├── asgi.py               # ASGI configuration for async support
│   │   ├── celery.py             # Celery configuration for background tasks
│   │   ├── urls.py               # URL routing and API versioning
│   │   └── wsgi.py               # WSGI configuration for deployment
│   ├── static/                   # Static files and assets
│   ├── templates/                # HTML templates and email templates
│   └── conftest.py               # Pytest fixtures and test configuration
├── .dockerignore                 # Docker build optimization
├── .env.example                  # Environment variables template and documentation
├── .gitignore                    # Git ignore patterns
├── .pre-commit-config.yaml       # Automated code quality and security checks
├── ARCHITECTURE.md               # System architecture and design documentation
├── CONTRIBUTING.md               # Contribution guidelines and development workflow
├── Dockerfile                    # Multi-stage Docker image with security hardening
├── LICENSE                       # Apache-2.0 License
├── Makefile                      # Development workflow automation
├── README.md                     # This file
├── ROADMAP.md                    # Project roadmap and feature development plan
├── SECURITY.md                   # Security policies and vulnerability reporting
├── STATUS.md                     # Current project status and completed features
├── deploy.sh                     # Production deployment automation script
├── docker-compose.yml            # Development environment orchestration
├── docker-compose.prod.yml       # Production environment configuration
├── docker-compose.override.yml   # Local development overrides
├── manage.py                     # Django management script
├── mypy.ini                      # MyPy static type checking configuration
├── nginx.conf                    # Nginx configuration for production deployment
├── pyproject.toml                # Python project configuration and tool settings
├── pytest.ini                   # Pytest configuration and coverage settings
├── requirements.in               # Production dependencies specification
├── requirements.txt              # Pinned production dependencies
├── requirements-dev.in           # Development dependencies specification
└── requirements-dev.txt          # Pinned development dependencies
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

### **🤖 AI-Powered Features** *(NEW)*
- **Pharmacy AI**: Drug information assistant with interactions, dosages, and contraindications
- **Experience AI**: Patient feedback analyzer with sentiment detection and actionable insights
- **Unified AIClient**: Centralized OpenAI integration with graceful degradation
- See [AI_INTEGRATION.md](AI_INTEGRATION.md) for complete documentation

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
