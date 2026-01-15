
import { apiClient } from '@/shared/api/config';

export interface Observation {
    id: number;
    code: string;
    value_text: string;
}

export interface DiagnosticReport {
    id: number;
    patient: number;
    performer: number;
    status: string;
    conclusion: string;
    issued_at: string;
    observations: Observation[];
}

export interface LifestyleAdvice {
    advice: string;
    model_used: string;
}

export const resultsApi = {
    getMyReports: async (): Promise<DiagnosticReport[]> => {
        const response = await apiClient.get('/v1/results/reports/');
        // Handle DRF Pagination (LimitOffsetPagination returns { results: [], ... })
        if (response.data && Array.isArray(response.data.results)) {
            return response.data.results;
        }
        return Array.isArray(response.data) ? response.data : [];
    },

    getReport: async (id: number): Promise<DiagnosticReport> => {
        const response = await apiClient.get(`/v1/results/reports/${id}/`);
        return response.data;
    },

    getLifestyleAdvice: async (id: number): Promise<LifestyleAdvice> => {
        const response = await apiClient.post(`/v1/results/reports/${id}/lifestyle-advice/`);
        return response.data;
    },

    analyzeDiagnosis: async (diagnosis: string): Promise<LifestyleAdvice> => {
        const response = await apiClient.post('/v1/results/reports/analyze-diagnosis/', { diagnosis });
        return response.data;
    }
};
