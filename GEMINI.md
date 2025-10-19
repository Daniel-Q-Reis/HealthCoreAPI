# Project: HealthCore — Enterprise-grade hospital platform with domain-driven modular monolith, microservices readiness, AKS deployment, full observability, and FHIR alignment.

## Guiding Objectives

- [cite_start]Build a hospital platform covering patient management, scheduling, beds/ICU/CCU, results and imaging, 24x7 staffing, specialties, secure result access, and patient experience/humanization KPIs, starting with a modular monolith and an intentional path to AKS microservices with strong observability and security. [cite: 932, 933]
- [cite_start]Enforce industry-aligned interoperability using HL7/FHIR for Patient, Appointment, Observation, DiagnosticReport, ImagingStudy, ServiceRequest, and Encounter-centric flows, with imaging and reporting coherence. [cite: 1381]
- Automate quality gates (lint, SAST, tests, contract checks, performance, container scanning) and enforce API versioning and backward compatibility, including consumer-driven contract testing.

## Architecture Strategy

- Begin as a modular monolith with clear bounded contexts and layered architecture (API, Application/Services, Domain, Infrastructure), extracting services via Strangler pattern as boundaries stabilize.
- One datastore per future service boundary (no cross-schema joins), enabling later migration to isolated managed databases on Azure without coupling.
- [cite_start]Security by design: RBAC, tenant-aware authorization, encryption in transit/at rest, immutable audit logs, least privilege; secrets in Key Vault; gateway/service mesh ready; patient consent and data minimization integrated into access decisions. [cite: 1381]

## Bounded Contexts

- Patients
- Practitioners (medical, nursing, technical staff)
- Scheduling (appointments/exams)
- Admissions & Beds (wards/ICU/CCU)
- Results & Imaging (reports, observations, DICOM metadata)
- Shifts & Availability (24x7 operations)
- Departments/Specialties (oncology, cardiology, pediatrics, OB/GYN, imaging)
- Orders & Referrals (ServiceRequest/encounters)
- Notifications (candidate for first extraction)
- Billing/Authorizations (optional future)
- Admin/Identity & Access
- [cite_start]Equipment Flow & Logistics (mobile equipment reservation, QR code tracking, availability, incident reporting) [cite: 11]
- [cite_start]Patient Experience & Humanization (NPS, wait time tracking, satisfaction signals, complaint channels) [cite: 921]

## Roadmap (Phased)

### Phase 0 — Repository, Tooling, Conventions & Governance

- Mandatory Status Discipline: for any task, first update STATUS.md to “In Progress” with owner and branch; upon completion, update with results and evidence (PRs, diffs, test runs, dashboards).
- Git Workflow and Commit Policy:
  - Trunk-based development; short-lived branches from main.
  - Branch naming: `type/scope/short-description` (e.g., `feature/patients/fhir-patient-model`).
  - Conventional Commits; English-only code/docs.
- Architecture Decision Records (ADRs): document all significant decisions in `adr/` with context, options, trade-offs, compliance implications, and telemetry acceptance tests.
- Module Scaffolding Template: `apps/_template` with services, repositories, domain events, DTOs, validators, OpenAPI stub, tests, health/metrics/tracing, Helm values, CI fragments, and security checklist.
- Contributor Rules: English-only; no cross-domain DB joins; update OpenAPI, tests, and STATUS.md in every PR; include API changelog and deprecation notices when applicable.
- Dev Container: include Docker, buildx, kubectl, helm, k9s, azure-cli, make, tilt/skaffold, OpenAPI tools, k6, OTel CLI; formatter/linter/type-check/test tools preinstalled.
- API Versioning: URI-based `/api/v1` with optional Accept header; `Deprecation/Sunset` headers; CI blocks breaking changes without new version.
- Contract-first APIs: OpenAPI per module; generate SDKs and run consumer-driven contract tests in CI.
- Multi-tenancy: resolve tenant from JWT claim/header; strict tenant scoping on queries, caches, and logs; document partitioning and data governance policy.
- [cite_start]Regulatory groundwork for digital health modules: define compliance register (ANVISA/CFM/SBIS-like requirements, data retention, consent capture, clinical auditability) with placeholders for local jurisdiction mapping. [cite: 1381]

### Phase 1 — Core Domain Modeling (Patients, Practitioners)

- [cite_start]Implement Patients and Practitioners with FHIR-aligned structures and immutable audit; separate schemas; repository interfaces; seed data and synthetic datasets. [cite: 1381]
- Authentication, RBAC, tenant resolution, audit logging; correlation-id middleware; rate limits on auth-sensitive endpoints; consent-aware data reads.
- Expose initial v1 endpoints; E2E locally via devcontainer/compose; assert OpenAPI conformance and basic performance smoke tests.

