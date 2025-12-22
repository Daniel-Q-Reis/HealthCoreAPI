export interface Patient {
    id: number;
    given_name: string;
    family_name: string;
    mrn: string;
    birth_date: string;
}

export interface Practitioner {
    id: number;
    given_name: string;
    family_name: string;
    specialization: string;
    license_number: string;
    user_id: number;
}

export interface Medication {
    id: number;
    name: string;
    brand: string;
    sku: string;
    description: string;
    batch_number: string;
    expiry_date: string;
    stock_quantity: number;
    is_active: boolean;
}

export interface Dispensation {
    id: number;
    medication: number;
    patient: number;
    practitioner: number;
    quantity: number;
    notes: string;
    dispensed_at: string;
}

export interface CreateDispensationPayload {
    medication_id: number;
    patient_id: number;
    practitioner_id: number;
    quantity: number;
    notes?: string;
}

export interface DrugInfoResponse {
    medication_name: string;
    information: string;
    model_used: string;
}

export interface DrugInfoRequest {
    medication_name: string;
    patient_context?: string;
}
