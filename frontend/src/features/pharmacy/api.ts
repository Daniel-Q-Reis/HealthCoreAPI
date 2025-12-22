import { apiClient as api } from '@/shared/api/config';
import {
    Medication,
    Patient,
    Practitioner,
    Dispensation,
    CreateDispensationPayload,
    DrugInfoRequest,
    DrugInfoResponse
} from './types';

export const pharmacyApi = {
    // Patients (Helper)
    getPatients: async (): Promise<Patient[]> => {
        const response = await api.get('/v1/patients/', { params: { limit: 1000 } });
        return response.data.results || response.data;
    },

    getPractitioners: async (): Promise<Practitioner[]> => {
        const response = await api.get('/v1/practitioners/', { params: { limit: 1000 } });
        return response.data.results || response.data;
    },

    // Inventory
    getMedications: async (): Promise<Medication[]> => {
        const response = await api.get('/v1/pharmacy/medications/');
        return response.data.results || response.data; // Handle pagination wrapper if present
    },

    getMedication: async (id: number): Promise<Medication> => {
        const response = await api.get(`/v1/pharmacy/medications/${id}/`);
        return response.data;
    },

    // Dispensations
    getDispensations: async (): Promise<Dispensation[]> => {
        const response = await api.get('/v1/pharmacy/dispensations/');
        return response.data.results || response.data;
    },

    createDispensation: async (data: CreateDispensationPayload): Promise<Dispensation> => {
        const response = await api.post('/v1/pharmacy/dispensations/', data);
        return response.data;
    },

    // AI Service
    getDrugInfo: async (data: DrugInfoRequest): Promise<DrugInfoResponse> => {
        const response = await api.post('/v1/pharmacy/ai/drug-info/', data);
        return response.data;
    }
};
