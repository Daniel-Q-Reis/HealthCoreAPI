import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FcGoogle } from 'react-icons/fc';

export function LoginPage() {
    const navigate = useNavigate();
    const { login, loginWithGoogle, isLoading, isAuthenticated } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dqr-health/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await login(username, password);
            navigate('/dqr-health/dashboard');
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-dark-bg dark:to-dark-bg flex items-center justify-center p-4 transition-colors">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="bg-[#2774AE] dark:bg-zinc-800 text-white p-8 rounded-t-2xl transition-colors">
                    <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                    <p className="text-blue-100 dark:text-gray-400">Sign in to DQR Health</p>
                </div>

                {/* Form Container */}
                <div className="bg-white dark:bg-dark-surface p-8 rounded-b-2xl shadow-xl transition-colors">
                    {/* Google OAuth Button - Primary CTA */}
                    <button
                        onClick={loginWithGoogle}
                        className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-700 rounded-lg font-semibold text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:border-[#2774AE] dark:hover:border-brand-accent hover:shadow-md transition-all duration-200 mb-6"
                    >
                        <FcGoogle size={24} />
                        <span>Continue with Google</span>
                    </button>

                    {/* Divider */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-zinc-700 transition-colors"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white dark:bg-dark-surface text-gray-500 dark:text-zinc-500 transition-colors">or</span>
                        </div>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Traditional Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1 transition-colors">
                                Email or Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-[#2774AE] dark:focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                                placeholder="Enter your email or username"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1 transition-colors">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-[#2774AE] dark:focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 text-[#2774AE] dark:text-brand-accent focus:ring-[#2774AE] dark:focus:ring-brand-accent border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-zinc-300 transition-colors">
                                Remember me
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#2774AE] dark:bg-brand-accent text-white py-3 rounded-lg font-semibold hover:bg-[#1e5a8a] dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-6 text-center space-y-2">
                        <Link
                            to="/dqr-health/forgot-password"
                            className="text-sm text-[#2774AE] dark:text-brand-accent hover:underline block transition-colors"
                        >
                            Forgot password?
                        </Link>
                        <p className="text-sm text-gray-600 dark:text-zinc-400 transition-colors">
                            Don't have an account?{' '}
                            <Link to="/dqr-health/register" className="text-[#2774AE] dark:text-brand-accent font-semibold hover:underline transition-colors">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="mt-8 text-center">
                    <Link to="/dqr-health" className="text-sm text-gray-500 hover:text-gray-700 dark:text-zinc-500 dark:hover:text-zinc-300 font-medium transition-colors">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
