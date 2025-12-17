/**
 * Role-Based Access Control (RBAC) Support
 *
 * Integrates with Django backend permissions
 * Provides role checking and permission validation
 */

import { secureStorage } from './security';
import { User } from './types';

/**
 * User roles (from Django groups)
 */
export enum UserRole {
    ADMIN = 'admin',
    DOCTOR = 'doctor',
    NURSE = 'nurse',
    RECEPTIONIST = 'receptionist',
    PHARMACIST = 'pharmacist',
    PATIENT = 'patient',
}

/**
 * Permissions (from Django permissions)
 */
export enum Permission {
    // Patient permissions
    VIEW_PATIENT = 'patients.view_patient',
    ADD_PATIENT = 'patients.add_patient',
    CHANGE_PATIENT = 'patients.change_patient',
    DELETE_PATIENT = 'patients.delete_patient',

    // Appointment permissions
    VIEW_APPOINTMENT = 'scheduling.view_appointment',
    ADD_APPOINTMENT = 'scheduling.add_appointment',
    CHANGE_APPOINTMENT = 'scheduling.change_appointment',
    DELETE_APPOINTMENT = 'scheduling.delete_appointment',

    // Medication permissions
    VIEW_MEDICATION = 'pharmacy.view_medication',
    ADD_MEDICATION = 'pharmacy.add_medication',
    CHANGE_MEDICATION = 'pharmacy.change_medication',
    DELETE_MEDICATION = 'pharmacy.delete_medication',

    // Feedback permissions
    VIEW_FEEDBACK = 'experience.view_feedback',
    ADD_FEEDBACK = 'experience.add_feedback',
    CHANGE_FEEDBACK = 'experience.change_feedback',
    DELETE_FEEDBACK = 'experience.delete_feedback',

    // Diagnostic permissions
    VIEW_DIAGNOSTIC = 'results.view_diagnosticresult',
    ADD_DIAGNOSTIC = 'results.add_diagnosticresult',
    CHANGE_DIAGNOSTIC = 'results.change_diagnosticresult',

    // Staff permissions
    VIEW_STAFF = 'practitioners.view_practitioner',
    ADD_STAFF = 'practitioners.add_practitioner',
    CHANGE_STAFF = 'practitioners.change_practitioner',
}

/**
 * Role-Permission mapping (default permissions per role)
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    [UserRole.ADMIN]: [
        // Admin has all permissions
        Permission.VIEW_PATIENT,
        Permission.ADD_PATIENT,
        Permission.CHANGE_PATIENT,
        Permission.DELETE_PATIENT,
        Permission.VIEW_APPOINTMENT,
        Permission.ADD_APPOINTMENT,
        Permission.CHANGE_APPOINTMENT,
        Permission.DELETE_APPOINTMENT,
        Permission.VIEW_MEDICATION,
        Permission.ADD_MEDICATION,
        Permission.CHANGE_MEDICATION,
        Permission.DELETE_MEDICATION,
        Permission.VIEW_FEEDBACK,
        Permission.ADD_FEEDBACK,
        Permission.CHANGE_FEEDBACK,
        Permission.DELETE_FEEDBACK,
        Permission.VIEW_DIAGNOSTIC,
        Permission.ADD_DIAGNOSTIC,
        Permission.CHANGE_DIAGNOSTIC,
        Permission.VIEW_STAFF,
        Permission.ADD_STAFF,
        Permission.CHANGE_STAFF,
    ],

    [UserRole.DOCTOR]: [
        Permission.VIEW_PATIENT,
        Permission.CHANGE_PATIENT,
        Permission.VIEW_APPOINTMENT,
        Permission.ADD_APPOINTMENT,
        Permission.CHANGE_APPOINTMENT,
        Permission.VIEW_MEDICATION,
        Permission.ADD_MEDICATION,
        Permission.VIEW_FEEDBACK,
        Permission.VIEW_DIAGNOSTIC,
        Permission.ADD_DIAGNOSTIC,
        Permission.CHANGE_DIAGNOSTIC,
    ],

    [UserRole.NURSE]: [
        Permission.VIEW_PATIENT,
        Permission.CHANGE_PATIENT,
        Permission.VIEW_APPOINTMENT,
        Permission.VIEW_MEDICATION,
        Permission.VIEW_DIAGNOSTIC,
        Permission.VIEW_FEEDBACK,
    ],

    [UserRole.RECEPTIONIST]: [
        Permission.VIEW_PATIENT,
        Permission.ADD_PATIENT,
        Permission.CHANGE_PATIENT,
        Permission.VIEW_APPOINTMENT,
        Permission.ADD_APPOINTMENT,
        Permission.CHANGE_APPOINTMENT,
    ],

    [UserRole.PHARMACIST]: [
        Permission.VIEW_PATIENT,
        Permission.VIEW_MEDICATION,
        Permission.ADD_MEDICATION,
        Permission.CHANGE_MEDICATION,
    ],

    [UserRole.PATIENT]: [
        Permission.VIEW_APPOINTMENT,
        Permission.ADD_FEEDBACK,
    ],
};

/**
 * RBAC utility functions
 */
