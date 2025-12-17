# HealthCoreAPI - API Endpoints Documentation

## Base URL
```
Development: http://localhost:8000
Production: https://your-domain.com
```

## Authentication

### JWT Token Authentication
```http
POST /api/v1/token/
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "password123"
}

Response:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Refresh Token
```http
POST /api/v1/token/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Professional Role Request (Credential Verification)

**Request Professional Role** - Submit credentials for role elevation
```http
POST /api/auth/request-professional-role/
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

Form Data:
- role_requested: "Doctors" | "Nurses" | "Pharmacists" | "Receptionists"
- license_number: string (e.g., "MD123456")
- license_state: string (e.g., "CA")
- specialty: string (optional, for doctors - e.g., "Cardiology")
- reason: string (explanation for request)
- license_document: file (PDF/Image, max 10MB) - Required
- certification_document: file (PDF/Image, max 10MB) - Optional
- employment_verification: file (PDF/Image, max 10MB) - Optional

Response (201 Created):
{
  "id": 1,
  "user": 123,
  "user_details": {
    "id": 123,
    "username": "john.doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe"
  },
  "role_requested": "Doctors",
  "license_number": "MD123456",
  "license_state": "CA",
  "specialty": "Cardiology",
  "reason": "Licensed cardiologist at UCLA Health",
  "license_document": "/media/credentials/licenses/license_123.pdf",
  "certification_document": "/media/credentials/certs/cert_123.pdf",
  "employment_verification": "/media/credentials/employment/emp_123.pdf",
  "status": "pending",
  "reviewed_by": null,
  "reviewer_details": null,
  "reviewed_at": null,
  "review_notes": "",
  "created_at": "2025-12-17T09:00:00Z",
  "updated_at": "2025-12-17T09:00:00Z"
}
```

**List Role Requests** - Admin only, view all credential requests
```http
GET /api/admin/credential-requests/?status=pending
Authorization: Bearer {admin_access_token}

Query Parameters:
- status: "pending" | "approved" | "rejected" (default: "pending")

Response (200 OK):
[
  {
    "id": 1,
    "user": 123,
    "user_details": {
      "id": 123,
      "username": "john.doe",
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "full_name": "John Doe"
    },
    "role_requested": "Doctors",
    "license_number": "MD123456",
    "license_state": "CA",
    "specialty": "Cardiology",
    "reason": "Licensed cardiologist at UCLA Health",
    "license_document": "/media/credentials/licenses/license_123.pdf",
    "status": "pending",
    "created_at": "2025-12-17T09:00:00Z"
  }
]

Permissions: Requires IsAdmin
```

**Approve Role Request** - Admin only, grant professional role
```http
POST /api/admin/credential-requests/{request_id}/approve/
Authorization: Bearer {admin_access_token}
Content-Type: application/json

{
  "notes": "License MD123456 verified with CA Medical Board. Active until 2026-12-31. No disciplinary actions."
}

Response (200 OK):
{
  "status": "approved",
  "message": "Role granted successfully",
  "user": "john.doe",
  "role": "Doctors"
}

Side Effects:
- User is added to the requested Django group (Doctors, Nurses, etc.)
- Request status updated to "approved"
- Reviewer and timestamp recorded
- Audit log entry created

Permissions: Requires IsAdmin
```

**Reject Role Request** - Admin only, reject credential request
```http
POST /api/admin/credential-requests/{request_id}/reject/
Authorization: Bearer {admin_access_token}
Content-Type: application/json

{
  "reason": "License number MD123456 not found in CA Medical Board database. Please verify and resubmit."
}

Response (200 OK):
{
  "status": "rejected",
  "message": "Request rejected",
  "user": "john.doe",
  "role": "Doctors"
}

Side Effects:
- Request status updated to "rejected"
- Reviewer and timestamp recorded
- Rejection reason stored
- Audit log entry created

Permissions: Requires IsAdmin
```

**Security Features:**
- Default deny: All users start as "Patients" role
- File validation: PDF/Image only, max 10MB per file
- Admin approval required for all role elevations
- Complete audit trail with timestamps and reviewer information
- HIPAA compliance: § 164.308(a)(4), § 164.312(b), § 164.312(d)

---

## Core Endpoints

### Health Check
```http
GET /health/
```

### Posts (News/Updates)
```http
GET    /api/v1/posts/              # List all posts
POST   /api/v1/posts/              # Create post
GET    /api/v1/posts/{id}/         # Get post details
PUT    /api/v1/posts/{id}/         # Update post
PATCH  /api/v1/posts/{id}/         # Partial update
DELETE /api/v1/posts/{id}/         # Delete post
```

---

## Patient Management

### Patients
```http
GET    /api/v1/patients/           # List all patients
POST   /api/v1/patients/           # Register new patient
GET    /api/v1/patients/{id}/      # Get patient details
PUT    /api/v1/patients/{id}/      # Update patient
PATCH  /api/v1/patients/{id}/      # Partial update
DELETE /api/v1/patients/{id}/      # Soft delete patient
```

