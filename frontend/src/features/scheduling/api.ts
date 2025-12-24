import { apiClient as api } from '@/shared/api/config';
import { Practitioner, Slot, Appointment, BookingPayload } from './types';

// Helper to inject mock data for visual appeal
const enrichPractitioner = (p: Practitioner): Practitioner => ({
    ...p,
    image_url: `https://i.pravatar.cc/150?u=${p.id}`,
    rating: 4.5 + (p.id % 5) / 10, // Deterministic mock rating 4.5 - 5.0
    bio: `Experienced ${p.specialty || 'medical professional'} dedicated to patient care.`,
    languages: ['English', 'Spanish'],
    hospital_affiliation: 'UCLA Health Medical Center'
});

export const schedulingApi = {
    getPractitioners: async (search?: string): Promise<Practitioner[]> => {
        // Force server-side filtering by including 'doctor' in the search term.
        // This ensures the backend (PractitionerViewSet) returns actual doctors even if they are deep in the db.
        const term = search ? `${search} doctor` : 'doctor';

        // Request 1000 items as requested by user to ensure we capture all doctors
        const params = { search: term, limit: 1000, page_size: 1000 };
        const response = await api.get('/v1/practitioners/', { params });
        const data = response.data.results || response.data;

        const enriched = data.map(enrichPractitioner);

        // Client-side filter to show ONLY Doctors
        // Seed data uses 'doctor' (lowercase), so we need robust checking.
        return enriched.filter((p: Practitioner) => {
            if (!p.role) return false;
            const role = p.role.toLowerCase();
            return role.includes('doctor') ||
                role.includes('physician') ||
                role.includes('md') ||
                role.includes('dr.');
        });
    },

    getSlots: async (practitionerId: number): Promise<Slot[]> => {
        // In a real app, filtering by date range is essential
        // For MVP, getting all slots for the practitioner
        const response = await api.get('/v1/scheduling/slots/', {
            params: { practitioner: practitionerId, is_booked: false, limit: 1000, page_size: 1000 }
        });
        const allSlots = response.data.results || response.data;

        // CLIENT-SIDE FILTERING ADAPTER:
        // Since backend SlotViewSet might return all slots (due to missing filter backend),
        // we explicitly filter by practitioner ID here to ensure data correctness.
        return allSlots.filter((s: Slot) => s.practitioner === practitionerId);
    },

    createAppointment: async (payload: BookingPayload): Promise<Appointment> => {
        // Backend expects: { slot: id, notes: ... }
        // The backend AppointmentSerializer.create handles practitioner assignment
        const response = await api.post('/v1/scheduling/appointments/', {
            slot: payload.slot_id,
            notes: payload.notes || ''
        });
        return response.data;
    },

    getAppointments: async (): Promise<Appointment[]> => {
        const response = await api.get('/v1/scheduling/appointments/');
        return response.data.results || response.data;
    }
};
