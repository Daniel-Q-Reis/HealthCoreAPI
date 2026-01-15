export interface Practitioner {
    id: number;
    user_id: number;
    given_name: string;
    family_name: string;
    license_number: string;
    role: string;
    specialty: string;
    // Mock fields for UI
    image_url?: string;
    rating?: number;
    bio?: string;
    languages?: string[];
    hospital_affiliation?: string;
}

export interface Slot {
    id: number;
    practitioner: number;
    start_time: string;
    end_time: string;
    is_booked: boolean;
}

export interface Appointment {
    id: number;
    patient: number;
    practitioner: number;
    slot: number | Slot;
    status: 'booked' | 'cancelled' | 'completed';
    notes: string;
}

export interface BookingPayload {
    slot_id: number;
    notes?: string;
}
