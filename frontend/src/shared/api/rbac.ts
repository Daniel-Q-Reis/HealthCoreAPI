/**
 * Role-Based Access Control (RBAC) Support
 *
 * Integrates with Django backend permissions
 * Backend has 4 roles: Admins, Doctors, Nurses, Patients
 * Frontend adds 2 convenience roles: Receptionist, Pharmacist (can be mapped to backend groups later)
 */

import { secureStorage } from './security';
import { User } from './types';

/**
 * User roles (aligned with Django groups in src/apps/core/fixtures/roles.json)
 * Backend roles: Admins, Doctors, Nurses, Patients
 * Frontend extensions: Receptionist, Pharmacist (for future use)
 */
export enum UserRole {
    ADMIN = 'Admins',        // Backend group name
    DOCTOR = 'Doctors',      // Backend group name
    NURSE = 'Nurses',        // Backend group name
    PATIENT = 'Patients',    // Backend group name
    RECEPTIONIST = 'Receptionists', // Future backend group
    PHARMACIST = 'Pharmacists',     // Future backend group
}

/**
 * Permissions (from Django permissions)
 * These align with Django's permission system
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
 * Role-Permission mapping (aligned with backend permissions.py)
 * Based on src/apps/core/permissions.py:
 * - Admins: Full access
 * - Doctors: Medical records, diagnostics, prescriptions
 * - Nurses: Patient care, vitals, limited access
 * - Patients: Read-only own records
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    // Admins: Full system access (IsAdmin permission class)
    [UserRole.ADMIN]: [
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

    // Doctors: Medical records, diagnostics, prescriptions (IsDoctor permission class)
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

    // Nurses: Patient care, vitals, limited access (IsNurse permission class)
    [UserRole.NURSE]: [
        Permission.VIEW_PATIENT,
        Permission.CHANGE_PATIENT, // For vitals updates
        Permission.VIEW_APPOINTMENT,
        Permission.VIEW_MEDICATION,
        Permission.VIEW_DIAGNOSTIC,
        Permission.VIEW_FEEDBACK,
    ],

    // Patients: Read-only own records (IsPatient permission class)
    [UserRole.PATIENT]: [
        Permission.VIEW_APPOINTMENT,
        Permission.ADD_FEEDBACK,
    ],

    // Future roles (not in backend yet)
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
};

/**
 * RBAC utility functions
 * Integrates with Django backend permission system
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
     * Checks against Django groups (user.groups)
     */
    hasRole(role: UserRole): boolean {
        const user = this.getCurrentUser();
        if (!user) return false;

        // In production, user.groups will come from backend
        // For now, check is_staff for admin
        if (role === UserRole.ADMIN) {
            return user.is_staff === true;
        }

        // TODO: When backend sends user.groups, check:
        // return user.groups?.includes(role) || false;

        return user.is_staff === true; // Temporary: staff = medical staff
    },

    /**
     * Check if user is medical staff (Doctor OR Nurse)
     * Aligns with backend IsMedicalStaff permission class
     */
    isMedicalStaff(): boolean {
        return this.hasRole(UserRole.DOCTOR) || this.hasRole(UserRole.NURSE);
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

        // TODO: When backend sends user.permissions, check:
        // return user.permissions?.includes(permission) || false;

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
     * Get user's role (inferred from backend groups)
     */
    getUserRole(): UserRole | null {
        const user = this.getCurrentUser();
        if (!user) return null;

        // TODO: When backend sends user.groups, return first group:
        // return user.groups?.[0] as UserRole || null;

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
 * Maps routes to required permissions
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
