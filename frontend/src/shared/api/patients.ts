import { apiClient } from './config';
import { parseApiError } from './errors';
import { sanitizePatientData, validatePatientData, rateLimiter } from './validation';
import { auditLogger } from './security';
import {
    Patient,
    CreatePatientRequest,
    UpdatePatientRequest,
    PaginatedResponse,
    SearchParams,
} from './types';

/**
 * Patients API Client (with security enhancements)
 */
export const patientsApi = {
    /**
     * Get all patients with optional search and pagination
     */
    getAll: async (params?: SearchParams): Promise<PaginatedResponse<Patient>> => {
        // Rate limiting
        if (!rateLimiter.canMakeRequest('patients.getAll')) {
            throw new Error('Too many requests. Please wait a moment.');
        }

        try {
            const { data } = await apiClient.get<PaginatedResponse<Patient>>('/patients/', { params });

            auditLogger.log('PATIENTS_LIST_VIEWED', { count: data.results.length });

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

            auditLogger.log('PATIENT_VIEWED', { patient_id: id });

            return data;
        } catch (error) {
            throw parseApiError(error);
        }
    },

    /**
     * Create new patient
     */
    create: async (patient: CreatePatientRequest): Promise<Patient> => {
        // Validate data
        const validation = validatePatientData(patient);
        if (!validation.valid) {
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        // Sanitize data
        const sanitized = sanitizePatientData(patient);

        try {
            const { data } = await apiClient.post<Patient>('/patients/', sanitized);

            auditLogger.log('PATIENT_CREATED', {
                patient_id: data.id,
                patient_name: `${data.first_name} ${data.last_name}`,
            });

            return data;
        } catch (error) {
            throw parseApiError(error);
        }
    },

    /**
     * Update existing patient
     */
    update: async (id: string, patient: UpdatePatientRequest): Promise<Patient> => {
        // Sanitize data (partial validation for updates)
        const sanitized = sanitizePatientData(patient);

        try {
            const { data } = await apiClient.patch<Patient>(`/patients/${id}/`, sanitized);

            auditLogger.log('PATIENT_UPDATED', {
                patient_id: id,
                fields_updated: Object.keys(patient),
            });

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

            auditLogger.log('PATIENT_DELETED', { patient_id: id });
        } catch (error) {
            throw parseApiError(error);
        }
    },

    /**
     * Search patients by query
     */
    search: async (query: string, params?: SearchParams): Promise<PaginatedResponse<Patient>> => {
        // Rate limiting
        if (!rateLimiter.canMakeRequest('patients.search')) {
            throw new Error('Too many requests. Please wait a moment.');
        }

        try {
            const { data } = await apiClient.get<PaginatedResponse<Patient>>('/patients/', {
                params: { ...params, search: query },
            });

            auditLogger.log('PATIENTS_SEARCHED', { query, results: data.results.length });

            return data;
        } catch (error) {
            throw parseApiError(error);
        }
    },
};