**Example Request**:
```json
POST /api/v1/patients/
{
  "first_name": "John",
  "last_name": "Doe",
  "date_of_birth": "1990-01-15",
  "gender": "M",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "address": "123 Main St, City, State 12345"
}
```

---

## Practitioner Management

### Practitioners (Doctors/Staff)
```http
GET    /api/v1/practitioners/      # List all practitioners
POST   /api/v1/practitioners/      # Create practitioner
GET    /api/v1/practitioners/{id}/ # Get practitioner details
PUT    /api/v1/practitioners/{id}/ # Update practitioner
PATCH  /api/v1/practitioners/{id}/ # Partial update
DELETE /api/v1/practitioners/{id}/ # Soft delete
```

**Example Request**:
```json
POST /api/v1/practitioners/
{
  "first_name": "Dr. Jane",
  "last_name": "Smith",
  "specialty": "Cardiology",
  "license_number": "MD12345",
  "email": "dr.smith@hospital.com",
  "phone": "+1234567890"
}
```

---

## Scheduling

### Appointments
```http
GET    /api/v1/scheduling/appointments/           # List appointments
POST   /api/v1/scheduling/appointments/           # Book appointment
GET    /api/v1/scheduling/appointments/{id}/      # Get details
PUT    /api/v1/scheduling/appointments/{id}/      # Update
PATCH  /api/v1/scheduling/appointments/{id}/      # Partial update
DELETE /api/v1/scheduling/appointments/{id}/      # Cancel appointment
```

**Example Request**:
```json
POST /api/v1/scheduling/appointments/
{
  "patient": 1,
  "practitioner": 2,
  "slot": 5,
  "appointment_type": "consultation",
  "notes": "Follow-up for previous treatment"
}
```

### Slots (Available Time Slots)
```http
GET    /api/v1/scheduling/slots/           # List available slots
POST   /api/v1/scheduling/slots/           # Create slot
GET    /api/v1/scheduling/slots/{id}/      # Get slot details
PUT    /api/v1/scheduling/slots/{id}/      # Update slot
DELETE /api/v1/scheduling/slots/{id}/      # Delete slot
```

---

## Admissions

### Admissions
```http
GET    /api/v1/admissions/admissions/      # List admissions
POST   /api/v1/admissions/admissions/      # Create admission
GET    /api/v1/admissions/admissions/{id}/ # Get details
PUT    /api/v1/admissions/admissions/{id}/ # Update
DELETE /api/v1/admissions/admissions/{id}/ # Discharge
```

### Beds
```http
GET    /api/v1/admissions/beds/            # List beds
POST   /api/v1/admissions/beds/            # Create bed
GET    /api/v1/admissions/beds/{id}/       # Get bed details
PUT    /api/v1/admissions/beds/{id}/       # Update bed
DELETE /api/v1/admissions/beds/{id}/       # Delete bed
```

### Wards
```http
GET    /api/v1/admissions/wards/           # List wards
POST   /api/v1/admissions/wards/           # Create ward
GET    /api/v1/admissions/wards/{id}/      # Get ward details
PUT    /api/v1/admissions/wards/{id}/      # Update ward
DELETE /api/v1/admissions/wards/{id}/      # Delete ward
```

---

## Diagnostic Results

### Reports
```http
GET    /api/v1/results/reports/            # List reports
POST   /api/v1/results/reports/            # Create report
GET    /api/v1/results/reports/{id}/       # Get report details
PUT    /api/v1/results/reports/{id}/       # Update report
DELETE /api/v1/results/reports/{id}/       # Delete report
```

**Example Request**:
```json
POST /api/v1/results/reports/
{
  "patient": 1,
  "report_type": "blood_test",
  "observations": [
    {
      "code": "glucose",
      "value": "95",
      "unit": "mg/dL",
      "reference_range": "70-100"
    }
  ]
}
```

---

## Staff Management

### Shifts
```http
GET    /api/v1/staff/shifts/               # List shifts
POST   /api/v1/staff/shifts/               # Create shift
GET    /api/v1/staff/shifts/{id}/          # Get shift details
PUT    /api/v1/staff/shifts/{id}/          # Update shift
DELETE /api/v1/staff/shifts/{id}/          # Delete shift
```

---

## Patient Experience

### Feedback
```http
GET    /api/v1/experience/feedback/        # List feedback
POST   /api/v1/experience/feedback/        # Submit feedback
GET    /api/v1/experience/feedback/{id}/   # Get feedback details
PUT    /api/v1/experience/feedback/{id}/   # Update feedback
DELETE /api/v1/experience/feedback/{id}/   # Delete feedback
```

**Example Request**:
```json
POST /api/v1/experience/feedback/
{
  "patient": 1,
  "rating": 5,
  "feedback_text": "Excellent service and care!",
  "category": "general"
}
```

### Complaints
```http
GET    /api/v1/experience/complaints/      # List complaints
POST   /api/v1/experience/complaints/      # Submit complaint
GET    /api/v1/experience/complaints/{id}/ # Get complaint details
PUT    /api/v1/experience/complaints/{id}/ # Update complaint
DELETE /api/v1/experience/complaints/{id}/ # Delete complaint
```

