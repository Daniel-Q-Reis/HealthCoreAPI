import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRoles?: string[];
    requireAnyRole?: boolean;  // true = any role, false = all roles
    redirectTo?: string;
}

export function ProtectedRoute({
    children,
    requiredRoles = [],
    requireAnyRole = true,
    redirectTo = '/dqr-health/login',
}: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, hasRole, hasAnyRole } = useAuth();

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }

    // Check role requirements if specified
    if (requiredRoles.length > 0) {
        const hasRequiredRole = requireAnyRole
            ? hasAnyRole(requiredRoles)
            : requiredRoles.every((role) => hasRole(role));

        if (!hasRequiredRole) {
            // Redirect to unauthorized page or dashboard
            return <Navigate to="/dqr-health/unauthorized" replace />;
        }
    }

    return <>{children}</>;
}
