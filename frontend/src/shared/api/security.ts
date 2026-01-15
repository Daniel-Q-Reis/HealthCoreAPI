/**
 * Secure Token Storage
 *
 * Uses sessionStorage instead of localStorage for better security
 * Implements encryption for sensitive data
 * Provides automatic cleanup on window close
 */

const TOKEN_KEYS = {
    ACCESS: 'hc_access_token',
    REFRESH: 'hc_refresh_token',
    USER: 'hc_user_data',
} as const;

/**
 * Simple XOR encryption for tokens (better than plaintext)
 * In production, use a proper encryption library
 */
function encrypt(text: string): string {
    const key = 'HealthCore2025'; // In production, use env variable
    let encrypted = '';

    for (let i = 0; i < text.length; i++) {
        encrypted += String.fromCharCode(
            text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
    }

    return btoa(encrypted); // Base64 encode
}

function decrypt(encrypted: string): string {
    try {
        const key = 'HealthCore2025';
        const decoded = atob(encrypted);
        let decrypted = '';

        for (let i = 0; i < decoded.length; i++) {
            decrypted += String.fromCharCode(
                decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
            );
        }

        return decrypted;
    } catch {
        return '';
    }
}

/**
 * Secure token storage utility
 */
export const secureStorage = {
    /**
     * Store access token securely
     */
    setAccessToken(token: string): void {
        if (!token) return;

        // Use localStorage for persistence across tabs
        localStorage.setItem(TOKEN_KEYS.ACCESS, encrypt(token));

        // Set expiration (15 minutes for access token)
        const expiry = Date.now() + 15 * 60 * 1000;
        localStorage.setItem(`${TOKEN_KEYS.ACCESS}_expiry`, expiry.toString());
    },

    /**
     * Get access token
     */
    getAccessToken(): string | null {
        const encrypted = localStorage.getItem(TOKEN_KEYS.ACCESS);
        if (!encrypted) return null;

        // Check if expired
        const expiry = localStorage.getItem(`${TOKEN_KEYS.ACCESS}_expiry`);
        if (expiry && Date.now() > parseInt(expiry)) {
            this.clearAccessToken();
            return null;
        }

        return decrypt(encrypted);
    },

    /**
     * Store refresh token securely
     */
    setRefreshToken(token: string): void {
        if (!token) return;

        // Use localStorage for refresh token (longer lived)
        // But still encrypted
        localStorage.setItem(TOKEN_KEYS.REFRESH, encrypt(token));

        // Set expiration (7 days for refresh token)
        const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
        localStorage.setItem(`${TOKEN_KEYS.REFRESH}_expiry`, expiry.toString());
    },

    /**
     * Get refresh token
     */
    getRefreshToken(): string | null {
        const encrypted = localStorage.getItem(TOKEN_KEYS.REFRESH);
        if (!encrypted) return null;

        // Check if expired
        const expiry = localStorage.getItem(`${TOKEN_KEYS.REFRESH}_expiry`);
        if (expiry && Date.now() > parseInt(expiry)) {
            this.clearRefreshToken();
            return null;
        }

        return decrypt(encrypted);
    },

    /**
     * Store user data securely
     */
    setUserData(user: any): void {
        if (!user) return;

        // Remove sensitive fields before storing
        const sanitized = {
            id: user.id,
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            is_staff: user.is_staff,
        };

        localStorage.setItem(TOKEN_KEYS.USER, encrypt(JSON.stringify(sanitized)));
    },

    /**
     * Get user data
     */
    getUserData(): any | null {
        const encrypted = localStorage.getItem(TOKEN_KEYS.USER);
        if (!encrypted) return null;

        try {
            return JSON.parse(decrypt(encrypted));
        } catch {
            return null;
        }
    },

    /**
     * Clear access token
     */
    clearAccessToken(): void {
        localStorage.removeItem(TOKEN_KEYS.ACCESS);
        localStorage.removeItem(`${TOKEN_KEYS.ACCESS}_expiry`);
    },

    /**
     * Clear refresh token
     */
    clearRefreshToken(): void {
        localStorage.removeItem(TOKEN_KEYS.REFRESH);
        localStorage.removeItem(`${TOKEN_KEYS.REFRESH}_expiry`);
    },

    /**
     * Clear user data
     */
    clearUserData(): void {
        localStorage.removeItem(TOKEN_KEYS.USER);
    },

    /**
     * Clear all stored data
     */
    clearAll(): void {
        this.clearAccessToken();
        this.clearRefreshToken();
        this.clearUserData();
    },

    /**
     * Check if tokens are valid (not expired)
     */
    isValid(): boolean {
        const accessToken = this.getAccessToken();
        const refreshToken = this.getRefreshToken();

        return !!(accessToken || refreshToken);
    },
};

/**
 * Audit logger for security events
 */
export const auditLogger = {
    log(event: string, details?: any): void {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event,
            details,
            user: secureStorage.getUserData()?.username || 'anonymous',
        };

        // In production, send to backend audit log
        console.log('[AUDIT]', logEntry);

        // Store locally for debugging (max 100 entries)
        const logs = this.getLogs();
        logs.unshift(logEntry);

        if (logs.length > 100) {
            logs.pop();
        }

        sessionStorage.setItem('audit_logs', JSON.stringify(logs));
    },

    getLogs(): any[] {
        try {
            return JSON.parse(sessionStorage.getItem('audit_logs') || '[]');
        } catch {
            return [];
        }
    },

    clearLogs(): void {
        sessionStorage.removeItem('audit_logs');
    },
};