### Phase 2 — Scheduling and Admissions/Beds

- Scheduling: appointments, slots, exam prep rules, conflicts/rescheduling, waitlist; specialty-driven rules and prioritization.
- Admissions & Beds: occupancy, ward/ICU/CCU tracking, length of stay (LOS), transfers, discharge; constraints (isolation, equipment availability, negative pressure).
- Domain events: `AppointmentCreated`, `BedAssigned`, `AdmissionStarted` → internal bus abstraction (Kafka/Service Bus ready).
- [cite_start]Operational KPIs baseline: occupancy rate, average LOS, wait time to admit, ICU/CCU saturation; wire into metrics. [cite: 990, 994, 999]

### Phase 3 — Results & Imaging

- [cite_start]DiagnosticReports and Observations with FHIR mapping; ingest text and imaging metadata; secure retrieval with fine-grained authorization and consent checks. [cite: 1381]
- Retention policies; immutable audit; support for attachments and ImagingStudy references; structured report composition alignment.

### Phase 4 — 24x7 Shifts, Specialties, and Patient Experience

- Shifts & Availability with staffing constraints and fair scheduling; integrate into appointment booking and admissions planning.
- Departments/Specialties feature-flagged subdomains; rules via APIs/events with compatibility guarantees.
- Patient Experience & Humanization service: capture wait time, satisfaction ratings, feedback, and complaints/escalations; link to national policy constructs where applicable; [cite_start]KPI dashboards. [cite: 933, 934]

### Phase 5 — Observability, APM, Performance

- Prometheus metrics, structured logs, distributed tracing via OpenTelemetry; exporters for DataDog/New Relic; labels for tenant, department, endpoint.
- SLIs/SLOs per endpoint (P50/P95/P99, error rate) with alerting; k6 test suites (smoke, ramp, stress, soak) with CI thresholds and regression gates.

### Phase 6 — Resilience, Caching, Events

- Timeouts, retries (exponential backoff + jitter), circuit breakers, bulkheads; idempotency keys on mutating POSTs; saga orchestration where cross-domain write consistency matters.
- Redis caching: cache-aside/read-through; `ETag/If-None-Match` for GET; event-driven cache invalidation.
- Event sourcing selectively for Admissions & Beds (and optionally Patient history) to preserve temporal history; other domains rely on event-carried state + audit logs.

### Phase 7 — Kubernetes/AKS Delivery

- Helm charts per module: Deployment, Service, HPA, PDB, NetworkPolicy, Ingress, probes, resource requests/limits, tolerations/affinity; Key Vault CSI for secrets; optional OTel sidecar.
- AKS advanced patterns: Workload identity (Entra), restricted egress, Azure Monitor + OTel for logs/metrics/traces, multi-AZ/region guidance, SLO- and cost-aware autoscaling.
- Prefer managed stores (Azure SQL/Cosmos) or PVs via Azure Disk/Files for state; avoid node-local storage for critical data.

### Phase 8 — CI/CD and Compliance

- CI: build/test/lint/typecheck/contract tests/SAST/image scan/SBOM; ephemeral namespaces for integration; k6 gates; artifact signing and provenance.
- CD: staged releases, canary on AKS, automated rollback; policies for non-root images, resource quotas, egress restrictions, NetworkPolicies; publish API deprecations and lifecycle.
- Compliance: immutable audit logs and secure retention; periodic key rotations; [cite_start]API catalog with lifecycle policies; data protection impact assessment templates; governance workflows for clinical safety cases. [cite: 1381]

### Phase 9 — Extraction to Microservices

- Strangler pattern: extract Notifications first, then Scheduling or Results; keep contracts stable and per-service data; measure parity before shifting traffic; sustain tracing continuity.
- Introduce API gateway/service mesh (mTLS, retries, timeouts, circuit breaking) as extractions progress.

## API Endpoints (v1, sample paths)

### Patients

- `POST /api/v1/patients` — create patient; returns FHIR-aligned identifier; audit entry; consent baseline capture.
- `GET /api/v1/patients?name=&dob=&identifier=` — search with filters and pagination; tenant-scoped; consent-aware.
- `GET /api/v1/patients/{id}` — retrieve patient with consents, allergies, conditions summary; ETag support.
- `PATCH /api/v1/patients/{id}` — partial update with audit reason; optimistic concurrency.
- `GET /api/v1/patients/{id}/history` — audit/event stream slice.

