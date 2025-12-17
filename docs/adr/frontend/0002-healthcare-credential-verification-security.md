# ADR-0002: Healthcare Credential Verification and Security Model

**Status:** Accepted
**Date:** 2025-12-16
**Deciders:** Daniel Q. Reis, Development Team
**Technical Story:** Secure authentication and role-based access control for healthcare professionals

---

## Context and Problem Statement

Healthcare applications handle sensitive patient data (PHI/ePHI) and must comply with strict regulations (HIPAA, LGPD). A critical security concern is preventing unauthorized users from self-assigning elevated roles (Doctor, Nurse, Pharmacist) that grant access to protected health information.

**Key Questions:**
1. How do we prevent users from self-proclaiming medical credentials?
2. How do we verify healthcare professional credentials securely?
3. How do we maintain HIPAA compliance throughout the authentication process?
4. How do we create an audit trail for all role assignments?

---

## Decision Drivers

### Regulatory Compliance
- **HIPAA § 164.308(a)(4):** Access Control - Implement policies to limit access to ePHI
- **HIPAA § 164.312(a)(1):** Unique User Identification - Assign unique identifiers
- **HIPAA § 164.312(b):** Audit Controls - Record and examine access to ePHI
- **HIPAA § 164.312(d):** Person or Entity Authentication - Verify identity before access
- **LGPD:** Data minimization and access control principles

### Security Requirements
- **Principle of Least Privilege:** Users start with minimum permissions
- **Defense in Depth:** Multiple layers of security controls
- **Separation of Duties:** Admin approval required for role elevation
- **Audit Trail:** Complete logging of all security events

### User Experience
- **Simple Registration:** Easy for patients to sign up
- **Professional Onboarding:** Clear process for healthcare staff
- **Admin Efficiency:** Streamlined approval workflow

---

## Considered Options

### Option 1: Self-Service Role Selection ❌
Users select their role during registration.

**Pros:**
- Fast onboarding
- No admin overhead

**Cons:**
- ❌ **CRITICAL SECURITY FLAW:** Anyone can claim to be a doctor
- ❌ HIPAA violation (§ 164.308(a)(4))
- ❌ Legal liability
- ❌ Patient safety risk
- ❌ No credential verification

**Verdict:** **REJECTED** - Unacceptable security risk

---

### Option 2: Email Domain Verification
Verify role based on email domain (e.g., @hospital.com = Doctor).

**Pros:**
- Automated verification
- No manual review

**Cons:**
- ❌ Easy to spoof email domains
- ❌ Doesn't verify actual credentials
- ❌ Doesn't work for independent practitioners
- ❌ Still vulnerable to impersonation

**Verdict:** **REJECTED** - Insufficient verification

---

### Option 3: Multi-Step Credential Verification ✅ **SELECTED**
Admin-approved workflow with document verification.

**Pros:**
- ✅ **Secure:** Admin verification prevents self-assignment
- ✅ **Compliant:** Meets HIPAA requirements
- ✅ **Auditable:** Complete trail of all approvals
- ✅ **Flexible:** Supports manual and automated verification
- ✅ **Scalable:** Can integrate with verification APIs later

**Cons:**
- Requires admin time for review
- Slower onboarding for professionals

**Verdict:** **ACCEPTED** - Best balance of security and usability

---

## Decision Outcome

**Chosen Option:** Multi-Step Credential Verification with Admin Approval

---

## Implementation Details

### Phase 1: Default Deny (Immediate)

**Principle:** All users start with minimum privileges.

```typescript
// Default role assignment
const newUser = {
  username: 'john.doe',
  email: 'john@example.com',
  role: 'Patients',  // ✅ Default role
  permissions: [
    'view_own_appointments',
    'add_feedback'
  ]
};
```

**Security Controls:**
- ✅ No role selection during registration
- ✅ All new users assigned `PATIENT` role
- ✅ No self-service role elevation
- ✅ Explicit admin approval required

---

### Phase 2: Professional Role Request

**Workflow:**
1. User registers (becomes PATIENT)
2. User navigates to "Request Professional Access"
3. User fills form with credentials
4. User uploads verification documents
5. System creates pending request
6. User receives confirmation email

**Required Information:**
- Role requested (Doctor, Nurse, Pharmacist)
- Professional license number
- License state/country
- Specialty (for doctors)
- Employment verification

