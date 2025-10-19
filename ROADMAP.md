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

- [ ] **Slice 2: Practitioners CRUD (`feature/practitioners-core-crud`)**
  - [ ] Create `practitioners` Django app.
  - [ ] Implement `Practitioner` model.
  - [ ] Implement `PractitionerRepository`.
  - [ ] Implement `PractitionerService`.
  - [ ] Implement `PractitionerViewSet` (`/api/v1/practitioners/`).
  - [ ] Write comprehensive tests for the entire vertical slice.

- [ ] **Slice 3: Core Authentication (`feature/auth-jwt-setup`)**
  - [ ] Configure `djangorestframework-simplejwt` for token-based authentication.
  - [ ] Implement token obtain and refresh endpoints.
  - [ ] Secure core endpoints, requiring authentication.
  - [ ] Update API tests to handle authenticated requests.

## Phase 2: Scheduling and Admissions

- [ ] **Slice 4: Scheduling MVP (`feature/scheduling-mvp`)**
  - [ ] Implement `Appointment` and `Slot` models.
  - [ ] Implement services for booking and viewing appointments.
  - [ ] Expose scheduling endpoints via the API.
  - [ ] Write tests.

- [ ] **Slice 5: Admissions & Beds MVP (`feature/admissions-beds-mvp`)**
  - [ ] Implement `Admission`, `Bed`, and `Ward` models.
  - [ ] Implement services for patient admission and bed assignment.
  - [ ] Expose admissions and bed management endpoints.
  - [ ] Write tests.

*(This roadmap will be updated as slices are completed and new priorities are defined.)*
