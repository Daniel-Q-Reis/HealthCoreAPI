export interface Patient {
    id: number;
    mrn: string;
    given_name: string;
    family_name: string;
    birth_date: string;
    sex: 'male' | 'female' | 'other' | 'unknown';
    phone_number: string;
    email: string;
    blood_type?: string;
    is_active: boolean;
}

export interface CreatePatientPayload {
    given_name: string;
    family_name: string;
    birth_date: string;
    sex: 'male' | 'female' | 'other' | 'unknown';
    phone_number: string;
    blood_type?: string;
    // email is inferred from auth user
}
