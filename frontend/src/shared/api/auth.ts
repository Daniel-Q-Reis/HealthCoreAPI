import { apiClient } from './config';
import { parseApiError } from './errors';
import { secureStorage, auditLogger } from './security';
import {
    LoginRequest,
    LoginResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    User,
} from './types';

/**
 * Authentication API Client (with security enhancements)
 */
export const authApi = {
    /**
     * Login with username and password
     */
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        try {
            const { data } = await apiClient.post<LoginResponse>('/auth/login/', credentials);

            // Store tokens securely (encrypted)
            secureStorage.setAccessToken(data.access);
            secureStorage.setRefreshToken(data.refresh);
            secureStorage.setUserData(data.user);

            // Audit log
            auditLogger.log('LOGIN_SUCCESS', { username: credentials.username });

            return data;
        } catch (error) {
            auditLogger.log('LOGIN_FAILED', { username: credentials.username });
            throw parseApiError(error);
        }
    },

    /**
     * Register a new user
     */
    register: async (data: any): Promise<any> => {
        try {
            // dj-rest-auth expects password1 and password2
            const payload = {
                ...data,
                password1: data.password,
                password2: data.confirmPassword || data.password,
            };
            const response = await apiClient.post('/auth/registration/', payload);

            // dj-rest-auth login after registration is optional (default: true)
            // If it returns tokens, let's login the user immediately
            if (response.data.access && response.data.refresh) {
                secureStorage.setAccessToken(response.data.access);
                secureStorage.setRefreshToken(response.data.refresh);
                if (response.data.user) {
                    secureStorage.setUserData(response.data.user);
                }
            }

            auditLogger.log('REGISTER_SUCCESS', { username: data.username });
            return response.data;
        } catch (error) {
            auditLogger.log('REGISTER_FAILED', { username: data.username });
            throw parseApiError(error);
        }
    },

    /**
     * Logout (clear tokens)
     */
    logout: async (): Promise<void> => {
        const user = secureStorage.getUserData();

        try {
            // Call logout endpoint if it exists
            await apiClient.post('/auth/logout/');
        } catch (error) {
            // Ignore errors on logout
        } finally {
            // Always clear tokens
            secureStorage.clearAll();

            // Audit log
            auditLogger.log('LOGOUT', { username: user?.username });
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
            secureStorage.setAccessToken(data.access);

            // Audit log
            auditLogger.log('TOKEN_REFRESHED');

            return data;
        } catch (error) {
            // Clear tokens on refresh failure
            secureStorage.clearAll();

            // Audit log
            auditLogger.log('TOKEN_REFRESH_FAILED');

            throw parseApiError(error);
        }
    },

    /**
     * Get current authenticated user
     */
    getCurrentUser: async (): Promise<User> => {
        try {
            const { data } = await apiClient.get<User>('/auth/me/');

            // Update stored user data
            secureStorage.setUserData(data);

            return data;
        } catch (error) {
            throw parseApiError(error);
        }
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated: (): boolean => {
        return secureStorage.isValid();
    },

    /**
     * Get stored access token
     */
    getAccessToken: (): string | null => {
        return secureStorage.getAccessToken();
    },

    /**
     * Get stored refresh token
     */
    getRefreshToken: (): string | null => {
        return secureStorage.getRefreshToken();
    },

    /**
     * Get stored user data
     */
    getUserData: (): User | null => {
        return secureStorage.getUserData();
    },
};
