import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FcGoogle } from 'react-icons/fc';
import { IoClose } from 'react-icons/io5';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const navigate = useNavigate();
    const { login, loginWithGoogle, isLoading } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await login(username, password);
            onClose();
            // Redirect to dashboard after successful login
            navigate('/dqr-health/dashboard');
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 transition-colors">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors z-10"
                >
                    <IoClose size={24} />
                </button>

                {/* Header */}
                <div className="bg-[#2774AE] dark:bg-zinc-800 text-white p-8 pb-6 transition-colors">
                    <h2 className="text-2xl font-bold mb-1">Welcome Back</h2>
                    <p className="text-blue-100 dark:text-gray-400">Sign in to access your portal</p>
                </div>

                <div className="p-8 pt-6">
                    {/* Google OAuth */}
                    <button
                        onClick={loginWithGoogle}
                        className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-700 rounded-lg font-semibold text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:border-[#2774AE] dark:hover:border-brand-accent hover:shadow-md transition-all duration-200 mb-6"
                    >
                        <FcGoogle size={24} />
                        <span>Continue with Google</span>
                    </button>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-zinc-700 transition-colors"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white dark:bg-dark-surface text-gray-500 dark:text-zinc-500 transition-colors">or</span>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1 transition-colors">
                                Email or Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-[#2774AE] dark:focus:ring-brand-accent outline-none transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1 transition-colors">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-[#2774AE] dark:focus:ring-brand-accent outline-none transition-all"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#2774AE] dark:bg-brand-accent text-white py-3 rounded-lg font-semibold hover:bg-[#1e5a8a] dark:hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 text-center space-y-2 text-sm">
                        <Link
                            to="/dqr-health/forgot-password"
                            className="text-[#2774AE] dark:text-brand-accent hover:underline block transition-colors"
                            onClick={onClose}
                        >
                            Forgot password?
                        </Link>
                        <p className="text-gray-600 dark:text-zinc-400">
                            Don't have an account?{' '}
                            <Link
                                to="/dqr-health/register"
                                className="text-[#2774AE] dark:text-brand-accent font-semibold hover:underline transition-colors"
                                onClick={onClose}
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
