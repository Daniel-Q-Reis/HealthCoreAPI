
import { ReactNode, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { LoginModal } from '@/features/auth/components/LoginModal';

interface MainLayoutProps {
    children: ReactNode;
}

import { SecurityModal } from '@/shared/components/SecurityModal';
import { HeaderDropdown } from '@/shared/components/HeaderDropdown';

export function MainLayout({ children }: MainLayoutProps) {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState<{ isOpen: boolean, title: string, url: string }>(
        { isOpen: false, title: '', url: '' }
    );

    const openModal = (title: string, url: string) => {
        setModalConfig({ isOpen: true, title, url });
    };

    const handleLogout = () => {
        logout();
        navigate('/dqr-health/login');
    };

    useEffect(() => {
        const controlNavbar = () => {
            if (typeof window !== 'undefined') {
                const currentScrollY = window.scrollY;

                // Show if scrolling up or at the very top (within bounce range)
                // Hide if scrolling down AND past the threshold (100px)
                if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    setIsVisible(false);
                } else {
                    setIsVisible(true);
                }

                setLastScrollY(currentScrollY);
            }
        };

        window.addEventListener('scroll', controlNavbar);

        return () => {
            window.removeEventListener('scroll', controlNavbar);
        };
    }, [lastScrollY]);

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
            />
            {/* Navigation */}
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full shadow-none'
                    }`}
            >
                {/* Top Bar - Dark Blue */}
                <div className="bg-[#003B5C] text-white">
                    <div className="container mx-auto px-4">
                        <div className="flex justify-between items-center py-2 text-sm">
                            <div className="flex gap-6">
                                <a href="#" className="hover:text-gray-200 hidden md:block">Explore DQR Health</a>
                                <Link to="/dqr-health" className="hover:text-gray-200 font-semibold">myDQRHealth</Link>
                                <HeaderDropdown
                                    title="News & Insights"
                                    className="hidden md:block"
                                    items={[
                                        {
                                            label: "Latest Health News (BBC)",
                                            href: "https://www.bbc.com/news/health",
                                            target: "_blank",
                                            rel: "noopener noreferrer"
                                        },
                                        {
                                            label: "HIPAA Compliance (Video)",
                                            onClick: () => openModal('HIPAA Compliance', 'https://www.youtube.com/watch?v=s9znUYvVO4A')
                                        },
                                        {
                                            label: "Security & RBAC (Video)",
                                            onClick: () => openModal('Role-Based Access Control', 'https://www.youtube.com/watch?v=fxa8Jo1ViqA')
                                        }
                                    ]}
                                />
                                <HeaderDropdown
                                    title="Contact Us"
                                    className="hidden md:block"
                                    items={[
                                        {
                                            label: "📧 Mail Us",
                                            href: "mailto:danielqreis@gmail.com"
                                        },
                                        {
                                            label: "📱 WhatsApp",
                                            href: "https://wa.me/5535991902471",
                                            target: "_blank",
                                            rel: "noopener noreferrer"
                                        }
                                    ]}
                                />
                            </div>
                            <div className="flex gap-4 items-center">
                                <span className="hidden md:inline">📞 +55 (35) 99190-2471</span>
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
                            <div className="hidden md:flex gap-8 text-[#003B5C] font-medium items-center">
                                {/* Dynamic Area Button */}
                                {isAuthenticated && user && (
                                    <Link
                                        to="/dqr-health/dashboard"
                                        className="bg-[#E6F0F9] text-[#003B5C] px-4 py-2 rounded-full font-bold hover:bg-[#D1E6F5] transition flex items-center gap-2"
                                    >
                                        <span className="text-xl">🏥</span>
                                        {user.role === 'Patients' ? 'Patient Area' :
                                            user.role === 'Admins' ? 'Admin Area' :
                                                user.role === 'Doctors' ? 'Doctor Area' : 'My Area'}
                                    </Link>
                                )}

                                <Link to="/dqr-health/dashboard" className="hover:text-[#0066CC] transition">Patient Resources</Link>
                                <Link to="/dqr-health/results" className="hover:text-[#0066CC] transition">Treatment Options</Link>
                                <Link to="/dqr-health/schedule" className="hover:text-[#0066CC] transition">Locations</Link>
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
                                        <button
                                            onClick={() => setIsLoginModalOpen(true)}
                                            className="border-2 border-[#2774AE] text-[#2774AE] px-6 py-2 rounded font-semibold hover:bg-[#2774AE] hover:text-white transition"
                                        >
                                            Sign In
                                        </button>
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
                                <li>
                                    <button
                                        onClick={() => openModal('HIPAA Compliance', 'https://www.youtube.com/watch?v=s9znUYvVO4A')}
                                        className="hover:text-blue-300 transition text-left"
                                    >
                                        HIPAA Compliance (Video)
                                    </button>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">About</h4>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li><a href="#" className="hover:text-white">About Us</a></li>
                                <li><a href="#" className="hover:text-white">Careers</a></li>
                                <li>
                                    <button
                                        onClick={() => openModal('Role-Based Access Control', 'https://www.youtube.com/watch?v=fxa8Jo1ViqA')}
                                        className="hover:text-blue-300 transition text-left"
                                    >
                                        Security & RBAC (Video)
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-gray-300">
                        <p>© 2025 Daniel de Queiroz Reis Tecnologia da Informação LTDA (Royal Tech)</p>
                        <p className="mt-2">CNPJ: 63.419.534/0001-77 | São Paulo, Brazil</p>
                    </div>
                </div>
            </footer>

            <SecurityModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                title={modalConfig.title}
                videoUrl={modalConfig.url}
            />
        </div>
    );
}
