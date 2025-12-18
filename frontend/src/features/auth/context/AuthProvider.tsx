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

    // Check if user is authenticated on mount
    useEffect(() => {
        verifyAuth();
    }, [verifyAuth]);

    // Login with username/password
    const login = useCallback(async (username: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await authApi.login({ username, password });
            setUser(response.user);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Login with Google OAuth
    const loginWithGoogle = useCallback(() => {
        // Redirect to Django OAuth endpoint (backend)
        window.location.href = '/api/auth/login/google-oauth2/';
    }, []);

    // Register new user
    const register = useCallback(async (data: RegisterData) => {
        setIsLoading(true);
        try {
            // TODO: Implement registration endpoint
            // const response = await authApi.register(data);
            // setUser(response.user);
            console.log('Register:', data);
            throw new Error('Registration endpoint not implemented yet');
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
        } finally {
            setIsLoading(false);
        }
    }, []);

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
