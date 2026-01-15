import { apiClient } from './config';
import { parseApiError } from './errors';
import {
    Medication,
    CreateMedicationRequest,
    UpdateMedicationRequest,
    MedicationRecommendation,
    PaginatedResponse,
    SearchParams,
} from './types';

/**
 * Pharmacy API Client
 */
export const pharmacyApi = {
    /**
     * Get all medications
     */
    getAll: async (params?: SearchParams): Promise<PaginatedResponse<Medication>> => {
        try {
            const { data } = await apiClient.get<PaginatedResponse<Medication>>('/pharmacy/medications/', { params });
            return data;
        } catch (error) {
            throw parseApiError(error);
        }
    },

    /**
     * Get medication by ID
     */
    getById: async (id: string): Promise<Medication> => {
        try {
            const { data } = await apiClient.get<Medication>(`/pharmacy/medications/${id}/`);
            return data;
        } catch (error) {
            throw parseApiError(error);
        }
    },

    /**
     * Create new medication
     */
    create: async (medication: CreateMedicationRequest): Promise<Medication> => {
        try {
            const { data } = await apiClient.post<Medication>('/pharmacy/medications/', medication);
            return data;
        } catch (error) {
            throw parseApiError(error);
        }
    },

    /**
     * Update existing medication
     */
    update: async (id: string, medication: UpdateMedicationRequest): Promise<Medication> => {
        try {
            const { data } = await apiClient.patch<Medication>(`/pharmacy/medications/${id}/`, medication);
            return data;
        } catch (error) {
            throw parseApiError(error);
        }
    },

    /**
     * Delete medication
     */
    delete: async (id: string): Promise<void> => {
        try {
            await apiClient.delete(`/pharmacy/medications/${id}/`);
        } catch (error) {
            throw parseApiError(error);
        }
    },

    /**
     * Get AI medication recommendations for a patient
     */
    getRecommendations: async (patientId: string, symptoms: string): Promise<MedicationRecommendation[]> => {
        try {
            const { data } = await apiClient.post<MedicationRecommendation[]>(
                '/pharmacy/ai-recommendations/',
                { patient_id: patientId, symptoms }
            );
            return data;
        } catch (error) {
            throw parseApiError(error);
        }
    },
};
