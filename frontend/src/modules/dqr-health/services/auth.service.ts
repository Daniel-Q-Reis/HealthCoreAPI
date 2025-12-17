import api from './api';

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

        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);

        return response.data;
    },

    async refresh(refreshToken: string): Promise<{ access: string }> {
        const response = await api.post('/api/v1/token/refresh/', {
            refresh: refreshToken,
        });
        return response.data;
    },

    logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    },

    isAuthenticated(): boolean {
        return !!localStorage.getItem('access_token');
    },

    getToken(): string | null {
        return localStorage.getItem('access_token');
    },
};
