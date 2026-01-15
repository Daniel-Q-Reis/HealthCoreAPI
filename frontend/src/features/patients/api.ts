import { apiClient } from '@/shared/api/config';
import { Patient, CreatePatientPayload } from './types';

export const patientApi = {
    getMyProfile: async (): Promise<Patient | null> => {
        try {
            const response = await apiClient.get('/v1/patients/me/');
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    },

    createMyProfile: async (data: CreatePatientPayload): Promise<Patient> => {
        const response = await apiClient.post('/v1/patients/me/', data);
        return response.data;
    }
};
