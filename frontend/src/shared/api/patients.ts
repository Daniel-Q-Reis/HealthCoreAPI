import { apiClient } from './config';
import { parseApiError } from './errors';
import {
    Patient,
    CreatePatientRequest,
    UpdatePatientRequest,
    PaginatedResponse,
    SearchParams,
} from './types';

/**
 * Patients API Client
 */
export const patientsApi = {
    /**
     * Get all patients with optional search and pagination
     */
    getAll: async (params?: SearchParams): Promise<PaginatedResponse<Patient>> => {
        try {
            const { data } = await apiClient.get<PaginatedResponse<Patient>>('/patients/', { params });
            return data;
        } catch (error) {
            throw parseApiError(error);
        }
    },

    /**
     * Get patient by ID
     */
    getById: async (id: string): Promise<Patient> => {
        try {
            const { data } = await apiClient.get<Patient>(`/patients/${id}/`);
            return data;
        } catch (error) {
            throw parseApiError(error);
        }
    },

    /**
     * Create new patient
     */
    create: async (patient: CreatePatientRequest): Promise<Patient> => {
        try {
            const { data } = await apiClient.post<Patient>('/patients/', patient);
            return data;
        } catch (error) {
            throw parseApiError(error);
        }
    },

    /**
     * Update existing patient
     */
    update: async (id: string, patient: UpdatePatientRequest): Promise<Patient> => {
        try {
            const { data } = await apiClient.patch<Patient>(`/patients/${id}/`, patient);
            return data;
        } catch (error) {
            throw parseApiError(error);
        }
    },

    /**
     * Delete patient
     */
    delete: async (id: string): Promise<void> => {
        try {
            await apiClient.delete(`/patients/${id}/`);
        } catch (error) {
            throw parseApiError(error);
        }
    },

    /**
     * Search patients by query
     */
    search: async (query: string, params?: SearchParams): Promise<PaginatedResponse<Patient>> => {
        try {
            const { data } = await apiClient.get<PaginatedResponse<Patient>>('/patients/', {
                params: { ...params, search: query },
            });
            return data;
        } catch (error) {
            throw parseApiError(error);
        }
    },
};
