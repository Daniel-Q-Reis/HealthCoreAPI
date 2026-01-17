# Development Roadmap

This document outlines the tactical, sequential plan for implementing the features defined in `GEMINI.md`. Each item represents a vertical slice of functionality to be developed in a dedicated feature branch.

## Phase 1: Core Domain Implementation

- [x] **Slice 1: Patients CRUD (`feature/patients-core-crud`)**
  - [x] Create `patients` Django app.
  - [x] Implement `Patient` model, inheriting from core abstract models.
  - [x] Implement `PatientRepository` for data access.
  - [x] Implement `PatientService` for business logic orchestration.
  - [x] Implement `PatientViewSet` with CRUD endpoints (`/api/v1/patients/`).
  - [x] Write comprehensive tests for models, repositories, services, and the API layer.

- [x] **Slice 2: Practitioners CRUD (`feature/practitioners-core-crud`)**
  - [x] Create `practitioners` Django app.
  - [x] Implement `Practitioner` model.
  - [x] Implement `PractitionerRepository`.
  - [x] Implement `PractitionerService`.
  - [x] Implement `PractitionerViewSet` (`/api/v1/practitioners/`).
  - [x] Write comprehensive tests for the entire vertical slice.

- [x] **Slice 3: Core Authentication (`feature/auth-jwt-setup`)**
  - [x] Configure `djangorestframework-simplejwt` for token-based authentication.
  - [x] Implement token obtain and refresh endpoints.
  - [x] Secure core endpoints, requiring authentication.
  - [x] Update API tests to handle authenticated requests.

## Phase 2: Scheduling and Admissions

- [x] **Slice 4: Scheduling MVP (`feature/scheduling-mvp`)**
  - [x] Implement `Appointment` and `Slot` models.
  - [x] Implement services for booking and viewing appointments.
  - [x] Expose scheduling endpoints via the API.
  - [x] Write tests.

- [x] **Slice 5: Admissions & Beds MVP (`feature/admissions-beds-mvp`)**
  - [x] Implement `Admission`, `Bed`, and `Ward` models.
  - [x] Implement services for patient admission and bed assignment.
  - [x] Expose admissions and bed management endpoints.
  - [x] Create `admin.py` for all new models.
  - [x] Write tests.

## Phase 3: Results & Imaging

- [x] **Slice 6: Results & Imaging MVP (`feature/results-imaging-mvp`)**
  - [x] Implement `DiagnosticReport` and `Observation` models.
  - [x] Implement services for creating reports with associated observations.
  - [x] Expose API endpoints for report management.
  - [x] Create `admin.py` for all new models.
  - [x] Write tests.

## Phase 4: 24x7 Shifts, Specialties, and Patient Experience

- [x] **Slice 7: Shifts & Availability MVP (`feature/shifts-availability-mvp`)**
  - [x] Implement `Shift` model for staffing.
  - [x] Implement services for creating and managing shifts.
  - [x] Expose API endpoints for shift management.
  - [x] Create `admin.py` for the new models.
  - [x] Write tests.

- [x] **Slice 9: Departments & Specialties MVP (`feature/departments-specialties-mvp`)**
  - [x] Implement `Department` and `SpecialtyRule` models.
  - [x] Implement services and API for managing Departments.
  - [x] Create `admin.py` for the new models.
  - [x] Write tests.

- [x] **Slice 8: Patient Experience MVP (`feature/patient-experience-mvp`)**
  - [x] Implement `PatientFeedback` and `PatientComplaint` models.
  - [x] Implement services for submitting feedback and complaints.
  - [x] Expose API endpoints for submissions.
  - [x] Create `admin.py` for the new models.
  - [x] Write tests.

## Phase 5: Observability, APM, Performance

- [x] **Slice 10: Observability Foundational Setup (`feature/observability-foundations-mvp`)**
  - [x] Integrate `django-prometheus` for application metrics.
  - [x] Expose a `/metrics` endpoint.
  - [x] Add basic tests to verify the endpoint.

- [x] **Slice 18: Correlation ID Logging (`feature/correlation-id-logging`)**
  - [x] Create logging context filter using `contextvars` for correlation ID propagation.
  - [x] Enhance `RequestLoggingMiddleware` to accept correlation ID from headers (`X-Correlation-ID` or `Correlation-ID`).
  - [x] Generate correlation ID automatically if not provided in request headers.
  - [x] Store correlation ID in context variables for logging context.
  - [x] Add correlation ID to response headers for distributed tracing.
  - [x] Update logging configuration to include correlation ID in all log records.
  - [x] Add `RequestLoggingMiddleware` to middleware stack with proper ordering.
  - [x] Update CORS headers to allow `X-Correlation-ID` in production.
  - [x] Write comprehensive tests for correlation ID functionality (26 tests covering all scenarios).

## Phase 6: Resilience, Caching, Events

- [x] **Slice 11: Resilience and Caching MVP (`feature/resilience-caching-mvp`)**
  - [x] Implement a request timeout middleware for resilience.
  - [x] Apply view-level caching to a read-only endpoint.
  - [x] Write tests to validate both patterns.

