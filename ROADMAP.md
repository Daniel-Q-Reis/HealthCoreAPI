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

*(This roadmap will be updated as slices are completed and new priorities are defined.)*
