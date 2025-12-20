# Frontend Implementation Roadmap

This document outlines the phased plan for completing the HealthCoreAPI frontend. The strategy prioritizes modules with AI capabilities (`Pharmacy` and `Experience`) to demonstrate high-value features early, followed by the core clinical domains.

## 📅 Overview

- **Phase 1: AI-Enabled Modules (Pharmacy & Experience)** - *Current Priority*
- **Phase 2: Core Data Management (Patients & Practitioners)**
- **Phase 3: Clinical Operations (Admissions & Scheduling)**
- **Phase 4: Ancillary Services (Results, Orders, Equipment)**
- **Phase 5: Hospital Administration (Departments, Shifts)**

---

## 🚀 Phase 1: AI-Enabled Modules

### 1.1 Pharmacy Module (`/pharmacy`)
**Goal:** Manage medication inventory and dispensing with AI support.

- [ ] **Infrastructure**
    - [ ] Create `features/pharmacy/` structure (api, components, hooks, pages).
    - [ ] Define types/interfaces based on backend models (`Medication`, `Dispensation`).

- [ ] **Inventory Management**
    - [ ] **Medication List Page:** Data grid with search/filter by name, SKU, brand.
    - [ ] **Low Stock Alerts:** Visual indicators for items with low `stock_quantity`.
    - [ ] **Medication Detail View:** Show full specs, batch info, and expiry date.

- [ ] **Dispensing Interface**
    - [ ] **Dispensation Form:**
        - Fields: Select Medication, Select Patient (Search), Select Practitioner, Quantity, Notes.
    - [ ] **Validation:** Ensure quantity <= stock.

- [ ] **AI Feature: Drug Knowledge Base**
    - [ ] **Drug Info Component:** Interface to query `/api/pharmacy/ai/drug-info/`.
        - Input: Medication Name, Patient Context (optional).
        - Output: Structured display of interactions, dosages, side effects.

### 1.2 Experience Module (`/experience`)
**Goal:** Collect and analyze patient feedback using AI.

- [ ] **Infrastructure**
    - [ ] Create `features/experience/` structure.
    - [ ] Define types (`PatientFeedback`, `PatientComplaint`).

- [ ] **Patient Portals (User Facing)**
    - [ ] **Feedback Submission Form:**
        - Rating (1-5 stars), Comment text.
        - Optional: Link to current admission (if available).
    - [ ] **Complaint Submission Form:**
        - Category dropdown (Quality, Service, Billing, Other).
        - Description text.

- [ ] **Admin Dashboard (Staff Facing)**
    - [ ] **Feedback Review List:** Table showing recent feedback with ratings.
    - [ ] **Complaint Management:** Kanban or List view to track status (Open -> Investigating -> Resolved).

- [ ] **AI Feature: Sentiment & Insight Analysis**
    - [ ] **Analysis Widget:** Button on the Admin Dashboard to "Analyze Feedback".
    - [ ] **Visualization:** Call `/api/experience/ai/analyze/` and display:
        - Sentiment Score.
        - extracted Key Themes.
        - Actionable Insights suggested by AI.

---

## 🏥 Phase 2: Core Data Management

### 2.1 Patient Management (`/patients`)
**Goal:** Detailed patient records and demographics.

- [ ] **Patient Directory:** Advanced search (MRN, Name, DOB).
- [ ] **Patient Registration:** Comprehensive form for new patients.
- [ ] **Patient Profile (360 View):**
    - Tabs for: Demographics, History, Active Admissions, Prescriptions (Pharmacy link).

### 2.2 Practitioner Management (`/practitioners`)
**Goal:** Staff profiles and role management.

- [ ] **Practitioner Directory:** Filter by Role and Specialty.
- [ ] **Profile Management:** Edit contact info, license details.

---

## 🛌 Phase 3: Clinical Operations

### 3.1 Admissions (`/admissions`)
**Goal:** Bed management and patient intake.

- [ ] **Census View:** Dashboard of current occupancy.
- [ ] **Admission/Discharge Flows:** Forms to process patient movements.
- [ ] **Bed Management:** Visual map or list of Wards/Beds and their status.

### 3.2 Scheduling (`/scheduling`)
**Goal:** Appointment booking.

- [ ] **Calendar View:** Daily/Weekly view of appointments.
- [ ] **Booking Form:** Link Patient + Practitioner + Time + Department.

---

## 🔬 Phase 4: Ancillary Services

### 4.1 Results & Labs (`/results`)
- [ ] **Results Dashboard:** Inbox for new lab results.
- [ ] **Review Interface:** Graphing numeric results over time.

### 4.2 Clinical Orders (`/orders`)
- [ ] **Order Entry:** CPOE (Computerized Physician Order Entry) interface.

### 4.3 Equipment (`/equipment`)
- [ ] **Asset Tracking:** Track location and maintenance status of devices.

---

## ⚙️ Technical Strategy

### Data Contracts (Frontend <-> Backend)
To avoid integration issues, we will strictly type our API responses:

**Common Selectors:**
Since `Pharmacy` and `Experience` rely on Patients/Practitioners, we will create reusable **AsyncSelect components** in `shared/components/form/`:
- `PatientSelect`: Fetches from `/api/patients/` (Search by name/MRN).
- `PractitionerSelect`: Fetches from `/api/practitioners/`.

**AI Integration Pattern:**
AI features will be treated as "On-Demand" services.
- **Frontend:** User clicks "Analyze" or "Ask AI".
- **Interaction:** Async loading state -> API Call -> Render Result.
- **Data Persistence:** AI results are primarily for display; if persistence is needed, we will modify the backend to save the analysis to the record.

---

**Next Steps:**
1. Execute **Phase 1.1 (Pharmacy)**.
2. Execute **Phase 1.2 (Experience)**.
