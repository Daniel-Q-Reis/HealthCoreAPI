import { useState, useEffect } from 'react';
import type { HealthCheckResponse } from '../types/api';

export const useHealthCheck = () => {
    const [data, setData] = useState<HealthCheckResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const response = await fetch('/health');
                if (!response.ok) throw new Error('Health check failed');
                const json = await response.json();
                setData(json);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchHealth();
        const interval = setInterval(fetchHealth, 30000); // Refresh every 30s

        return () => clearInterval(interval);
    }, []);

    return { data, loading, error };
};
