import { AxiosError } from 'axios';
import { ApiError } from './types';

/**
 * Custom API Error class
 */
export class ApiException extends Error {
    status: number;
    errors?: Record<string, string[]>;

    constructor(message: string, status: number, errors?: Record<string, string[]>) {
        super(message);
        this.name = 'ApiException';
        this.status = status;
        this.errors = errors;
    }
}

/**
 * Parse Axios error into ApiException
 */
export function parseApiError(error: unknown): ApiException {
    if (error instanceof AxiosError) {
        const status = error.response?.status || 500;
        const data = error.response?.data;

        // Handle different error response formats
        if (data) {
            // Django REST Framework error format
            if (data.detail) {
                return new ApiException(data.detail, status);
            }

            // Validation errors
            if (typeof data === 'object' && !data.detail) {
                const errors = data as Record<string, string[]>;
                const firstError = Object.values(errors)[0]?.[0] || 'Validation error';
                return new ApiException(firstError, status, errors);
            }

            // Generic error with message
            if (data.message) {
                return new ApiException(data.message, status);
            }
        }

        // Network errors
        if (error.code === 'ECONNABORTED') {
            return new ApiException('Request timeout', 408);
        }

        if (error.code === 'ERR_NETWORK') {
            return new ApiException('Network error. Please check your connection.', 0);
        }

        // Default error message based on status
        return new ApiException(
            getDefaultErrorMessage(status),
            status
        );
    }

    // Unknown error
    if (error instanceof Error) {
        return new ApiException(error.message, 500);
    }

    return new ApiException('An unknown error occurred', 500);
}

/**
 * Get user-friendly error message based on status code
 */
function getDefaultErrorMessage(status: number): string {
    switch (status) {
        case 400:
            return 'Invalid request. Please check your input.';
        case 401:
            return 'Unauthorized. Please log in.';
        case 403:
            return 'You do not have permission to perform this action.';
        case 404:
            return 'The requested resource was not found.';
        case 409:
            return 'Conflict. The resource already exists.';
        case 422:
            return 'Validation error. Please check your input.';
        case 429:
            return 'Too many requests. Please try again later.';
        case 500:
            return 'Internal server error. Please try again later.';
        case 502:
            return 'Bad gateway. The server is temporarily unavailable.';
        case 503:
            return 'Service unavailable. Please try again later.';
        default:
            return 'An error occurred. Please try again.';
    }
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors?: Record<string, string[]>): string {
    if (!errors) return '';

    return Object.entries(errors)
        .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
        .join('\n');
}
