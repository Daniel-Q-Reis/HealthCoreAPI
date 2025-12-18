import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { secureStorage } from '@/shared/api/security';
import { useAuth } from '../hooks/useAuth';

/**
 * OAuth Callback Page
 *
 * This page handles the OAuth callback after successful Google authentication.
 * It extracts JWT tokens from URL parameters and saves them to localStorage.
 */
export function OAuthCallbackPage() {
    const navigate = useNavigate();
    const { verifyAuth } = useAuth();

    useEffect(() => {
        const handleOAuthCallback = async () => {
            try {
                // Extract tokens from URL parameters
                const params = new URLSearchParams(window.location.search);
                const accessToken = params.get('access');
                const refreshToken = params.get('refresh');

                if (!accessToken || !refreshToken) {
                    throw new Error('Missing tokens in OAuth callback');
                }

                // Save tokens to secure storage
                secureStorage.setAccessToken(accessToken);
                secureStorage.setRefreshToken(refreshToken);

                // Fetch user data and update auth context
                // We must call verifyAuth to ensure AuthProvider updates its state
                // BEFORE we navigate to protected routes
                await verifyAuth();

                // Redirect to dashboard
                navigate('/dqr-health/dashboard', { replace: true });
            } catch (error) {
                console.error('OAuth callback error:', error);
                // Redirect to login on error
                navigate('/dqr-health/login', { replace: true });
            }
        };

        handleOAuthCallback();
    }, [navigate, verifyAuth]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#2774AE] mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Completing sign in...</p>
            </div>
        </div>
    );
}
