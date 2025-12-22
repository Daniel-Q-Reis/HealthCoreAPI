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
        const params = search ? { search } : { limit: 100 };
        const response = await api.get('/v1/practitioners/', { params });
        const data = response.data.results || response.data;
        return data.map(enrichPractitioner);
    },

    getSlots: async (practitionerId: number): Promise<Slot[]> => {
        // In a real app, filtering by date range is essential
        // For MVP, getting all slots for the practitioner
        const response = await api.get('/v1/scheduling/slots/', {
            params: { practitioner: practitionerId, is_booked: false }
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