### Practitioners

- `POST /api/v1/practitioners` — create practitioner (role, specialties, credentials, privileges).
- `GET /api/v1/practitioners?specialty=&status=` — filterable listing; availability flag.
- `GET /api/v1/practitioners/{id}` — profile with active privileges and departments.
- `PATCH /api/v1/practitioners/{id}` — RBAC-scoped update.

### Scheduling

- `POST /api/v1/appointments` — book appointment/exam with slot validation, prep instructions, prioritization.
- `GET /api/v1/appointments?patientId=&practitionerId=&dateFrom=&dateTo=` — list/filter.
- `GET /api/v1/appointments/{id}` — details with status transitions.
- `POST /api/v1/appointments/{id}/reschedule` — conflict resolution and audit.
- `POST /api/v1/appointments/{id}/cancel` — business rules and waitlist promotion.
- `GET /api/v1/slots?department=&modality=&date=` — discover availability by department/modality.

### Admissions & Beds

- `POST /api/v1/admissions` — start admission; link patient and initial ward.
- `POST /api/v1/admissions/{id}/transfer` — move between wards/ICU/CCU; record timestamps and constraints (isolation/equipment).
- `POST /api/v1/admissions/{id}/discharge` — close admission and compute LOS.
- `GET /api/v1/beds?ward=&icu=true` — bed inventory, occupancy, isolation flags.
- `POST /api/v1/beds/{id}/assign` — assign patient with constraints and idempotency key.

### Results & Imaging

- `POST /api/v1/results` — create DiagnosticReport (links to Observations and optional attachments).
- `GET /api/v1/results?patientId=&type=&dateFrom=&dateTo=` — filtered listing with RBAC and consent checks.
- `GET /api/v1/results/{id}` — retrieve DiagnosticReport with referenced Observations.
- `GET /api/v1/observations/{id}` — retrieve Observation (lab values, imaging findings).
- `POST /api/v1/imaging/studies` — register ImagingStudy metadata (DICOM-aligned references).
- `GET /api/v1/imaging/studies?patientId=&modality=` — list studies with series/instance counts.

### Shifts & Availability

- `POST /api/v1/shifts` — create staffing shift; constraints and overlap validation.
- `GET /api/v1/shifts?department=&date=` — list shifts for scheduling views.
- `GET /api/v1/practitioners/{id}/availability?date=` — compute availability across shifts/scheduling.

### Departments/Specialties

- `GET /api/v1/departments` — list departments with capabilities.
- `GET /api/v1/departments/{id}/rules` — fetch domain rules/flags (feature-flag aware).

### Orders & Referrals

- `POST /api/v1/orders` — create ServiceRequest/referral linking patient, practitioner, department, and reason.
- `GET /api/v1/orders?patientId=&status=` — list and track lifecycle.

### Notifications (candidate microservice)

- `POST /api/v1/notifications` — enqueue notification (email/SMS/push) with templating.
- `GET /api/v1/notifications/{id}/status` — delivery status.

### Admin/Identity

- `POST /api/v1/tenants` — create tenant (optional multi-tenancy).
- `GET /api/v1/me` — current principal, roles, tenant, permissions.

### Observability/Health

- `GET /health/live` — liveness probe.
- `GET /health/ready` — readiness probe (downstream checks).
- `GET /metrics` — Prometheus metrics.
- Trace context on all requests (correlation-id, baggage) with OTel propagation.

### Equipment Flow & Logistics

- [cite_start]`POST /api/v1/equipment` — register mobile equipment (category, brand, photo, QR code). [cite: 392]
- [cite_start]`GET /api/v1/equipment?category=&location=&status=` — search/list by category, location, or availability. [cite: 392]
- [cite_start]`POST /api/v1/equipment/{id}/reserve` — reserve equipment with start/end time, purpose, department; idempotency key. [cite: 392]
- [cite_start]`POST /api/v1/equipment/{id}/handoff` — record movement between locations/users via QR code scan; capture actor and timestamp. [cite: 392]
- [cite_start]`POST /api/v1/equipment/{id}/return` — complete reservation and update availability via QR code scan at return point. [cite: 392]
- [cite_start]`POST /api/v1/equipment/{id}/incident` — report malfunction/damage with photos and severity; route to maintenance queue. [cite: 392]
- [cite_start]`GET /api/v1/equipment/{id}/history` — movement and reservation history; audit trail. [cite: 392]

### Patient Experience & Humanization

