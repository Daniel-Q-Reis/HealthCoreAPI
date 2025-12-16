import { apiClient } from './config';
import { parseApiError } from './errors';
import {
    LoginRequest,
    LoginResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    User,
} from './types';

/**
 * Authentication API Client
 */
export const authApi = {
    /**
     * Login with username and password
     */
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        try {
            const { data } = await apiClient.post<LoginResponse>('/auth/login/', credentials);

            // Store tokens in localStorage
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);

            return data;
        } catch (error) {
            throw parseApiError(error);
        }
    },

    /**
     * Logout (clear tokens)
     */
    logout: async (): Promise<void> => {
        try {
            // Call logout endpoint if it exists
            await apiClient.post('/auth/logout/');
        } catch (error) {
            // Ignore errors on logout
        } finally {
            // Always clear tokens
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        }
    },

    /**
     * Refresh access token
     */
    refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
        try {
            const { data } = await apiClient.post<RefreshTokenResponse>(
                '/auth/token/refresh/',
                { refresh: refreshToken }
            );

            // Update access token
            localStorage.setItem('access_token', data.access);

            return data;
        } catch (error) {
            // Clear tokens on refresh failure
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            throw parseApiError(error);
        }
    },

    /**
     * Get current authenticated user
     */
    getCurrentUser: async (): Promise<User> => {
        try {
            const { data } = await apiClient.get<User>('/auth/me/');
            return data;
        } catch (error) {
            throw parseApiError(error);
        }
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('access_token');
    },

    /**
     * Get stored access token
     */
    getAccessToken: (): string | null => {
        return localStorage.getItem('access_token');
    },

    /**
     * Get stored refresh token
     */
    getRefreshToken: (): string | null => {
        return localStorage.getItem('refresh_token');
    },
};
