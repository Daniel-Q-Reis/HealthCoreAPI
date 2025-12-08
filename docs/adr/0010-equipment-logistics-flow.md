# ADR-0010: Equipment Flow and Logistics Module

**Status:** Accepted
**Date:** 12/07/2025

## Context

Hospitals require strict tracking of mobile assets. Unauthorized access to equipment status or location data poses operational risks. We need to implement asset tracking with strict Role-Based Access Control (RBAC).

## Decision

We will implement the `equipment` context with the following security constraints:

**Security (RBAC):**
- **Read/Write Access:** Strictly limited to users in "Doctors" or "Nurses" groups (or Admin).
- **Public Access:** None.

**Key Components:**
1.  **Equipment Model:** Asset tracking (QR, Location, Status).
2.  **Movements & Incidents:** Immutable audit logs.
3.  **Service Layer:** Atomic state transitions.

## Consequences

**Positive:**
- **Security:** Prevents unauthorized personnel from tampering with equipment availability.
- **Safety:** Ensures only qualified staff can reserve or report incidents.

**Negative:**
- **Onboarding:** Staff must be correctly assigned to groups to use the system.
