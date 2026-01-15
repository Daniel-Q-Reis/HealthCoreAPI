import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { secureStorage, auditLogger } from './security';

// Get API base URL from environment or use default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create Axios instance
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false, // Set to true if using cookies
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = secureStorage.getAccessToken();

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Audit log for sensitive endpoints
        if (config.url?.includes('/patients') || config.url?.includes('/feedback')) {
            auditLogger.log('API_REQUEST', {
                method: config.method,
                url: config.url,
            });
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors and token refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized - Try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = secureStorage.getRefreshToken();

                if (refreshToken) {
                    // Try to refresh the access token
                    const { data } = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
                        refresh: refreshToken,
                    });

                    // Save new access token
                    secureStorage.setAccessToken(data.access);

                    // Audit log
                    auditLogger.log('TOKEN_AUTO_REFRESHED');

                    // Retry original request with new token
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${data.access}`;
                    }

                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed - clear tokens and redirect to login
                secureStorage.clearAll();

                // Audit log
                auditLogger.log('SESSION_EXPIRED');

                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // Audit log for errors
        if (error.response?.status && error.response.status >= 400) {
            auditLogger.log('API_ERROR', {
                status: error.response.status,
                url: error.config?.url,
                method: error.config?.method,
            });
        }

        // Handle other errors
        return Promise.reject(error);
    }
);

export default apiClient;