**Required Documents:**
- Medical/Nursing/Pharmacy license (PDF/Image)
- Board certification (if applicable)
- Professional ID
- Employment verification letter

**API Endpoint:**
```typescript
POST /api/v1/auth/request-professional-role/
{
  "role": "Doctors",
  "license_number": "MD123456",
  "license_state": "CA",
  "specialty": "Cardiology",
  "documents": {
    "license": "base64_encoded_pdf",
    "certification": "base64_encoded_pdf",
    "employment": "base64_encoded_pdf"
  },
  "reason": "I am a licensed cardiologist at UCLA Health..."
}

Response:
{
  "request_id": "uuid",
  "status": "pending",
  "message": "Your request has been submitted for review",
  "estimated_review_time": "24-48 hours"
}
```

**Security Features:**
- ✅ Encrypted document storage (S3/Azure Blob with encryption)
- ✅ File type validation (PDF, JPEG, PNG only)
- ✅ File size limits (max 10MB per document)
- ✅ Virus scanning on upload
- ✅ Request rate limiting (1 request per user per 24 hours)

---

### Phase 3: Admin Verification Dashboard

**Admin Interface:**
- View all pending requests
- Filter by role, date, status
- View uploaded documents securely
- Verify license numbers (manual or API)
- Approve/Reject with detailed notes
- View audit history

**Verification Checklist:**
- [ ] License number matches state database
- [ ] License is active and not expired
- [ ] No disciplinary actions on record
- [ ] Employment verification is valid
- [ ] Documents are authentic (not altered)
- [ ] Specialty matches license type

**API Endpoints:**
```typescript
// List pending requests
GET /api/v1/admin/credential-requests/
Response: [
  {
    "id": "uuid",
    "user": {
      "id": 123,
      "name": "Dr. John Doe",
      "email": "john@example.com"
    },
    "role_requested": "Doctors",
    "license_number": "MD123456",
    "license_state": "CA",
    "specialty": "Cardiology",
    "documents": {
      "license": "https://secure-url/license.pdf",
      "certification": "https://secure-url/cert.pdf"
    },
    "status": "pending",
    "submitted_at": "2025-12-16T10:00:00Z"
  }
]

// Approve request
POST /api/v1/admin/credential-requests/{id}/approve/
{
  "notes": "License MD123456 verified with CA Medical Board. Active until 2026-12-31. No disciplinary actions."
}

// Reject request
POST /api/v1/admin/credential-requests/{id}/reject/
{
  "reason": "License number MD123456 not found in CA Medical Board database. Please verify and resubmit."
}
```

**Security Controls:**
- ✅ Only users with `IsAdmin` permission can access
- ✅ All actions logged with admin user ID
- ✅ Secure document viewing (time-limited URLs)
- ✅ Two-factor authentication required for approvals
- ✅ IP address logging for all admin actions

---

### Phase 4: Audit Trail

**Complete Logging:**
Every security event is logged with:
- Event type
- User ID
- Timestamp
- IP address
- User agent
- Action details
- Result (success/failure)

**Logged Events:**
```typescript
// Registration
{
  "event": "USER_REGISTERED",
  "user_id": 123,
  "role_assigned": "Patients",
  "timestamp": "2025-12-16T10:00:00Z",
  "ip_address": "192.168.1.1"
}

// Role request submitted
{
  "event": "ROLE_REQUEST_SUBMITTED",
  "user_id": 123,
  "role_requested": "Doctors",
  "license_number": "MD123456",
  "timestamp": "2025-12-16T10:05:00Z",
  "ip_address": "192.168.1.1"
}

// Role request approved
{
  "event": "ROLE_REQUEST_APPROVED",
  "user_id": 123,
  "role_granted": "Doctors",
  "approved_by": 1,  // Admin user ID
  "approval_notes": "License verified",
  "timestamp": "2025-12-16T11:00:00Z",
  "ip_address": "10.0.0.5"  // Admin IP
}

// Role request rejected
{
  "event": "ROLE_REQUEST_REJECTED",
  "user_id": 123,
  "role_requested": "Doctors",
  "rejected_by": 1,
  "rejection_reason": "License not found",
  "timestamp": "2025-12-16T11:00:00Z",
  "ip_address": "10.0.0.5"
}

// Unauthorized access attempt
{
  "event": "UNAUTHORIZED_ACCESS_ATTEMPT",
  "user_id": 123,
  "attempted_resource": "/api/v1/patients/",
  "required_permission": "view_patient",
  "user_role": "Patients",
  "timestamp": "2025-12-16T12:00:00Z",
  "ip_address": "192.168.1.1"
}
```

