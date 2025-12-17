import api from './api';

export interface Patient {
    id: number;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: string;
    email: string;
    phone: string;
    address?: string;
    created_at: string;
    updated_at: string;
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export const patientsService = {
    async getAll(page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<Patient>> {
        const response = await api.get<PaginatedResponse<Patient>>('/api/v1/patients/', {
            params: { page, page_size: pageSize },
        });
        return response.data;
    },

    async getById(id: number): Promise<Patient> {
        const response = await api.get<Patient>(`/api/v1/patients/${id}/`);
        return response.data;
    },

    async create(patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Promise<Patient> {
        const response = await api.post<Patient>('/api/v1/patients/', patient);
        return response.data;
    },

    async update(id: number, patient: Partial<Patient>): Promise<Patient> {
        const response = await api.patch<Patient>(`/api/v1/patients/${id}/`, patient);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/api/v1/patients/${id}/`);
    },

    async search(query: string): Promise<PaginatedResponse<Patient>> {
        const response = await api.get<PaginatedResponse<Patient>>('/api/v1/patients/', {
            params: { search: query },
        });
        return response.data;
    },
};
