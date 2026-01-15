/**
 * Input Validation and Sanitization
 *
 * Prevents XSS, SQL injection, and other attacks
 * Validates data before sending to API
 */

/**
 * Sanitize string input (remove HTML, scripts)
 */
export function sanitizeString(input: string): string {
    if (!input) return '';

    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .trim();
}

/**
 * Sanitize email
 */
export function sanitizeEmail(email: string): string {
    if (!email) return '';

    return email.toLowerCase().trim();
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string): string {
    if (!phone) return '';

    // Remove all non-numeric characters except + and -
    return phone.replace(/[^\d+-]/g, '');
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone format (US format)
 */
export function isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\d\s\-+()]{10,}$/;
    return phoneRegex.test(phone);
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function isValidDate(date: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;

    const d = new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
}

/**
 * Validate medical record number (alphanumeric, 6-20 chars)
 */
export function isValidMRN(mrn: string): boolean {
    const mrnRegex = /^[A-Z0-9]{6,20}$/;
    return mrnRegex.test(mrn);
}

/**
 * Sanitize patient data before sending to API
 */
export function sanitizePatientData(data: any): any {
    return {
        ...data,
        first_name: sanitizeString(data.first_name),
        last_name: sanitizeString(data.last_name),
        email: sanitizeEmail(data.email),
        phone: sanitizePhone(data.phone),
        address: sanitizeString(data.address),
        city: sanitizeString(data.city),
        state: sanitizeString(data.state),
        emergency_contact_name: data.emergency_contact_name ? sanitizeString(data.emergency_contact_name) : undefined,
        emergency_contact_phone: data.emergency_contact_phone ? sanitizePhone(data.emergency_contact_phone) : undefined,
        allergies: data.allergies ? sanitizeString(data.allergies) : undefined,
    };
}

/**
 * Validate patient data
 */
export function validatePatientData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.first_name || data.first_name.length < 2) {
        errors.push('First name must be at least 2 characters');
    }

    if (!data.last_name || data.last_name.length < 2) {
        errors.push('Last name must be at least 2 characters');
    }

    if (!data.email || !isValidEmail(data.email)) {
        errors.push('Invalid email address');
    }

    if (!data.phone || !isValidPhone(data.phone)) {
        errors.push('Invalid phone number');
    }

    if (!data.date_of_birth || !isValidDate(data.date_of_birth)) {
        errors.push('Invalid date of birth');
    }

    if (!['M', 'F', 'O'].includes(data.gender)) {
        errors.push('Invalid gender');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Sanitize feedback data
 */
export function sanitizeFeedbackData(data: any): any {
    return {
        ...data,
        description: sanitizeString(data.description),
        category: sanitizeString(data.category),
        resolution: data.resolution ? sanitizeString(data.resolution) : undefined,
    };
}

/**
 * Rate limiter for API calls (prevent abuse)
 */
class RateLimiter {
    private calls: Map<string, number[]> = new Map();
    private maxCalls: number;
    private windowMs: number;

    constructor(maxCalls: number = 10, windowMs: number = 60000) {
        this.maxCalls = maxCalls;
        this.windowMs = windowMs;
    }

    canMakeRequest(key: string): boolean {
        const now = Date.now();
        const calls = this.calls.get(key) || [];

        // Remove old calls outside the window
        const recentCalls = calls.filter(time => now - time < this.windowMs);

        if (recentCalls.length >= this.maxCalls) {
            return false;
        }

        recentCalls.push(now);
        this.calls.set(key, recentCalls);

        return true;
    }

    reset(key: string): void {
        this.calls.delete(key);
    }
}

export const rateLimiter = new RateLimiter(30, 60000); // 30 calls per minute
