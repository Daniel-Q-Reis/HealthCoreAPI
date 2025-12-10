# ADR-0011: Clinical Orders and Service Requests

**Status:** Accepted
**Date:** 2025-12-09

## Context

A Hospital Management System requires a formal mechanism for practitioners to request services (Labs, Imaging, Procedures) for patients. Currently, we have `Results` and `Scheduling`, but no explicit "Order" object that precedes them. We need to close the loop: *Request → Schedule → Perform → Result*.

## Decision

We will implement a bounded context `orders` centered on the `ClinicalOrder` model.

**Design Principles:**

1. **FHIR Alignment:** The model closely maps to the [FHIR ServiceRequest](https://www.hl7.org/fhir/servicerequest.html) resource.
2. **Strict Relationships:** An Order MUST link a `Patient` (Subject) and a `Practitioner` (Requester).
3. **State Machine:** Orders have a strictly defined lifecycle (`DRAFT` → `ACTIVE` → `COMPLETED` / `CANCELLED`).
4. **Security:** Only Medical Staff can create or modify orders (IsMedicalStaff RBAC).

**Key Fields:**

| Field | Description | FHIR Mapping |
|-------|-------------|--------------|
| `patient` | Patient who is the subject of the order | `subject` |
| `requester` | Practitioner who requested the service | `requester` |
| `target_department` | Department responsible for fulfillment | `performer` |
| `category` | LAB, IMAGING, PROCEDURE, REFERRAL | `category` |
| `code` | Service code (LOINC, CPT, internal) | `code` |
| `status` | DRAFT, ACTIVE, ON_HOLD, COMPLETED, CANCELLED | `status` |
| `priority` | ROUTINE, URGENT, ASAP, STAT | `priority` |
| `requested_date` | When service should occur | `occurrence` |

**Validation Rules:**

- Cannot create orders for inactive/discharged patients
- Cannot create orders from inactive practitioners
- Cannot create orders for past dates
- Cancelled orders cannot be modified (except to mark as error)
- Completed orders can only be cancelled or marked as error

## Consequences

**Positive:**

- **Clinical Governance:** Full audit trail of who ordered what and when
- **Workflow Driver:** Pending orders act as a "ToDo" list for departments (Lab/Radiology)
- **Integration Ready:** Future link between Orders → Results for complete traceability
- **FHIR Compliant:** Enables future HL7 FHIR interoperability

**Negative:**

- **Data Entry:** Increases administrative burden on doctors (mitigated by good UI later)
- **Complexity:** Adds another entity to the domain model

## API Endpoints

| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/api/v1/orders/orders/` | IsMedicalStaff |
| POST | `/api/v1/orders/orders/` | IsMedicalStaff |
| GET | `/api/v1/orders/orders/{id}/` | IsMedicalStaff |
| POST | `/api/v1/orders/orders/{id}/cancel/` | IsMedicalStaff |
| POST | `/api/v1/orders/orders/{id}/complete/` | IsMedicalStaff |

## References

- [FHIR ServiceRequest](https://www.hl7.org/fhir/servicerequest.html)
- [HL7 Order Entry](https://www.hl7.org/implement/standards/product_brief.cfm?product_id=185)
