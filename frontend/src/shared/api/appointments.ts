import { apiClient } from './config';
import { parseApiError } from './errors';
import {
    Appointment,
    CreateAppointmentRequest,
    UpdateAppointmentRequest,
    PaginatedResponse,
    SearchParams,
} from './types';

/**
 * Appointments API Client
 */
export const appointmentsApi = {
    /**
     * Get all appointments
     */
    getAll: async (params?: SearchParams): Promise<PaginatedResponse<Appointment>> => {
        try {
            const { data } = await apiClient.get<PaginatedResponse<Appointment>>('/appointments/', { params });
            return data;
        } catch (error) {
            throw parseApiError(error);
        }
    },

    /**
     * Get appointment by ID
     */
    getById: async (id: string): Promise<Appointment> => {
        try {
            const { data } = await apiClient.get<Appointment>(`/appointments/${id}/`);
            return data;
        } catch (error) {
            throw parseApiError(error);
        }
    },

    /**
     * Create new appointment
     */
    create: async (appointment: CreateAppointmentRequest): Promise<Appointment> => {
        try {
            const { data } = await apiClient.post<Appointment>('/appointments/', appointment);
            return data;
        } catch (error) {
            throw parseApiError(error);
        }
    },

    /**
     * Update existing appointment
     */
    update: async (id: string, appointment: UpdateAppointmentRequest): Promise<Appointment> => {
        try {
            const { data } = await apiClient.patch<Appointment>(`/appointments/${id}/`, appointment);
            return data;
        } catch (error) {
            throw parseApiError(error);
        }
    },

    /**
     * Delete appointment
     */
    delete: async (id: string): Promise<void> => {
        try {
            await apiClient.delete(`/appointments/${id}/`);
        } catch (error) {
            throw parseApiError(error);
        }
    },

    /**
     * Get appointments by patient ID
     */
    getByPatient: async (patientId: string, params?: SearchParams): Promise<PaginatedResponse<Appointment>> => {
        try {
            const { data } = await apiClient.get<PaginatedResponse<Appointment>>('/appointments/', {
                params: { ...params, patient: patientId },
            });
            return data;
        } catch (error) {
            throw parseApiError(error);
        }
    },
};