**Audit Report Generation:**
- Daily summary of role requests
- Weekly security events report
- Monthly compliance report
- On-demand audit trail export

---

### Phase 5: Future - Automated Verification (Optional)

**Primary Source Verification APIs:**

**United States:**
- **NPPES NPI Registry:** Verify National Provider Identifier
- **State Medical Boards:** Verify medical licenses by state
- **ABMS:** American Board of Medical Specialties certification
- **Nursys:** Nursing license verification
- **NABP:** Pharmacy license verification

**International:**
- **Brazil CFM:** Conselho Federal de Medicina
- **UK GMC:** General Medical Council
- **EU:** National medical registries

**Example Integration:**
```typescript
// Future automated verification
async function verifyMedicalLicense(
  licenseNumber: string,
  state: string
): Promise<VerificationResult> {
  // Call state medical board API
  const response = await fetch(
    `https://api.medicalboard.${state}.gov/verify`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${API_KEY}` },
      body: JSON.stringify({ license_number: licenseNumber })
    }
  );

  const data = await response.json();

  return {
    valid: data.status === 'active',
    expiration_date: data.expiration,
    disciplinary_actions: data.actions,
    specialty: data.specialty
  };
}
```

**Benefits:**
- ✅ Instant verification (seconds vs hours)
- ✅ Reduced admin workload
- ✅ Higher accuracy
- ✅ Real-time license status
- ✅ Automated expiration monitoring

---

## Security Architecture

### Defense in Depth Layers

```
Layer 1: Default Deny
  ↓ All users start as PATIENT

Layer 2: Request Validation
  ↓ Form validation, document upload

Layer 3: Admin Review
  ↓ Manual verification, document review

Layer 4: Primary Source Verification (Future)
  ↓ Automated API verification

Layer 5: Continuous Monitoring
  ↓ License expiration alerts, status changes

Layer 6: Audit Trail
  ↓ Complete logging of all events
```

---

## HIPAA Compliance Mapping

| HIPAA Requirement | Implementation |
|-------------------|----------------|
| **§ 164.308(a)(4) - Access Control** | Default PATIENT role, admin approval required |
| **§ 164.312(a)(1) - Unique User ID** | UUID for each user, unique username |
| **§ 164.312(b) - Audit Controls** | Complete audit trail with timestamps |
| **§ 164.312(d) - Authentication** | Multi-step credential verification |
| **§ 164.308(a)(3) - Workforce Security** | Role-based permissions, minimum necessary |
| **§ 164.310(d) - Device Controls** | IP logging, session management |

---

## Consequences

### Positive

- ✅ **HIPAA Compliant:** Meets all access control requirements
- ✅ **Secure:** Prevents unauthorized role elevation
- ✅ **Auditable:** Complete trail for compliance audits
- ✅ **Scalable:** Can add automated verification later
- ✅ **Flexible:** Supports multiple verification methods
- ✅ **Professional:** Industry-standard credential verification

### Negative

- ⚠️ **Admin Overhead:** Requires manual review initially
- ⚠️ **Slower Onboarding:** 24-48 hours for professional access
- ⚠️ **Storage Costs:** Document storage in encrypted blob storage

### Mitigation

- **Admin Dashboard:** Streamlined review process
- **Email Notifications:** Keep users informed of status
- **Future Automation:** Integrate verification APIs to reduce manual work
- **Document Retention:** Auto-delete after verification (90 days)

---

## Related Decisions

- **ADR-0001:** Feature-Sliced Design (frontend architecture)
- **Backend ADR-0008:** RBAC Implementation (permission classes)
- **Backend ADR:** HIPAA Compliance (to be created)

---

## References

- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/)
- [Primary Source Verification Best Practices](https://www.ncqa.org/)
- [Healthcare Credential Verification Standards](https://www.jointcommission.org/)
- [NPPES NPI Registry](https://npiregistry.cms.hhs.gov/)

---

## Notes

This security model was designed after:
- Analyzing 10+ healthcare authentication systems
- Researching HIPAA compliance requirements
- Consulting with healthcare security experts
- Reviewing credential verification best practices

The multi-step verification approach balances security, compliance, and user experience while providing a path to full automation in the future.
