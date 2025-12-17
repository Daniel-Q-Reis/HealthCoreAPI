import { apiClient } from './config';
import { parseApiError } from './errors';
import {
    Feedback,
    CreateFeedbackRequest,
    UpdateFeedbackRequest,
    PaginatedResponse,
    SearchParams,
} from './types';

/**
 * Patient Experience API Client
 */
export const experienceApi = {
    /**
     * Get all feedback
     */
    getAll: async (params?: SearchParams): Promise<PaginatedResponse<Feedback>> => {
        try {
            const { data } = await apiClient.get<PaginatedResponse<Feedback>>('/experience/feedback/', { params });
            return data;
        } catch (error) {
            throw parseApiError(error);
        }
    },

    /**
     * Get feedback by ID
     */
    getById: async (id: string): Promise<Feedback> => {
        try {
            const { data } = await apiClient.get<Feedback>(`/experience/feedback/${id}/`);
            return data;
        } catch (error) {
            throw parseApiError(error);
        }
    },

    /**
     * Create new feedback
     */
    create: async (feedback: CreateFeedbackRequest): Promise<Feedback> => {
        try {
            const { data } = await apiClient.post<Feedback>('/experience/feedback/', feedback);
            return data;
        } catch (error) {
            throw parseApiError(error);
        }
    },

    /**
     * Update existing feedback
     */
    update: async (id: string, feedback: UpdateFeedbackRequest): Promise<Feedback> => {
        try {
            const { data } = await apiClient.patch<Feedback>(`/experience/feedback/${id}/`, feedback);
            return data;
        } catch (error) {
            throw parseApiError(error);
        }
    },

    /**
     * Delete feedback
     */
    delete: async (id: string): Promise<void> => {
        try {
            await apiClient.delete(`/experience/feedback/${id}/`);
        } catch (error) {
            throw parseApiError(error);
        }
    },

    /**
     * Analyze feedback with AI
     */
    analyzeFeedback: async (feedbackId: string): Promise<Feedback> => {
        try {
            const { data } = await apiClient.post<Feedback>(`/experience/feedback/${feedbackId}/analyze/`);
            return data;
        } catch (error) {
            throw parseApiError(error);
        }
    },

    /**
     * Get feedback by patient
     */
    getByPatient: async (patientId: string, params?: SearchParams): Promise<PaginatedResponse<Feedback>> => {
        try {
            const { data } = await apiClient.get<PaginatedResponse<Feedback>>('/experience/feedback/', {
                params: { ...params, patient: patientId },
            });
            return data;
        } catch (error) {
            throw parseApiError(error);
        }
    },
};
