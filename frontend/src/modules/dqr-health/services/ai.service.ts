import api from './api';

export interface AIPharmacyRequest {
    medication_names: string[];
    patient_context?: {
        age?: number;
        conditions?: string[];
    };
}

export interface AIPharmacyResponse {
    drug_interactions: string;
    dosage_recommendations: string;
    contraindications: string;
    safety_warnings: string[];
}

export interface AIFeedbackRequest {
    feedback_text: string;
    rating?: number;
}

export interface AIFeedbackResponse {
    sentiment: string;
    key_themes: string[];
    actionable_insights: string;
    priority_level: string;
}

export const aiService = {
    async analyzeDrugInteractions(request: AIPharmacyRequest): Promise<AIPharmacyResponse> {
        const response = await api.post<AIPharmacyResponse>(
            '/api/v1/pharmacy/ai-drug-info/',
            request
        );
        return response.data;
    },

    async analyzeFeedback(request: AIFeedbackRequest): Promise<AIFeedbackResponse> {
        const response = await api.post<AIFeedbackResponse>(
            '/api/v1/experience/ai-feedback-analysis/',
            request
        );
        return response.data;
    },
};