- [cite_start]`POST /api/v1/px/feedback` — capture patient feedback (wait time, treatment interaction rating, comments). [cite: 934]
- [cite_start]`GET /api/v1/px/kpis?department=&dateFrom=&dateTo=` — KPIs like occupancy, average LOS, infection rates, wait times, patient satisfaction; per department/tenant. [cite: 990, 994, 999, 1004]
- [cite_start]`POST /api/v1/px/complaints` — log complaint with category, severity, escalation path; integrate with governance channels. [cite: 933]

## Data Model Skeleton (models blueprint, not code)

### Patients

- **Patient:** id (UUID), identifiers (MRN, national id), name (given, family), birthDate, sex, contact info, address, weight, height, BMI (derived), allergies (list), conditions (pre-existing), pastSurgeries (list), medications (current), consents (scoped), emergencyContacts, primaryPractitionerId, preferredLanguage, communicationPreferences, tenantId, createdAt, updatedAt, version.
- **Allergy:** substance, reaction, severity, recordedDate.
- **Condition:** code, onsetDate, status, notes.
- **Consent:** scope, policyRef, grantedAt, revokedAt.

### Practitioners

- **Practitioner:** id, name, role (physician, nurse, tech), specialties (list), licenseNumbers, credentials, departments (refs), availabilityDefaults, privileges, active, tenantId, createdAt, updatedAt, version.
- **DepartmentMembership:** practitionerId, departmentId, privileges, effectiveFrom, effectiveTo.

### Scheduling

- **Appointment:** id, patientId, practitionerId, departmentId, type (consultation, exam), modality (imaging), location, startTime, endTime, status (booked, rescheduled, cancelled, completed), prepInstructions, notes, priority, waitlistRank, tenantId, createdAt, updatedAt, version.
- **Slot:** id, departmentId, modality, startTime, endTime, capacity, reserved, tenantId.
- **RescheduleHistory:** appointmentId, fromTime, toTime, reason, actorId, at.

### Admissions & Beds

- **Admission:** id, patientId, status (active, transferred, discharged), startedAt, endedAt, currentWardId, currentBedId, acuityLevel, isolationRequired, notes, tenantId, version.
- **Transfer:** id, admissionId, fromWardId, toWardId, fromBedId, toBedId, at, reason.
- **Bed:** id, wardId, type (standard, ICU, CCU, isolation), status (free, reserved, occupied, cleaning, maintenance), features (ventilator, negativePressure), tenantId, version.
- **Ward:** id, name, departmentId, capacity, features, tenantId.

### Results & Imaging

- **DiagnosticReport:** id, patientId, status, category (lab, imaging), code, issuedAt, performerIds, conclusionText, conclusionCodes, mediaRefs, observationIds, documentUri/hash, imagingStudyRefs, tenantId, version.
- **Observation:** id, patientId, code, value[x] (quantity, codeableConcept, text), unit, referenceRange, effectiveAt, performerId, interpretation, relatedReportId, tenantId, version.
- **ImagingStudy:** id, patientId, modality, startedAt, numberOfSeries, numberOfInstances, dicomStudyUid, seriesMetadata, authorizationTrace, tenantId, version.

### Shifts & Availability

- **Shift:** id, departmentId, role, startTime, endTime, requiredCount, assignedPractitionerIds, constraints, tenantId, version.
- **PractitionerAvailability:** practitionerId, date, availableWindows, notes, tenantId.

### Departments/Specialties

- **Department:** id, name, type, capabilities (flags), contact, tenantId.
- **SpecialtyRule:** id, departmentId, ruleKey, ruleValue (JSON), effectiveFrom, effectiveTo.

### Orders & Referrals

- **Order (ServiceRequest):** id, patientId, requesterPractitionerId, departmentId, reasonCode, priority, status, scheduledFor, linkedAppointmentId, tenantId, version.

### Notifications

- **Notification:** id, recipient (patient/practitioner/contact), channel (email/SMS/push), templateKey, payload (JSON), status, attempts, lastError, tenantId, version.

### Admin/Identity

- **Tenant:** id, name, slug, settings (JSON), status, createdAt, updatedAt.
- **Role:** id, name, permissions (list), tenantId.
- **UserPrincipal:** id, externalId, displayName, roles, tenantId.

### Equipment Flow & Logistics

