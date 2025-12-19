
import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface MainLayoutProps {
    children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/dqr-health/login');
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50">
                {/* Top Bar - Dark Blue */}
                <div className="bg-[#003B5C] text-white">
                    <div className="container mx-auto px-4">
                        <div className="flex justify-between items-center py-2 text-sm">
                            <div className="flex gap-6">
                                <a href="#" className="hover:text-gray-200 hidden md:block">Explore DQR Health</a>
                                <Link to="/dqr-health/dashboard" className="hover:text-gray-200 font-semibold">myDQRHealth</Link>
                                <a href="#" className="hover:text-gray-200 hidden md:block">News & Insights</a>
                                <a href="#" className="hover:text-gray-200 hidden md:block">Contact Us</a>
                            </div>
                            <div className="flex gap-4 items-center">
                                <span className="hidden md:inline">📞 +55 (11) 9999-9999</span>
                                <button className="hover:text-gray-200 hidden md:inline">🌐 Translate</button>
                                <button className="hover:text-gray-200">🔍 Search</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Nav - White Background */}
                <div className="bg-white border-b border-gray-200 shadow-sm">
                    <div className="container mx-auto px-4">
                        <div className="flex justify-between items-center py-4">
                            <Link to="/dqr-health" className="flex items-center gap-2 group">
                                <div className="text-2xl font-bold text-[#003B5C] group-hover:text-[#005a8c] transition">DQR</div>
                                <div className="text-xl text-[#0066CC] group-hover:text-[#0088ff] transition">Health</div>
                            </Link>

                            {/* Desktop Menu */}
                            <div className="hidden md:flex gap-8 text-[#003B5C] font-medium">
                                <Link to="/dqr-health/dashboard" className="hover:text-[#0066CC] transition">Find Care</Link>
                                <a href="#" className="hover:text-[#0066CC] transition">Patient Resources</a>
                                <a href="#" className="hover:text-[#0066CC] transition">Treatment Options</a>
                                <a href="#" className="hover:text-[#0066CC] transition">Locations</a>
                            </div>

                            <div className="flex gap-3 items-center">
                                {isAuthenticated ? (
                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden sm:block">
                                            <div className="text-sm font-bold text-[#003B5C]">{user?.first_name || user?.username}</div>
                                            <div className="text-xs text-gray-500">{user?.role}</div>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="border border-[#003B5C] text-[#003B5C] px-4 py-2 rounded hover:bg-gray-50 transition text-sm font-semibold"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Link
                                            to="/dqr-health/login"
                                            className="border-2 border-[#2774AE] text-[#2774AE] px-6 py-2 rounded font-semibold hover:bg-[#2774AE] hover:text-white transition"
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            to="/dqr-health/register"
                                            className="bg-[#2774AE] text-white px-6 py-2 rounded font-semibold hover:bg-[#1e5a8a] transition shadow-sm hidden sm:block"
                                        >
                                            Create Account
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Spacer for fixed header */}
            <div className="h-[108px]"></div>

            {/* Main Content */}
            <main className="flex-grow">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-[#003366] text-white py-12 mt-auto">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="font-bold text-xl mb-4">DQR Health</h3>
                            <p className="text-gray-300 text-sm">
                                Advanced Healthcare with AI-Powered Intelligence
                            </p>
                            <p className="text-gray-300 text-sm mt-4">
                                São Paulo, Brazil
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Find Care</h4>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li><a href="#" className="hover:text-white">Find a Doctor</a></li>
                                <li><a href="#" className="hover:text-white">Locations</a></li>
                                <li><a href="#" className="hover:text-white">Appointments</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Patient Resources</h4>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li><a href="#" className="hover:text-white">Patient Portal</a></li>
                                <li><a href="#" className="hover:text-white">Medical Records</a></li>
                                <li><a href="#" className="hover:text-white">Billing</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">About</h4>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li><a href="#" className="hover:text-white">About Us</a></li>
                                <li><a href="#" className="hover:text-white">Careers</a></li>
                                <li><a href="#" className="hover:text-white">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-gray-300">
                        <p>© 2025 Daniel de Queiroz Reis Tecnologia da Informação LTDA (Royal Tech)</p>
                        <p className="mt-2">CNPJ: 63.419.534/0001-77 | São Paulo, Brazil</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
