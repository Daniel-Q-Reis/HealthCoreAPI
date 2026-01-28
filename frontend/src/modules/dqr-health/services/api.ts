import axios from 'axios';
import { secureStorage } from '@/shared/api/security';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance
export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add JWT token from unified secure storage
api.interceptors.request.use(
    (config) => {
        const token = secureStorage.getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle errors and token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retried, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = secureStorage.getRefreshToken();
                if (refreshToken) {
                    const response = await axios.post(`${API_BASE_URL}/api/v1/token/refresh/`, {
                        refresh: refreshToken,
                    });

                    const { access } = response.data;
                    secureStorage.setAccessToken(access);

                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${access}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, logout user - clear all tokens
                secureStorage.clearAll();
                window.location.href = '/dqr-health/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