- [x] **Slice 12: Idempotency for Mutating Endpoints (`feature/idempotency-mvp`)**
  - [x] Implement a model to store idempotency keys.
  - [x] Create an idempotency middleware to handle `Idempotency-Key` headers.
  - [x] Apply the middleware pattern to a critical POST endpoint.
  - [x] Write tests to verify duplicate requests are handled correctly.

- [x] **Slice 13: Resilience - Circuit Breaker MVP (`feature/resilience-circuit-breaker-mvp`)**
  - [x] Document the Circuit Breaker pattern in a new ADR.
  - [x] Integrate the `pybreaker` library.
  - [x] Apply the pattern to a service to protect against downstream failures.
  - [x] Write tests to verify the open/closed states of the breaker.

## Phase 7: Kubernetes/AKS Delivery

- [x] **Slice 14: Kubernetes - Helm Charts MVP (`feature/kubernetes-helm-charts-mvp`)**
  - [x] Document the adoption of Helm in a new ADR.
  - [x] Create the basic Helm chart structure (`charts/healthcoreapi`).
  - [x] Implement initial templates for Deployment, Service, and Ingress.

- [x] **Slice 15: CI/CD Pipeline Hardening (`feature/cicd-hardening`)**
  - [x] Add a CI step to validate database migrations.
  - [x] Add a CI step to check for dependency conflicts.
  - [x] Ensure the test suite runs against all created apps.

- [x] **Slice 16: Terraform + AKS Foundational Setup (`feature/iac-terraform-aks-mvp`)**
  - [x] Document the adoption of Terraform for IaC in a new ADR.
  - [x] Create the foundational Terraform structure for Azure.
  - [x] Define initial resources for a Resource Group and AKS cluster.

## Phase 8: Security & Compliance

- [x] **Slice 17: RBAC Implementation (`feature/rbac-implementation`)**
  - [x] Document RBAC architecture and healthcare role requirements in ADR-0008.
  - [x] Create Django Groups fixture for healthcare roles (Admins, Doctors, Nurses, Patients).
  - [x] Implement permission classes (`IsDoctor`, `IsMedicalStaff`, `IsPatientOwner`).
  - [x] Apply RBAC to Patient, Scheduling, and Core API endpoints.
  - [x] Update Django Admin to display and manage user roles.
  - [x] Integrate role loading into container entrypoint for automated setup.
  - [x] Write comprehensive RBAC permission tests.
  - [x] Document HIPAA compliance alignment in Critical Control Points.

## Documentation & Process

- [x] **Chore: Add Initial Architecture Decision Records (`docs/add-initial-adrs`)**
  - Establish ADR process for documenting architectural decisions.
  - Document key decisions from Slices 1-10 (modular monolith, JWT, Celery/Redis, Prometheus).

- [x] **Slice 19: Query Optimization (`perf/query-optimization`)**
  - [x] Optimize `Scheduling` querysets (Appointments, Slots).
  - [x] Optimize `Experience` querysets (Feedback, Complaints).
  - [x] Optimize `Core` querysets (Posts).
  - [x] Implement `assertNumQueries` performance tests.

## Phase 10: Clinical Support & Logistics

- [x] **Slice 20: Pharmacy & Inventory MVP (`feature/pharmacy-inventory-mvp`)**
  - [x] Create ADR-0009 for Pharmacy Module.
  - [x] Implement `Medication` model (Brand, SKU, Expiry, Stock).
  - [x] Implement `Dispensation` model (Audit log of withdrawals).
  - [x] Implement service logic for stock deduction and low-stock alerts (50/25 units).
  - [x] Secure endpoints with RBAC (Doctors/Nurses only).
  - [x] Create `admin.py` and comprehensive tests.

- [x] **Slice 21: Equipment Flow & Logistics (`feature/equipment-logistics`)**
  - [x] Create ADR-0010 for Equipment Module.
  - [x] Implement `Equipment` domain models.
  - [x] Implement `IsMedicalStaff` RBAC permission.
  - [x] Implement service logic: Handoffs, Maintenance Triggers, Reservations.
  - [x] API Endpoints secured for Medical Staff only.
  - [x] Comprehensive tests with RBAC simulation.

- [x] **Slice 22: Clinical Orders & Service Requests (`feature/clinical-orders`)**
  - [x] Create ADR-0011 for Clinical Ordering (FHIR ServiceRequest alignment).
  - [x] Implement `ClinicalOrder` model (Patient, Requester, Priority, Status).
  - [x] Implement RBAC `IsMedicalStaff` for all endpoints.
  - [x] Implement Service Layer: Order Creation Validation, Status Transitions.
  - [x] API Endpoints (Create, List, Cancel, Complete).
  - [x] Comprehensive Integration Tests (14 tests).