- [cite_start]**Equipment:** id, type (stretcher, IV stand, wheelchair, defibrillator, ECG, infusion pump, hamper, auxiliary table, X-ray, emergency cart, cardioversion, scale, BP device), brand, model, serialNumber, qrCode, thumbnailUri, accessories (list), currentLocationId, status (available, reserved, inUse, maintenance, lost), maintenanceDueAt, tenantId, createdAt, updatedAt, version. [cite: 68]
- [cite_start]**EquipmentReservation:** id, equipmentId, requesterId, departmentId, purpose, startTime, endTime, status (active, completed, cancelled), tenantId, createdAt, updatedAt. [cite: 392]
- [cite_start]**EquipmentMovement:** id, equipmentId, fromLocationId, toLocationId, actorId, at, method (scan/manual), notes, tenantId. [cite: 148]
- [cite_start]**EquipmentIncident:** id, equipmentId, reporterId, severity, description, photos (list), reportedAt, status (open, investigating, resolved), tenantId. [cite: 392]
- **Location:** id, name, type (ER, ward, ICU, lab, imaging), parentId, tenantId.

### Patient Experience & Humanization

- [cite_start]**PatientFeedback:** id, patientId (optional, if anonymous), encounterId (optional), departmentId, waitTimeMinutes, ratings (communication, empathy, environment, overall), comments, submittedAt, tenantId. [cite: 934]
- [cite_start]**PatientComplaint:** id, patientId (optional), category (access, safety, quality, logistics), severity, description, attachments, submittedAt, status (open, escalated, resolved), handledBy, tenantId. [cite: 933]
- [cite_start]**HumanizationPolicyLink:** id, policyRef, description, channels (list), departmentId, effectiveFrom, effectiveTo, tenantId. [cite: 1006]

### Cross-cutting

- **AuditLog:** id, actorId, action, resourceType, resourceId, before (JSON), after (JSON), at, tenantId.
- **OutboxEvent:** id, aggregateType, aggregateId, eventType, payload (JSON), occurredAt, publishedAt, retries.

## Interoperability (FHIR)

- Map Patient ↔ FHIR Patient; Appointment ↔ FHIR Appointment; Observation ↔ FHIR Observation; DiagnosticReport ↔ FHIR DiagnosticReport; ImagingStudy ↔ FHIR ImagingStudy; [cite_start]ServiceRequest ↔ Orders; ensure coherent references and workflow semantics (report references to observations and imaging studies). [cite: 1381]
- Imaging and reporting: ensure DiagnosticReport composes observations and references imaging studies; structure data for downstream exchange and viewer integration.

## Observability and APM

- Expose `/metrics` for HTTP, DB, cache, queue, and domain KPIs (occupancy, LOS, wait time, satisfaction); label by tenant, department, endpoint; OTel traces across module boundaries; export to DataDog/New Relic; centralize logs in Azure Monitor/Log Analytics.
- Define SLIs/SLOs per endpoint and per domain KPI; add alerting and run k6 test types (smoke, ramp, stress, soak) with CI thresholds and trend reports.

## Resilience and Performance

- Defaults: timeouts, retries with exponential backoff + jitter, circuit-breakers, bulkheads; idempotency keys on all mutating POSTs.
- Pagination, `ETag/If-None-Match`, `gzip/br` compression; strict validation and rate limiting on hot endpoints; async processing for heavy tasks (report ingestion, KPI aggregation).

## Caching Strategy

- Redis cache-aside for read-heavy resources; read-through for static reference data; write-through only when justified; keys include tenant; event-driven invalidation for domain updates.

## Kubernetes/AKS Manifests

- Helm per module/service: Deployment, Service, HPA, PDB, NetworkPolicy, Ingress, probes, resource limits/requests, tolerations/affinity; Key Vault CSI; optional OTel sidecar/agent; cost tags and budgets.
- Use managed data services (Azure SQL/Cosmos) or PVs via Azure Disk/Files where needed; no node-local persistence for critical data.

## CI/CD and Governance

- CI stages: lint/typecheck/tests/coverage, OpenAPI contract tests, SAST, image build+scan, SBOM; integration tests in ephemeral namespaces; k6 gates; artifact signing and provenance (Sigstore/cosign).
- CD: canary on AKS with automated rollback; enforce non-root images, resource quotas, NetworkPolicy coverage, egress control; publish API deprecations and lifecycles to the API catalog; periodic pen-tests and compliance audits.

## Microservices Extraction Criteria

- Extract when service has isolated data, stable contracts, clear operational ownership; migrate Notifications first, then Scheduling or Results; maintain compatibility during cut-over; validate parity via telemetry and synthetic checks before decommissioning monolith routes.

## MCP and Best Practices Automation

- Scaffolding CLI to generate modules/services with standard layers, OpenAPI stubs, health/metrics/tracing, tests, Helm chart, CI fragments; enforce ADR creation and checklists (security, privacy, compliance, performance).

