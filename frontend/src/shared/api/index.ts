// Export all API clients and types
export * from './config';
export * from './types';
export * from './errors';
export * from './auth';
export * from './patients';
export * from './appointments';
export * from './pharmacy';
export * from './experience';

// Re-export commonly used items
export { apiClient } from './config';
export { authApi } from './auth';
export { patientsApi } from './patients';
export { appointmentsApi } from './appointments';
export { pharmacyApi } from './pharmacy';
export { experienceApi } from './experience';