- [x] **Slice 23: AI Integration with OpenAI (`feature/ai-integration-openai`)**
  - [x] Create ADR-0012 for AI Integration Strategy.
  - [x] Create AI_INTEGRATION.md in project root.
  - [x] Implement unified `AIClient` in `src/apps/core/ai_client.py`.
  - [x] Implement Pharmacy AI: Drug Information Assistant.
  - [x] Implement Experience AI: Patient Feedback Analyzer.
  - [x] API Endpoints: `/api/v1/pharmacy/ai/drug-info/`, `/api/v1/experience/ai/analyze/`.
  - [x] Comprehensive mocked tests for CI/CD compatibility.

## Phase 11: Observability & Event-Driven Architecture

- [x] **Slice 24: Prometheus & Grafana Dashboards (`feature/prometheus-grafana-dashboards`)**
  - [x] Configure Prometheus metrics scraping from Django.
  - [x] Create custom Grafana dashboards for application monitoring.
  - [x] Auto-provision datasources and dashboards.
  - [x] Document Prometheus queries and Grafana setup.
  - [x] Create PROMETHEUS.md and GRAFANA.md guides.

- [x] **Slice 25: Kafka Event Producer Integration (`feature/kafka-event-producer`)**
  - [x] Create ADR-0014 for Observability & Event-Driven Architecture.
  - [x] Integrate `confluent-kafka` for event streaming.
  - [x] Implement Kafka producer service (singleton pattern).
  - [x] Create domain events (Patient, Appointment).
  - [x] Implement Django signals for automatic event publishing.
  - [x] Create example Kafka consumer for testing.
  - [x] Write comprehensive tests (32 tests, 90%+ coverage).
  - [x] Document Kafka integration in KAFKA.md (400+ lines).
  - [x] Add librdkafka-dev to Dockerfile for production.
  - [x] Fix MyPy strict mode compliance (0 errors).

## Phase 12: Full-Stack Development

- [x] **Slice 26: React Landing Page (`feature/landing-page-react`)**
  - [x] Create ADR-0013 for Full-Stack Architecture.
  - [x] Set up React + TypeScript with Vite.
  - [x] Implement Tailwind CSS for styling.
  - [x] Create bilingual support (PT/EN) with i18next.
  - [x] Build responsive landing page components.
  - [x] Integrate health check API.
  - [x] Docker integration for frontend service.
  - [x] SEO optimization and meta tags.

## Phase 13: Modern Tooling & Performance (In Progress)

- [x] **Slice 30: Infrastructure Quick Fixes (`feature/modern-tooling-improvements`)**
  - [x] Fix Prometheus ALLOWED_HOSTS error.
  - [x] Remove Zookeeper from docker-compose.yml.
  - [x] Update Kafka to KRaft-only configuration.
  - [x] Verify Prometheus metrics scraping.

- [x] **Slice 31: AI Features Documentation Enhancement (`feature/modern-tooling-improvements`)**
  - [x] Expand AI section in README.md with detailed examples.
  - [x] Create comprehensive AI Intelligence section in SHOWCASE.md.
  - [x] Add real-world use cases and API examples.
  - [x] Highlight competitive advantages of AI integration.

- [ ] **Slice 32: UV Dependency Management (`feature/modern-tooling-improvements`)**
  - [ ] Install and configure UV.
  - [ ] Update Dockerfile to use UV.
  - [ ] Update CI/CD pipeline for UV.
  - [ ] Benchmark performance improvements (10-100x faster).
  - [ ] Update documentation and Makefile.

- [ ] **Slice 33: Parallel Testing with pytest-xdist (`feature/modern-tooling-improvements`)**
  - [ ] Install pytest-xdist.
  - [ ] Configure parallel test execution.
  - [ ] Update CI/CD for parallel testing.
  - [ ] Benchmark test execution time (50%+ faster expected).

- [ ] **Slice 34: Landing Page Redesign (`feat/landing-page-redesign`)**
  - [ ] Modern UI with animations.
  - [ ] Glassmorphism effects.
  - [ ] Interactive components.
  - [ ] Portfolio showcase section.

*(This roadmap will be updated as slices are completed and new priorities are defined.)*

## Phase 14: Documentation & Full-Stack Maturity

- [x] **Slice 34: Documentation Debt Resolution (`docs/update-documentation`)**
  - [x] Created ADR-0003 (Frontend JWT Browser Storage Strategy).
  - [x] Restructured README: concise overview + detailed docs.
  - [x] Created `docs/README_BACKEND.md` and `docs/README_FRONTEND.md`.

## Phase 15: Microservices Architecture (Go + DynamoDB)

- [x] **Slice 36: Audit Microservice Extraction (`feat/audit-microservice-go`)**
  - [x] Create ADR-0016 for Audit Microservice (Go + DynamoDB).
  - [x] Implement Go gRPC Service (v1.24).
  - [x] Implement Kafka Consumer for Audit Events.
  - [x] Implement DynamoDB Repository.
  - [x] Integrate Django with gRPC Client.
  - [x] End-to-end testing (gRPC + Kafka integration tests).
  - [x] Create ADR-0017 for Pragmatic Linting Strategy.
  - [ ] Deploy with Azure Container Apps configuration (future).