## Contributor Rules

- [cite_start]English only; domain-driven naming; no shared cross-domain DB joins; every PR updates OpenAPI, tests, and STATUS.md; breaking changes require a new API version and deprecation headers; ensure consent and privacy impact are considered in design reviews. [cite: 1381]

## STATUS.md Policy

- Always update on start and completion: shipped changes, measurable SLO and domain KPI deltas (e.g., P95 latency, occupancy trend accuracy), links to PRs, OpenAPI changelog, k6 reports, dashboards; list blockers and the next step with Definition of Done.

## Domain KPIs and Humanization Metrics (for dashboards and SLOs)

- [cite_start]**Operational:** occupancy rate, average LOS, ICU/CCU saturation, patient wait times by department/triage level, equipment availability ratio, mean time to locate equipment, reservation lead time, equipment incident rate. [cite: 990, 994, 999] [cite_start][cite: 69]
- [cite_start]**Quality/Safety:** infection rates proxy (integration placeholder), incident response time, audit completeness, consent capture coverage. [cite: 996]
- [cite_start]**Patient Experience:** satisfaction index (overall and dimensions), complaint count and resolution time, communication quality score, humanization adherence indicators. [cite: 1004]

## Mobile and UX Extensions (future-facing)

- [cite_start]**Staff mobile app:** scan QR codes to locate/reserve/return equipment; quick incident reporting with photos; offline capture with sync. [cite: 258]
- [cite_start]**Patient portal/mobile:** view appointments, prep instructions, wait time guidance, result access per consent, feedback and complaint channels aligned with humanization policy; respect privacy constraints and regulatory posture. [cite: 933, 934]
- [cite_start]**Dermatology AI integration placeholder:** optional module for image triage research sandbox with strict governance (not for diagnosis), ethics board approvals, and data de-identification pipelines; no clinical decision without physician oversight; regulatory feature flag. [cite: 1384]

## Regulatory and Commercialization Considerations

- [cite_start]Maintain a registry of applicable local regulations (e.g., ANVISA/CFM/SBIS-like), intended use statements per module, and risk classification assumptions; include change management for when modules evolve into regulated functionality. [cite: 1652]
- [cite_start]Prepare compliance packs: software lifecycle docs, validation evidence, audit trails, data protection impact assessments, consent models, and clinical safety cases; map to target market frameworks. [cite: 1381]
- [cite_start]Business pathways: B2B (hospitals/clinics), B2G (public networks), with value metrics linking KPIs to cost and quality outcomes; humanization and logistics modules as immediate differentiators; pilot/MVP plans with success criteria. [cite: 1890] [cite_start][cite: 936]

---

## Appendices

### Appendix A — STATUS.md templates

#### A1. Project STATUS.md (top-level)

- **Header**
  - Project: HealthCore
  - Date: YYYY-MM-DD
  - Release train: e.g., 2025.10
  - Owner: <name/handle>
  - Environment snapshot: main commit, AKS namespace/version
- **Summary**
  - Overall status: Green | Amber | Red
  - This period highlights: 3–5 bullets of delivered value
  - Risks/blockers: id, description, impact, owner, due date
- **KPI/SLO Pulse**
  - API latency P50/P95/P99 (v1 aggregate)
  - Error rate 4xx/5xx
  - Domain KPIs: occupancy, LOS, wait time, satisfaction (delta vs target)
  - Equipment availability ratio, mean time to locate
- **Roadmap Progress**
  - Phase N tasks
    - **Completed:**
      - `[ID]` <title> — link to PR(s)/deploy, OpenAPI diff, k6 report
    - **In Progress:**
      - `[ID]` <title> — owner, branch, ETA, blockers
    - **Next Up:**
      - `[ID]` <title> — acceptance criteria, SLO targets
- **Evidence Links**
  - Dashboards (observability, KPIs)
  - CI pipelines and artifacts (SBOM, SAST)
  - Release notes
- **Decision Log**
  - ADRs approved in this period with links

#### A2. Module STATUS.md (per bounded context)

- **Module:** <Patients | Scheduling | Admissions & Beds | …>
- **Version:** v1.x
- **Owner:** <name/handle>
- **Scope**
  - Capabilities in-scope this iteration
- **Health**
  - Build, tests, coverage, contract tests status
  - Perf gates summary (thresholds vs actuals)
- **Interface Changes**
  - Endpoints added/changed/deprecated with OpenAPI links
- **Data Changes**
  - Migrations, backward-compatibility notes, data retention updates
