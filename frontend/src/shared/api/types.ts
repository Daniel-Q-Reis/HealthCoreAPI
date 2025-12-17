// ============================================
// Common Types
// ============================================

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface ApiError {
    message: string;
    status: number;
    errors?: Record<string, string[]>;
}

// ============================================
// Auth Types
// ============================================

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    access: string;
    refresh: string;
    user: User;
}

export interface RefreshTokenRequest {
    refresh: string;
}

export interface RefreshTokenResponse {
    access: string;
}

export interface User {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_staff: boolean;
    is_active: boolean;
    groups: string[];  // User's groups (e.g., ['Patients'], ['Doctors', 'Admins'])
    role?: 'Admins' | 'Doctors' | 'Nurses' | 'Pharmacists' | 'Receptionists' | 'Patients';  // Primary role
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
}

export interface RegisterResponse {
    user: User;
    message: string;
}

// ============================================
// Professional Role Request Types (Credential Verification)
// ============================================

export interface UserDetails {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
}

export interface ProfessionalRoleRequest {
    id: number;
    user: number;
    user_details: UserDetails;
    role_requested: 'Doctors' | 'Nurses' | 'Pharmacists' | 'Receptionists';
    license_number: string;
    license_state: string;
    specialty?: string;
    reason: string;
    license_document: string;  // URL to uploaded document
    certification_document?: string;
    employment_verification?: string;
    status: 'pending' | 'approved' | 'rejected';
    reviewed_by?: number;
    reviewer_details?: UserDetails;
    reviewed_at?: string;
    review_notes?: string;
    created_at: string;
    updated_at: string;
}

export interface RequestProfessionalRolePayload {
    role_requested: 'Doctors' | 'Nurses' | 'Pharmacists' | 'Receptionists';
    license_number: string;
    license_state: string;
    specialty?: string;
    reason: string;
    license_document: File;
    certification_document?: File;
    employment_verification?: File;
}

// ============================================
// Patient Types
// ============================================

export interface Patient {
    id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: 'M' | 'F' | 'O';
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    medical_record_number: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    insurance_provider?: string;
    insurance_policy_number?: string;
    blood_type?: string;
    allergies?: string;
    created_at: string;
    updated_at: string;
}

export interface CreatePatientRequest extends Omit<Patient, 'id' | 'created_at' | 'updated_at' | 'medical_record_number'> { }

export interface UpdatePatientRequest extends Partial<CreatePatientRequest> { }

// ============================================
// Appointment Types
// ============================================

export interface Appointment {
    id: string;
    patient: string; // Patient ID
    practitioner: string; // Practitioner ID
    appointment_type: string;
    scheduled_start: string;
    scheduled_end: string;
    status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
    location: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateAppointmentRequest extends Omit<Appointment, 'id' | 'created_at' | 'updated_at'> { }

export interface UpdateAppointmentRequest extends Partial<CreateAppointmentRequest> { }

// ============================================
// Admission Types
// ============================================

export interface Admission {
    id: string;
    patient: string;
    admission_date: string;
    discharge_date?: string;
    admission_type: 'emergency' | 'elective' | 'urgent';
    status: 'admitted' | 'discharged' | 'transferred';
    room_number?: string;
    bed_number?: string;
    attending_physician: string;
    diagnosis?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateAdmissionRequest extends Omit<Admission, 'id' | 'created_at' | 'updated_at'> { }

export interface UpdateAdmissionRequest extends Partial<CreateAdmissionRequest> { }

// ============================================
// Diagnostic Result Types
// ============================================

export interface DiagnosticResult {
    id: string;
    patient: string;
    test_type: string;
    test_date: string;
    result_date: string;
    status: 'pending' | 'completed' | 'cancelled';
    result_value?: string;
    result_unit?: string;
    reference_range?: string;
    interpretation?: string;
    ordered_by: string;
    performed_by?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateDiagnosticResultRequest extends Omit<DiagnosticResult, 'id' | 'created_at' | 'updated_at'> { }

export interface UpdateDiagnosticResultRequest extends Partial<CreateDiagnosticResultRequest> { }

// ============================================
// Staff Types
// ============================================

export interface Staff {
    id: string;
    user: string;
    employee_id: string;
    department: string;
    position: string;
    specialization?: string;
    hire_date: string;
    phone: string;
    email: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateStaffRequest extends Omit<Staff, 'id' | 'created_at' | 'updated_at'> { }

export interface UpdateStaffRequest extends Partial<CreateStaffRequest> { }

// ============================================
// Patient Experience Types
// ============================================

export interface Feedback {
    id: string;
    patient: string;
    feedback_type: 'complaint' | 'suggestion' | 'compliment' | 'general';
    category: string;
    description: string;
    status: 'pending' | 'in_review' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assigned_to?: string;
    resolution?: string;
    ai_analysis?: string;
    sentiment_score?: number;
    created_at: string;
    updated_at: string;
}

export interface CreateFeedbackRequest extends Omit<Feedback, 'id' | 'created_at' | 'updated_at' | 'ai_analysis' | 'sentiment_score'> { }

export interface UpdateFeedbackRequest extends Partial<CreateFeedbackRequest> { }

// ============================================
// Pharmacy Types
// ============================================

export interface Medication {
    id: string;
    name: string;
    generic_name?: string;
    dosage: string;
    form: string;
    manufacturer?: string;
    ndc_code?: string;
    stock_quantity: number;
    reorder_level: number;
    unit_price: number;
    expiration_date?: string;
    storage_requirements?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateMedicationRequest extends Omit<Medication, 'id' | 'created_at' | 'updated_at'> { }

export interface UpdateMedicationRequest extends Partial<CreateMedicationRequest> { }

export interface MedicationRecommendation {
    medication: string;
    reason: string;
    confidence: number;
    alternatives?: string[];
}

// ============================================
// Equipment Types
// ============================================

export interface Equipment {
    id: string;
    name: string;
    equipment_type: string;
    serial_number: string;
    manufacturer?: string;
    model?: string;
    purchase_date?: string;
    warranty_expiration?: string;
    status: 'available' | 'in_use' | 'maintenance' | 'retired';
    location: string;
    last_maintenance_date?: string;
    next_maintenance_date?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateEquipmentRequest extends Omit<Equipment, 'id' | 'created_at' | 'updated_at'> { }

export interface UpdateEquipmentRequest extends Partial<CreateEquipmentRequest> { }

// ============================================
// Clinical Order Types
// ============================================

export interface ClinicalOrder {
    id: string;
    patient: string;
    order_type: 'medication' | 'lab' | 'imaging' | 'procedure' | 'consultation';
    description: string;
    ordered_by: string;
    ordered_date: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'routine' | 'urgent' | 'stat';
    scheduled_date?: string;
    completed_date?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateClinicalOrderRequest extends Omit<ClinicalOrder, 'id' | 'created_at' | 'updated_at'> { }

export interface UpdateClinicalOrderRequest extends Partial<CreateClinicalOrderRequest> { }

// ============================================
// Query Parameters
// ============================================

export interface PaginationParams {
    page?: number;
    page_size?: number;
}

export interface SearchParams extends PaginationParams {
    search?: string;
}

export interface FilterParams extends SearchParams {
    [key: string]: any;
}
