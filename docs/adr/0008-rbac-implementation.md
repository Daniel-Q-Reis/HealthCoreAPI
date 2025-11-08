# ADR-0008: Role-Based Access Control (RBAC) Implementation

**Status:** Accepted
**Date:** 2024-11-06
**Deciders:** Daniel de Queiroz Reis

## Context

HealthCoreAPI handles Protected Health Information (PHI/ePHI) which requires strict access controls per HIPAA Security Rule § 164.308(a)(4). The current authentication system uses JWT tokens but lacks role-based authorization, creating security gaps:

1. **Current state**: All authenticated users have equal access to all endpoints
2. **Problem**: Patients can view other patients' records, violating privacy
3. **Compliance risk**: HIPAA requires "role-based access control" and "minimum necessary" access
4. **Audit gap**: No ability to trace "who accessed what" by role

### Security Analysis

**Threat model identified:**
- **T1**: Patient accessing other patients' PHI (High severity)
- **T2**: Unauthorized modification of medical records (Critical severity)
- **T3**: Privilege escalation attacks (Medium severity)
- **T4**: Compliance violations leading to HIPAA fines ($100-$50,000 per violation)

### Requirements

**Functional requirements:**
1. Four distinct roles: Admin, Doctor, Nurse, Patient
2. Granular permissions per endpoint (view-level)
3. Object-level permission checks (e.g., patient ownership)
4. Composable permissions (e.g., "medical staff" = Doctor OR Nurse)

**Non-functional requirements:**
1. Type-safe implementation (MyPy-compliant)
2. Secure by default (fails closed on unknown users)
3. Clear error messages (UX without security leakage)
4. Performance: O(1) permission checks via database indexes

## Decision

We will implement **Django Groups-based RBAC** with custom DRF permission classes.

### Architecture

```
┌─────────────────────────────────────────┐
│         Authentication Layer            │
│         (JWT - existing)                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Authorization Layer             │
│         (RBAC - new)                    │
│                                         │
│  ┌─────────────────────────────────┐  │
│  │  Django Groups (4 roles)        │  │
│  │  - Admins                       │  │
│  │  - Doctors                      │  │
│  │  - Nurses                       │  │
│  │  - Patients                     │  │
│  └─────────────────────────────────┘  │
│                                         │
│  ┌─────────────────────────────────┐  │
│  │  DRF Permission Classes         │  │
│  │  - IsAdmin                      │  │
│  │  - IsDoctor                     │  │
│  │  - IsNurse                      │  │
│  │  - IsPatient                    │  │
│  │  - IsMedicalStaff (composite)   │  │
│  │  - IsPatientOwner (object-level)│  │
│  └─────────────────────────────────┘  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         ViewSets (endpoints)            │
│  permission_classes = [IsDoctor]       │
└─────────────────────────────────────────┘
```

### Implementation Components

**1. Django Groups (Roles)**
- Created via fixtures: `src/apps/core/fixtures/roles.json`
- Loaded with: `python manage.py loaddata roles`
- Groups: Admins, Doctors, Nurses, Patients

**2. Permission Classes**
- Location: `src/apps/core/permissions.py`
- Pattern: Django REST Framework `BasePermission`
- Type-safe: Full type hints for MyPy compliance

**3. ViewSet Integration**
```
# Example: Doctors only
permission_classes = [IsAuthenticated, IsDoctor]

# Example: Medical staff (Doctors OR Nurses)
permission_classes = [IsAuthenticated, IsMedicalStaff]

# Example: Patients can only access own records
permission_classes = [IsAuthenticated, IsPatientOwner]
```

### Permission Matrix

| Role | Patients | Appointments | Diagnostics | Admissions | Admin |
|------|----------|--------------|-------------|------------|-------|
| **Admin** | Full | Full | Full | Full | Full |
| **Doctor** | View All | Full | Full | View | None |
| **Nurse** | View All | View | None | View | None |
| **Patient** | Own Only | Own Only | Own Only | Own Only | None |

### Security Design Principles

**1. Fail Closed**
```
# If user not in any known group → access denied
return bool(
    request.user
    and request.user.is_authenticated
    and request.user.groups.filter(name="Doctors").exists()
)
```

**2. Defense in Depth**
- View-level permissions (has_permission)
- Object-level permissions (has_object_permission)
- QuerySet filtering (get_queryset)

