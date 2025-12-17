/**
 * Security Tests
 *
 * Unit tests for security functions
 * Run with: npm test
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { secureStorage, auditLogger } from '../security';
import {
    sanitizeString,
    sanitizeEmail,
    sanitizePhone,
    isValidEmail,
    isValidPhone,
    isValidDate,
    validatePatientData,
    rateLimiter,
} from '../validation';
import { rbac, UserRole, Permission } from '../rbac';

describe('Secure Storage', () => {
    beforeEach(() => {
        // Clear storage before each test
        secureStorage.clearAll();
        sessionStorage.clear();
        localStorage.clear();
    });

    afterEach(() => {
        secureStorage.clearAll();
    });

    it('should store and retrieve access token', () => {
        const token = 'test-access-token-123';
        secureStorage.setAccessToken(token);

        const retrieved = secureStorage.getAccessToken();
        expect(retrieved).toBe(token);
    });

    it('should encrypt tokens in storage', () => {
        const token = 'test-token';
        secureStorage.setAccessToken(token);

        // Check that raw storage is encrypted (not plaintext)
        const raw = sessionStorage.getItem('hc_access_token');
        expect(raw).not.toBe(token);
        expect(raw).toBeTruthy();
    });

    it('should expire access token after 15 minutes', () => {
        const token = 'test-token';
        secureStorage.setAccessToken(token);

        // Manually set expiry to past
        sessionStorage.setItem('hc_access_token_expiry', (Date.now() - 1000).toString());

        const retrieved = secureStorage.getAccessToken();
        expect(retrieved).toBeNull();
    });

    it('should store and retrieve refresh token', () => {
        const token = 'test-refresh-token-456';
        secureStorage.setRefreshToken(token);

        const retrieved = secureStorage.getRefreshToken();
        expect(retrieved).toBe(token);
    });

    it('should store and retrieve user data', () => {
        const user = {
            id: '123',
            username: 'testuser',
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User',
            is_staff: true,
        };

        secureStorage.setUserData(user);
        const retrieved = secureStorage.getUserData();

        expect(retrieved).toEqual(user);
    });

    it('should clear all data', () => {
        secureStorage.setAccessToken('access');
        secureStorage.setRefreshToken('refresh');
        secureStorage.setUserData({ id: '1', username: 'test' });

        secureStorage.clearAll();

        expect(secureStorage.getAccessToken()).toBeNull();
        expect(secureStorage.getRefreshToken()).toBeNull();
        expect(secureStorage.getUserData()).toBeNull();
    });

    it('should validate token existence', () => {
        expect(secureStorage.isValid()).toBe(false);

        secureStorage.setAccessToken('token');
        expect(secureStorage.isValid()).toBe(true);

        secureStorage.clearAll();
        expect(secureStorage.isValid()).toBe(false);
    });
});

describe('Audit Logger', () => {
    beforeEach(() => {
        auditLogger.clearLogs();
    });

    it('should log events', () => {
        auditLogger.log('TEST_EVENT', { data: 'test' });

        const logs = auditLogger.getLogs();
        expect(logs.length).toBe(1);
        expect(logs[0].event).toBe('TEST_EVENT');
        expect(logs[0].details.data).toBe('test');
    });

    it('should include timestamp in logs', () => {
        auditLogger.log('TEST_EVENT');

        const logs = auditLogger.getLogs();
        expect(logs[0].timestamp).toBeTruthy();
    });

    it('should limit logs to 100 entries', () => {
        for (let i = 0; i < 150; i++) {
            auditLogger.log(`EVENT_${i}`);
        }

        const logs = auditLogger.getLogs();
        expect(logs.length).toBe(100);
    });
});

describe('Input Sanitization', () => {
    it('should remove HTML tags', () => {
        const dirty = '<p>Hello <b>World</b></p>';
        const clean = sanitizeString(dirty);
        expect(clean).toBe('Hello World');
    });

    it('should remove script tags', () => {
        const dirty = '<script>alert("XSS")</script>Hello';
        const clean = sanitizeString(dirty);
        expect(clean).toBe('Hello');
    });

    it('should remove event handlers', () => {
        const dirty = '<div onclick="alert()">Click</div>';
        const clean = sanitizeString(dirty);
        expect(clean).toBe('Click');
    });

    it('should remove javascript: protocol', () => {
        const dirty = 'javascript:alert("XSS")';
        const clean = sanitizeString(dirty);
        expect(clean).toBe('alert("XSS")');
    });

    it('should sanitize email', () => {
        const email = '  TEST@EXAMPLE.COM  ';
        const clean = sanitizeEmail(email);
        expect(clean).toBe('test@example.com');
    });

    it('should sanitize phone', () => {
        const phone = '(555) 123-4567';
        const clean = sanitizePhone(phone);
        expect(clean).toBe('555123-4567'); // Removes parentheses and spaces, keeps digits and hyphens
    });
});

describe('Input Validation', () => {
    it('should validate correct email', () => {
        expect(isValidEmail('test@example.com')).toBe(true);
        expect(isValidEmail('user.name+tag@example.co.uk')).toBe(true);
    });

    it('should reject invalid email', () => {
        expect(isValidEmail('invalid')).toBe(false);
        expect(isValidEmail('test@')).toBe(false);
        expect(isValidEmail('@example.com')).toBe(false);
    });

    it('should validate correct phone', () => {
        expect(isValidPhone('555-123-4567')).toBe(true);
        expect(isValidPhone('(555) 123-4567')).toBe(true);
        expect(isValidPhone('+1 555 123 4567')).toBe(true);
    });

    it('should reject invalid phone', () => {
        expect(isValidPhone('123')).toBe(false);
        expect(isValidPhone('abc-def-ghij')).toBe(false);
    });

    it('should validate correct date', () => {
        expect(isValidDate('2024-01-15')).toBe(true);
        expect(isValidDate('1990-12-31')).toBe(true);
    });

    it('should reject invalid date', () => {
        expect(isValidDate('2024-13-01')).toBe(false);
        expect(isValidDate('2024/01/15')).toBe(false);
        expect(isValidDate('invalid')).toBe(false);
    });

    it('should validate patient data', () => {
        const validData = {
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            phone: '555-123-4567',
            date_of_birth: '1990-01-15',
            gender: 'M',
        };

        const result = validatePatientData(validData);
        expect(result.valid).toBe(true);
        expect(result.errors.length).toBe(0);
    });

    it('should reject invalid patient data', () => {
        const invalidData = {
            first_name: 'J',  // Too short
            last_name: 'D',   // Too short
            email: 'invalid', // Invalid email
            phone: '123',     // Invalid phone
            date_of_birth: 'invalid', // Invalid date
            gender: 'X',      // Invalid gender
        };

        const result = validatePatientData(invalidData);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    });
});

describe('Rate Limiter', () => {
    it('should allow requests within limit', () => {
        for (let i = 0; i < 30; i++) {
            expect(rateLimiter.canMakeRequest('test')).toBe(true);
        }
    });

    it('should block requests over limit', () => {
        for (let i = 0; i < 30; i++) {
            rateLimiter.canMakeRequest('test');
        }

        expect(rateLimiter.canMakeRequest('test')).toBe(false);
    });

    it('should reset after time window', async () => {
        // This test would need to wait 60 seconds in real scenario
        // For unit test, we can test the reset function
        for (let i = 0; i < 30; i++) {
            rateLimiter.canMakeRequest('test');
        }

        rateLimiter.reset('test');
        expect(rateLimiter.canMakeRequest('test')).toBe(true);
    });
});

describe('RBAC', () => {
    beforeEach(() => {
        secureStorage.clearAll();
    });

    it('should check if user is authenticated', () => {
        expect(rbac.isAuthenticated()).toBe(false);

        secureStorage.setUserData({ id: '1', username: 'test', is_staff: false });
        expect(rbac.isAuthenticated()).toBe(true);
    });

    it('should check admin role', () => {
        secureStorage.setUserData({ id: '1', username: 'admin', is_staff: true });
        expect(rbac.hasRole(UserRole.ADMIN)).toBe(true);
    });

    it('should check permissions for admin', () => {
        secureStorage.setUserData({ id: '1', username: 'admin', is_staff: true });

        expect(rbac.hasPermission(Permission.VIEW_PATIENT)).toBe(true);
        expect(rbac.hasPermission(Permission.ADD_PATIENT)).toBe(true);
        expect(rbac.hasPermission(Permission.DELETE_PATIENT)).toBe(true);
    });

    it('should check permissions for non-staff', () => {
        secureStorage.setUserData({ id: '1', username: 'patient', is_staff: false });

        expect(rbac.hasPermission(Permission.VIEW_APPOINTMENT)).toBe(true);
        expect(rbac.hasPermission(Permission.ADD_FEEDBACK)).toBe(true);
        expect(rbac.hasPermission(Permission.DELETE_PATIENT)).toBe(false);
    });

    it('should check route access', () => {
        secureStorage.setUserData({ id: '1', username: 'admin', is_staff: true });

        expect(rbac.canAccessRoute([Permission.VIEW_PATIENT])).toBe(true);
        expect(rbac.canAccessRoute([])).toBe(true);
    });
});