export const rbac = {
    /**
     * Get current user
     */
    getCurrentUser(): User | null {
        return secureStorage.getUserData();
    },

    /**
     * Check if user has a specific role
     */
    hasRole(role: UserRole): boolean {
        const user = this.getCurrentUser();
        if (!user) return false;

        // Check if user is staff (admin, doctor, nurse, etc.)
        if (role === UserRole.ADMIN) {
            return user.is_staff === true;
        }

        // In production, check user.groups from backend
        // For now, use is_staff as proxy
        return user.is_staff === true;
    },

    /**
     * Check if user has a specific permission
     */
    hasPermission(permission: Permission): boolean {
        const user = this.getCurrentUser();
        if (!user) return false;

        // Admin has all permissions
        if (user.is_staff) {
            return true;
        }

        // In production, check user.permissions from backend
        // For now, use role-based permissions
        const userRole = this.getUserRole();
        if (!userRole) return false;

        const rolePermissions = ROLE_PERMISSIONS[userRole];
        return rolePermissions.includes(permission);
    },

    /**
     * Check if user has any of the specified permissions
     */
    hasAnyPermission(permissions: Permission[]): boolean {
        return permissions.some(permission => this.hasPermission(permission));
    },

    /**
     * Check if user has all of the specified permissions
     */
    hasAllPermissions(permissions: Permission[]): boolean {
        return permissions.every(permission => this.hasPermission(permission));
    },

    /**
     * Get user's role (inferred from permissions)
     */
    getUserRole(): UserRole | null {
        const user = this.getCurrentUser();
        if (!user) return null;

        // In production, get from user.groups
        // For now, infer from is_staff
        if (user.is_staff) {
            return UserRole.ADMIN; // Default to admin for staff
        }

        return UserRole.PATIENT;
    },

    /**
     * Check if user can access a route
     */
    canAccessRoute(requiredPermissions: Permission[]): boolean {
        if (requiredPermissions.length === 0) return true;
        return this.hasAnyPermission(requiredPermissions);
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return this.getCurrentUser() !== null;
    },
};

/**
 * Route permissions configuration
 */
export const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
    '/dqr-health/dashboard': [],
    '/dqr-health/patients': [Permission.VIEW_PATIENT],
    '/dqr-health/patients/new': [Permission.ADD_PATIENT],
    '/dqr-health/patients/:id': [Permission.VIEW_PATIENT],
    '/dqr-health/patients/:id/edit': [Permission.CHANGE_PATIENT],
    '/dqr-health/appointments': [Permission.VIEW_APPOINTMENT],
    '/dqr-health/appointments/new': [Permission.ADD_APPOINTMENT],
    '/dqr-health/pharmacy': [Permission.VIEW_MEDICATION],
    '/dqr-health/pharmacy/new': [Permission.ADD_MEDICATION],
    '/dqr-health/experience': [Permission.VIEW_FEEDBACK],
};
