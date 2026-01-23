import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi } from '@/shared/api/auth';
import type { User } from '@/shared/api/types';
import { AuthContext, type RegisterData } from './AuthContext';

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Verify authentication status
    const verifyAuth = useCallback(async () => {
        try {
            if (authApi.isAuthenticated()) {
                // Check inactivity (30 mins = 1800000 ms)
                const lastActive = parseInt(localStorage.getItem('lastActive') || '0');
                const now = Date.now();

                if (lastActive && (now - lastActive > 30 * 60 * 1000)) {
                    console.log('Session expired due to inactivity');
                    await logout();
                    return;
                }

                // Update activity if valid
                localStorage.setItem('lastActive', now.toString());

                const userData = await authApi.getCurrentUser();
                setUser(userData);
            }
        } catch (error) {
            console.error('Failed to verify auth:', error);
            // Clear invalid tokens
            await authApi.logout();
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = useCallback(async (username: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await authApi.login({ username, password });

            let currentUser = response.user;
            if (!currentUser) {
                // Fallback: Fetch user if not provided in login response
                currentUser = await authApi.getCurrentUser();
            }

            setUser(currentUser);
            // Initialize activity timer
            localStorage.setItem('lastActive', Date.now().toString());
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Login with Google OAuth
    const loginWithGoogle = useCallback(() => {
        // Redirect to Django OAuth endpoint (backend API)
        // VITE_API_URL already includes /api (e.g., https://api.danielqreis.com/api)
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        window.location.href = `${apiUrl}/auth/login/google-oauth2/`;
    }, []);

    // Register new user
    const register = useCallback(async (data: RegisterData) => {
        setIsLoading(true);
        try {
            const response = await authApi.register(data);
            if (response.user) {
                setUser(response.user);
                // Initialize activity timer
                localStorage.setItem('lastActive', Date.now().toString());
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Logout
    const logout = useCallback(async () => {
        setIsLoading(true);
        try {
            await authApi.logout();
            setUser(null);
            localStorage.removeItem('lastActive');
            // Redirect to home page
            window.location.href = '/dqr-health';
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Check if user is authenticated on mount
    useEffect(() => {
        verifyAuth();
    }, [verifyAuth]);

    // Inactivity Monitor
    useEffect(() => {
        if (!user) return; // Only monitor if logged in

        const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
        const CHECK_INTERVAL_MS = 60 * 1000; // Check every 1 minute

        // Update 'lastActive' on user interaction
        const updateActivity = () => {
            // Throttling: only update if last update was > 5 seconds ago
            // to avoid excessive localStorage writes on mousemove
            const lastWrite = parseInt(sessionStorage.getItem('lastActivityWrite') || '0');
            const now = Date.now();

            if (now - lastWrite > 5000) {
                localStorage.setItem('lastActive', now.toString());
                sessionStorage.setItem('lastActivityWrite', now.toString());
            }
        };

        // Events to listen for
        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];

        events.forEach(event => {
            window.addEventListener(event, updateActivity);
        });

        // Periodic check for idleness
        const intervalId = setInterval(() => {
            const lastActive = parseInt(localStorage.getItem('lastActive') || '0');
            if (Date.now() - lastActive > TIMEOUT_MS) {
                console.log('User inactive for 30mins, logging out...');
                logout();
            }
        }, CHECK_INTERVAL_MS);

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, updateActivity);
            });
            clearInterval(intervalId);
        };
    }, [user, logout]);

    // Refresh access token
    const refreshToken = useCallback(async () => {
        try {
            const refreshTokenValue = authApi.getRefreshToken();
            if (refreshTokenValue) {
                await authApi.refreshToken(refreshTokenValue);
            }
        } catch (error) {
            console.error('Failed to refresh token:', error);
            // If refresh fails, logout
            await logout();
        }
    }, [logout]);

    // Check if user has specific role
    const hasRole = useCallback(
        (role: string): boolean => {
            if (!user) return false;
            const userGroups = user.groups || [];
            return userGroups.includes(role);
        },
        [user]
    );

    // Check if user has any of the specified roles
    const hasAnyRole = useCallback(
        (roles: string[]): boolean => {
            if (!user) return false;
            const userGroups = user.groups || [];
            return roles.some((role) => userGroups.includes(role));
        },
        [user]
    );

    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        register,
        logout,
        refreshToken,
        verifyAuth,
        hasRole,
        hasAnyRole,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