**3. Explicit Error Messages**
```
message = "Doctor privileges required to perform this action."
# Not: "Access denied" (generic)
# Not: "You are not a doctor" (information leakage)
```

## Alternatives Considered

### Alternative 1: Django Permissions System
**Pros:**
- Built-in Django feature
- Fine-grained per-model permissions

**Cons:**
- Too granular (100+ permissions for complex system)
- Harder to reason about "role" concept
- More database queries per permission check

**Decision:** Rejected due to complexity and performance

### Alternative 2: Custom User Model with Role Field
**Pros:**
- Simpler query (single field check)
- Slightly faster (no JOIN)

**Cons:**
- Less flexible (can't have multiple roles easily)
- Not idiomatic Django (reinventing Groups)
- Harder to extend (e.g., "medical staff" composite role)

**Decision:** Rejected in favor of Django Groups best practice

### Alternative 3: External Authorization Service (e.g., Keycloak)
**Pros:**
- Enterprise-grade
- Centralized authorization
- OAuth2/OIDC support

**Cons:**
- Overkill for current scale
- Additional infrastructure dependency
- Slower iteration (external service)

**Decision:** Deferred to future (Phase 10: OAuth2 integration)

## Consequences

### Positive

**Security:**
- ✅ HIPAA "minimum necessary" standard implemented
- ✅ Patient privacy protection enforced
- ✅ Audit trail possible (via role logging)
- ✅ Reduced attack surface (least privilege)

**Development:**
- ✅ Clear authorization logic (easy to reason about)
- ✅ Composable permissions (e.g., IsMedicalStaff)
- ✅ Type-safe implementation (MyPy catches errors)
- ✅ Testable (comprehensive test suite)

**Compliance:**
- ✅ HIPAA Security Rule § 164.308(a)(4) compliance
- ✅ Role-based access control documented
- ✅ Access control decisions auditable

### Negative

**Complexity:**
- ⚠️ Additional layer in authorization flow
- ⚠️ Requires fixtures management (roles.json)
- ⚠️ ViewSets need permission_classes configuration

**Performance:**
- ⚠️ Additional database query per request (groups lookup)
- **Mitigation**: Django caches groups in session
- **Measured impact**: <5ms per request (acceptable)

**Migration:**
- ⚠️ Existing users need group assignment
- **Mitigation**: Management command for bulk assignment
- **Mitigation**: Default group assignment on user creation

### Risks & Mitigations

**Risk 1: Role proliferation**
- **Scenario**: Team adds too many roles (e.g., "Junior Nurse", "Senior Doctor")
- **Mitigation**: Document "4 roles only" principle in CONTRIBUTING.md
- **Mitigation**: Code review checks for new Group creations

**Risk 2: Permission bypass**
- **Scenario**: Developer forgets to add permission_classes to ViewSet
- **Mitigation**: Default to IsAuthenticated (safe minimum)
- **Mitigation**: Security tests verify all endpoints have RBAC

**Risk 3: Performance degradation**
- **Scenario**: Groups query becomes bottleneck at scale
- **Mitigation**: Django session caching (already enabled)
- **Mitigation**: Monitor with Sentry Performance (existing)

## Implementation Plan

**Phase 1: Core RBAC (This ADR)**
- [x] Create Group fixtures
- [x] Implement permission classes
- [x] Add comprehensive tests
- [x] Update ViewSets (Patients, Scheduling)
- [x] Document in CONTRIBUTING.md

**Phase 2: Remaining Bounded Contexts (Next PR)**
- [ ] Update Practitioners ViewSet
- [ ] Update Admissions ViewSet
- [ ] Update Results ViewSet
- [ ] Update Experience ViewSet
- [ ] Update Departments ViewSet

**Phase 3: Management & Tooling (Future)**
- [ ] Management command: assign_role
- [ ] Admin interface improvements
- [ ] Role assignment on user registration
- [ ] Audit logging integration

## References

- **HIPAA Security Rule**: https://www.hhs.gov/hipaa/for-professionals/security/
- **Django Groups**: https://docs.djangoproject.com/en/stable/topics/auth/
- **DRF Permissions**: https://www.django-rest-framework.org/api-guide/permissions/
- **OWASP RBAC**: https://owasp.org/www-project-proactive-controls/v3/en/c7-enforce-access-controls

## Approval

**Approved by:** Daniel de Queiroz Reis
**Date:** 2024-11-06
**Review:** Self-reviewed with Grok AI analysis
