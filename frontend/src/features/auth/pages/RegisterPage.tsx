import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FcGoogle } from 'react-icons/fc';

export function RegisterPage() {
    const navigate = useNavigate();
    const { register, loginWithGoogle, isLoading } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: '',
    });
    const [error, setError] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (!acceptedTerms) {
            setError('You must accept the terms and conditions');
            return;
        }

        try {
            await register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                first_name: formData.first_name,
                last_name: formData.last_name,
            });
            navigate('/dqr-health/dashboard');
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-dark-bg dark:to-dark-bg flex items-center justify-center p-4 transition-colors">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="bg-[#2774AE] dark:bg-zinc-800 text-white p-8 rounded-t-2xl transition-colors">
                    <h1 className="text-3xl font-bold mb-2">Join DQR Health</h1>
                    <p className="text-blue-100 dark:text-gray-400">Create your account</p>
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

                    {/* Registration Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1 transition-colors">
                                    First Name
                                </label>
                                <input
                                    id="first_name"
                                    name="first_name"
                                    type="text"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-[#2774AE] dark:focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                                    placeholder="John"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1 transition-colors">
                                    Last Name
                                </label>
                                <input
                                    id="last_name"
                                    name="last_name"
                                    type="text"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-[#2774AE] dark:focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                                    placeholder="Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1 transition-colors">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-[#2774AE] dark:focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                                placeholder="john.doe@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1 transition-colors">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-[#2774AE] dark:focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                                placeholder="johndoe"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1 transition-colors">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-[#2774AE] dark:focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                                placeholder="At least 8 characters"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1 transition-colors">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-[#2774AE] dark:focus:ring-brand-accent focus:border-transparent outline-none transition-all"
                                placeholder="Re-enter password"
                                required
                            />
                        </div>

                        {/* Important Notice (ADR 0002) */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 transition-colors">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                <strong>Note:</strong> All new accounts start as <strong>Patient</strong>. Healthcare
                                professionals can request elevated access after registration.
                            </p>
                        </div>

                        <div className="flex items-start">
                            <input
                                id="terms"
                                type="checkbox"
                                checked={acceptedTerms}
                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                                className="h-4 w-4 mt-1 text-[#2774AE] dark:text-brand-accent focus:ring-[#2774AE] dark:focus:ring-brand-accent border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900"
                            />
                            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-zinc-300 transition-colors">
                                I agree to the{' '}
                                <Link to="/terms" className="text-[#2774AE] dark:text-brand-accent hover:underline">
                                    Terms and Conditions
                                </Link>{' '}
                                and{' '}
                                <Link to="/privacy" className="text-[#2774AE] dark:text-brand-accent hover:underline">
                                    Privacy Policy
                                </Link>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#2774AE] dark:bg-brand-accent text-white py-3 rounded-lg font-semibold hover:bg-[#1e5a8a] dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-zinc-400 transition-colors">
                            Already have an account?{' '}
                            <Link to="/dqr-health/login" className="text-[#2774AE] dark:text-brand-accent font-semibold hover:underline transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
