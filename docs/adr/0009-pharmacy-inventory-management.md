# ADR-0009: Pharmacy and Inventory Management Module

**Status:** Accepted
**Date:** 12/06/2025

## Context

A hospital management system requires strict control over medication inventory to ensure patient safety and operational efficiency. We need to track medication details (brand, SKU, expiry), monitor stock levels with specific alert thresholds, and maintain an immutable audit log of which practitioner dispensed which medication to which patient.

## Decision

We will implement a new bounded context `pharmacy` within the monolith.

**Key Components:**
1.  **Medication Model:** Represents the inventory item. Fields: Name, Brand, SKU, Batch Number, Expiry Date, Quantity, Description.
2.  **Dispensation Model:** Represents the transactional event of using a medication. It links `Medication`, `Patient`, and `Practitioner`.
3.  **Business Logic (Service Layer):**
    - **Stock Deduction:** Dispensing strictly reduces stock. Atomic transactions are required.
    - **Threshold Alerts:** logic to log warnings when stock drops below 50 and 25 units.
    - **Validation:** Prevent dispensing expired medications or if stock is insufficient.
4.  **Security (RBAC):** Access to dispense medications is strictly limited to users with `IsMedicalStaff` permission (Doctors and Nurses).

## Consequences

**Positive:**
- **Patient Safety:** Prevents usage of expired drugs and ensures traceability.
- **Operational Control:** Automated visibility into low stock levels.
- **Compliance:** Full audit trail of controlled substance usage.

**Negative:**
- **Complexity:** Managing inventory concurrency requires careful transaction management.
