import { apiClient } from './config';
import { parseApiError } from './errors';
import type { ProfessionalRoleRequest } from './types';

/**
 * Credentials API Client
 *
 * Handles professional role requests and credential verification.
 */
export const credentialsApi = {
    /**
     * Request professional role (authenticated users)
     */
    requestProfessionalRole: async (formData: FormData): Promise<ProfessionalRoleRequest> => {
        try {
            const { data } = await apiClient.post<ProfessionalRoleRequest>(
                '/auth/request-professional-role/',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return data;
        } catch (error) {
            throw parseApiError(error);
        }
    },

    /**
     * List credential requests (admin only)
     */
    listRequests: async (params?: {
        status?: 'pending' | 'approved' | 'rejected';
    }): Promise<ProfessionalRoleRequest[]> => {
        try {
            const { data } = await apiClient.get<ProfessionalRoleRequest[]>(
                '/admin/credential-requests/',
                { params }
            );
            return data;
        } catch (error) {
            throw parseApiError(error);
        }
    },

    /**
     * Approve credential request (admin only)
     */
    approveRequest: async (
        id: number,
        notes: string = ''
    ): Promise<ProfessionalRoleRequest> => {
        try {
            const { data } = await apiClient.post<ProfessionalRoleRequest>(
                `/admin/credential-requests/${id}/approve/`,
                { notes }
            );
            return data;
        } catch (error) {
            throw parseApiError(error);
        }
    },

    /**
     * Reject credential request (admin only)
     */
    rejectRequest: async (
        id: number,
        reason: string
    ): Promise<ProfessionalRoleRequest> => {
        try {
            const { data } = await apiClient.post<ProfessionalRoleRequest>(
                `/admin/credential-requests/${id}/reject/`,
                { reason }
            );
            return data;
        } catch (error) {
            throw parseApiError(error);
        }
    },
};