### AI-Powered Feedback Analysis
```http
POST   /api/v1/experience/ai-feedback-analysis/

Request:
{
  "feedback_text": "The staff was very helpful and the facilities were clean.",
  "rating": 5
}

Response:
{
  "sentiment": "positive",
  "key_themes": ["staff quality", "cleanliness"],
  "actionable_insights": "Continue maintaining high standards...",
  "priority_level": "low"
}
```

---

## Hospital Organization

### Departments
```http
GET    /api/v1/hospital/departments/       # List departments
POST   /api/v1/hospital/departments/       # Create department
GET    /api/v1/hospital/departments/{id}/  # Get details
PUT    /api/v1/hospital/departments/{id}/  # Update department
DELETE /api/v1/hospital/departments/{id}/  # Delete department
```

---

## Pharmacy

### Medications
```http
GET    /api/v1/pharmacy/medications/       # List medications
POST   /api/v1/pharmacy/medications/       # Create medication
GET    /api/v1/pharmacy/medications/{id}/  # Get details
PUT    /api/v1/pharmacy/medications/{id}/  # Update medication
DELETE /api/v1/pharmacy/medications/{id}/  # Delete medication
```

### Dispensations
```http
GET    /api/v1/pharmacy/dispensations/     # List dispensations
POST   /api/v1/pharmacy/dispensations/     # Create dispensation
GET    /api/v1/pharmacy/dispensations/{id}/ # Get details
PUT    /api/v1/pharmacy/dispensations/{id}/ # Update
DELETE /api/v1/pharmacy/dispensations/{id}/ # Delete
```

### AI-Powered Drug Information
```http
POST   /api/v1/pharmacy/ai-drug-info/

Request:
{
  "medication_names": ["Aspirin", "Warfarin"],
  "patient_context": {
    "age": 65,
    "conditions": ["hypertension"]
  }
}

Response:
{
  "drug_interactions": "CRITICAL: Aspirin + Warfarin increases bleeding risk...",
  "dosage_recommendations": "Consider reducing warfarin dosage...",
  "contraindications": "Monitor INR levels closely...",
  "safety_warnings": ["Increased bleeding risk", "Requires monitoring"]
}
```

---

## Equipment Management

### Equipment
```http
GET    /api/v1/equipment/equipment/        # List equipment
POST   /api/v1/equipment/equipment/        # Create equipment
GET    /api/v1/equipment/equipment/{id}/   # Get details
PUT    /api/v1/equipment/equipment/{id}/   # Update equipment
DELETE /api/v1/equipment/equipment/{id}/   # Delete equipment
```

---

## Clinical Orders

### Orders
```http
GET    /api/v1/orders/orders/              # List orders
POST   /api/v1/orders/orders/              # Create order
GET    /api/v1/orders/orders/{id}/         # Get order details
PUT    /api/v1/orders/orders/{id}/         # Update order
DELETE /api/v1/orders/orders/{id}/         # Delete order
```

---

## API Documentation

### Interactive API Docs
```http
GET /api/docs/          # Swagger UI
GET /api/redoc/         # ReDoc
GET /api/schema/        # OpenAPI Schema (JSON)
```

---

## Metrics & Monitoring

### Prometheus Metrics
```http
GET /metrics            # Prometheus metrics endpoint
```

---

## Common Query Parameters

### Pagination
```http
GET /api/v1/patients/?page=1&page_size=20
```

### Filtering
```http
GET /api/v1/appointments/?patient=1
GET /api/v1/appointments/?practitioner=2
GET /api/v1/appointments/?date=2024-01-15
```

### Ordering
```http
GET /api/v1/patients/?ordering=-created_at
GET /api/v1/patients/?ordering=last_name
```

### Search
```http
GET /api/v1/patients/?search=John
GET /api/v1/practitioners/?search=cardiology
```

---

## Response Formats

### Success Response (200 OK)
```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### List Response (200 OK)
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/v1/patients/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe"
    }
  ]
}
```

### Error Response (400 Bad Request)
```json
{
  "field_name": [
    "This field is required."
  ]
}
```

### Error Response (401 Unauthorized)
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### Error Response (404 Not Found)
```json
{
  "detail": "Not found."
}
```

---

## Rate Limiting

**AI Endpoints** (Gemini 2.5 Flash Free Tier):
- 5 requests/minute
- 20 requests/day
- Note: $300 credit available for extended testing

**Standard Endpoints**:
- No rate limiting (development)
- Production: TBD based on infrastructure

---

## CORS Configuration

Development allows all origins. Production should be configured with specific allowed origins.

---

## Notes

- All timestamps are in UTC
- All endpoints support soft deletes (records are marked as deleted, not removed)
- Authentication required for all endpoints except `/health/` and `/api/docs/`
- Use JWT tokens in Authorization header: `Authorization: Bearer <token>`
