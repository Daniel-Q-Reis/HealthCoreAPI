import api from './api';
import { secureStorage } from '@/shared/api/security';

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface AuthResponse {
    access: string;
    refresh: string;
}

export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/api/v1/token/', credentials);
        const { access, refresh } = response.data;

        // Use unified secure storage to prevent session isolation issues
        secureStorage.setAccessToken(access);
        secureStorage.setRefreshToken(refresh);

        return response.data;
    },

    async refresh(refreshToken: string): Promise<{ access: string }> {
        const response = await api.post('/api/v1/token/refresh/', {
            refresh: refreshToken,
        });
        return response.data;
    },

    logout() {
        // Clear all tokens to prevent stale session data
        secureStorage.clearAll();
    },

    isAuthenticated(): boolean {
        return secureStorage.isValid();
    },

    getToken(): string | null {
        return secureStorage.getAccessToken();
    },
};