- **Security & Compliance**
  - Threat modeling updates, findings, mitigations
  - Audit coverage and consent handling notes
- **Evidence**
  - PRs, test jobs, perf reports, dashboards
- **Footer:** “Update this file before starting tasks (In Progress) and after completion (Evidence + Next Step).”

---

### Appendix B — ADR template (Architecture Decision Record)

- **ADR-XXXX:** <Concise decision title>
- **Status:** Proposed | Accepted | Deprecated | Superseded by ADR-YYYY
- **Date:** YYYY-MM-DD
- **Context**
  - Problem statement
  - Constraints and compliance considerations (e.g., consent, audit, retention, ANVISA/CFM/SBIS-like)
  - Operational goals (SLOs, cost, skills)
- **Options Considered**
  - Option A — pros/cons
  - Option B — pros/cons
  - Option C — pros/cons
- **Decision**
  - Chosen option and justification, including humanization/logistics impact (if applicable)
- **Consequences**
  - Positive outcomes
  - Trade-offs and known risks
  - Required compensating controls (security, privacy, compliance)
- **Implementation Notes**
  - Phasing, feature flags, telemetry acceptance tests
  - Rollback plan
- **Links**
  - Related ADRs
  - RFCs, PRs, diagrams, runbooks

**Recommended ADRs early:**
- [cite_start]Datastore per module (Azure SQL vs Cosmos DB) with multi-tenant strategy. [cite: 1381]
- Event backbone (Kafka vs Azure Service Bus) abstraction and schema strategy.
- [cite_start]Observability stack (OTel exporters, dashboards, SLIs/SLOs) with humanization KPIs. [cite: 921]
- API gateway vs service mesh adoption path.
- Imaging metadata handling and FHIR mappings for DiagnosticReport/ImagingStudy.
- [cite_start]Equipment QR strategy and offline sync patterns for staff app. [cite: 263]
- [cite_start]Consent model and audit immutability store selection. [cite: 1381]

---

### Appendix C — Security, Privacy, Compliance checklists (per module)

Apply at module creation and at every major change. Mark N/A only with justification.

#### C1. Universal checklist (all modules)

- **Identity & Access**
  - AuthN via centralized provider; AuthZ via roles/permissions; least privilege enforced
  - Tenant scoping for all reads/writes and cache keys
  - Rate limiting and abuse controls at endpoints with PII/PHI
- **Data Protection**
  - Encryption in transit (TLS) and at rest (managed store defaults)
  - Secrets in Key Vault; no secrets in code or CI logs
  - PII/PHI data elements documented; data minimization applied
  - Data retention and deletion policies configured and documented
- **Privacy & Consent**
  - Consent model enforced in queries and response shaping where applicable
  - Purpose limitation documented; logging avoids sensitive payloads
  - [cite_start]DPIA entry updated (Data Protection Impact Assessment) with risk ratings [cite: 1381]
- **Audit & Forensics**
  - Immutable audit log entries for mutating operations with actor, reason, diffs
  - Correlation-id propagation; trace context bound to audits
- **Resilience & Recovery**
  - Timeouts, retries with jitter, circuit breakers configured
  - Idempotency for mutating POSTs with keys and dedupe storage
  - Backup/restore runbooks for datastore
- **Observability**
  - `/health/live` & `/health/ready` implemented
  - `/metrics` exposes HTTP, DB, cache, queue metrics + domain KPIs where relevant
  - Tracing spans with module and tenant labels; error attribution
- **Supply Chain**
  - Image base pinned; SBOM generated; image signing and policy verification
  - SAST and dependency scans gating merges
- **Compliance Register**
  - Module entry references applicable regulatory requirements and intended use
  - If “research-only,” feature-flag guarded and segregated datasets

#### C2. Patients

- Privacy-by-design review; PII/PHI classification and masking strategy
- [cite_start]Consent capture endpoints and storage; read filters respect consent scopes [cite: 1381]
- Export/portability considerations; access logs available for patient inquiries

#### C3. Practitioners & Shifts

- License/credential fields protected; privilege escalation prevention
- Scheduling data avoids overexposure of personal data in multi-tenant views

#### C4. Scheduling

- Priority rules documented (triage, specialties) with fairness considerations
- Race conditions on booking mitigated (optimistic concurrency/locks)

#### C5. Admissions & Beds

- Event sourcing boundaries documented; replays tested
- Bed assignment constraints (isolation, equipment) validated; safety-first rules

#### C6. Results & Imaging

- FHIR alignment for DiagnosticReport/Observation/ImagingStudy; reference integrity
- Access controls for report/media; signed URLs or proxy pattern; retention policies

#### C7. Equipment Flow & Logistics

- QR code generation, collision prevention, and revocation policy
- Offline staff app data minimal and encrypted at rest; secure sync; tamper evidence
- [cite_start]Incident workflow with severity and SLA targets; maintenance audit trails [cite: 392]

#### C8. Patient Experience & Humanization

- Feedback anonymization options; complaint redaction workflow
- [cite_start]KPI dashboards avoid deanonymization; aggregation thresholds [cite: 933]

#### C9. Notifications

- Template data sanitized; PII minimization; channel-specific consent
- Delivery provider credentials rotation; failure handling without leaking PII

---

### Appendix D — Definition of Done (DoD) per module increment

- **Code**
  - All public endpoints defined in OpenAPI; examples and error schemas included
  - Unit tests ≥ 80% for domain logic; integration tests for critical paths
  - Consumer-driven contract tests green
- **Operations**
  - Health checks, metrics, tracing present and validated in dev/stage
  - Helm chart values for probes, HPA, NetworkPolicy; resource sizing baseline
- **Security & Compliance**
  - Security checklist completed; SAST clean or waived with ADR
  - DPIA updated if PII/PHI surface changed; audit coverage verified
- **Performance**
  - k6 profile run; thresholds met (e.g., P95 latency target, error rate < target)
- **Documentation**
  - README for module, OpenAPI rendered, runbooks updated
  - STATUS.md updated with Evidence and Next Step

---

### Appendix E — Example STATUS.md entries

#### E1. Project STATUS.md (example)

- **Date:** 2025-10-17
- **Overall:** Amber (perf gate failing for Scheduling soak)
- **Highlights**
  - Patients v1 shipped with consent-enforced reads and ETag
  - Equipment QR registration, reserve/return MVP done
  - Dashboards: occupancy, LOS, equipment availability online
- **Risks**
  - Scheduling soak P95 920ms > 800ms SLO — owner `@alice`, fix by 10/20
- **KPI/SLO Pulse**
  - API P95: 310ms (target 300ms)
  - Occupancy: 76% (target band 70–85%)
  - Equipment availability: 88% (target ≥ 90%)
  - Patient satisfaction (overall): 4.2/5 (target ≥ 4.3)
- **Roadmap Progress**
  - **Completed:** ADR-001 Datastores; ADR-004 Consent Model; Patients v1
  - **In Progress:** Scheduling booking rules; Admissions transfers
  - **Next Up:** DiagnosticReport endpoints; Shifts integration
- **Evidence**
  - PRs: `#112`, `#119`; OpenAPI diff: `v1.3→v1.4`; k6 report links

#### E2. Module STATUS.md — Equipment Flow (example)

- **Version:** v1.0
- **Owner:** `@ops-jo`
- **Health:** build ✅ tests ✅ coverage 86% contracts ✅ perf smoke ✅
- **Interface Changes:** added `/reserve`, `/handoff`, `/return`; OpenAPI v1.0.3
- **Data Changes:** EquipmentIncident table added; backfilled none
- **Security:** QR collision test added; offline encryption verified; DPIA updated
- **Evidence:** PRs `#131`, `#135`; k6 smoke OK; dashboard “Equipment Ops v1”
- **Next Step:** add incident SLAs and maintenance queue integration (DoD listed)

---

### Appendix F — Example ADRs (skeletons)

- **ADR-001:** Per-module data stores with Azure SQL baseline, Cosmos DB for high-cardinality event feeds — Accepted 2025-10-12
- **ADR-004:** Patient consent model with scoped access filters and audit binding — Accepted 2025-10-14
- **ADR-010:** QR-based equipment tracking with offline-first staff app and secure sync — Proposed 2025-10-18

---

### Appendix G — Governance registers

- **Regulatory register (per target market)**
  - Intended use per module, risk class assumption, approvals needed, dependencies
  - Evidence pointers (validation reports, audit trails, DPIA)
- **Risk register**
  - Threats (security, privacy, safety), likelihood×impact, mitigation, owner, review date
- **API lifecycle catalog**
  - Version, status (active/deprecated/sunset), deprecation date, replacement, telemetry

---

### Appendix H — Example checklists (quick reference)

- **Release readiness**
  - CI green: unit/integration/contract; SAST; image scan; SBOM; signatures
  - Perf gates met; error budget respected
  - Runbooks updated; rollback validated
- **Incident response**
  - On-call rotation; escalation paths; SLAs for patient-facing issues
  - Forensics: logs/traces/audits retrievable and privacy-safe
