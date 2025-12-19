
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { MainLayout } from '@/shared/layout/MainLayout';
import {
    FaUserMd,
    FaShieldAlt,
    FaNotesMedical,
    FaFlask,
    FaCalendarCheck,
    FaBell
} from 'react-icons/fa';

export function DashboardPage() {
    const { user, hasRole } = useAuth();
    const navigate = useNavigate();

    // Safety check
    if (!user) return null;

    const isPatient = hasRole('Patients');
    const isAdmin = hasRole('Admins');

    return (
        <MainLayout>
            <div className="bg-gray-50 min-h-screen pb-16">

                {/* Dashboard Header / Hero */}
                <div className="bg-[#003B5C] text-white py-12 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <img
                            src="/images/main_hall.png"
                            alt="Background"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div>
                                <div className="text-[#FFD100] font-semibold mb-2 uppercase tracking-wider text-sm">
                                    Patient Portal
                                </div>
                                <h1 className="text-4xl font-bold mb-2">
                                    Welcome back, {user.first_name || user.username}
                                </h1>
                                <p className="text-blue-100 text-lg">
                                    Manage your health journey with our AI-powered tools.
                                </p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 flex items-center gap-4">
                                <div className="bg-[#FFD100] text-[#003B5C] p-3 rounded-full">
                                    <FaBell className="text-xl" />
                                </div>
                                <div>
                                    <div className="font-bold">2 Notifications</div>
                                    <div className="text-sm text-gray-200">You have upcoming updates</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 -mt-8 relative z-20">
                    {/* Role Badge */}
                    <div className="inline-block bg-white text-[#003B5C] px-6 py-2 rounded-full shadow-lg font-bold border-2 border-[#003B5C] mb-8">
                        Logged in as: <span className="text-[#0066CC]">{user.role}</span>
                    </div>

                    {/* Stats / Quick Overview Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                            <div className="text-gray-500 text-sm mb-1">Upcoming Appointments</div>
                            <div className="text-3xl font-bold text-[#003B5C]">0</div>
                            <div className="text-xs text-green-600 mt-2 font-medium">No appointments scheduled</div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                            <div className="text-gray-500 text-sm mb-1">Active Prescriptions</div>
                            <div className="text-3xl font-bold text-[#003B5C]">0</div>
                            <div className="text-xs text-gray-400 mt-2">View details</div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                            <div className="text-gray-500 text-sm mb-1">Test Results</div>
                            <div className="text-3xl font-bold text-[#003B5C]">0</div>
                            <div className="text-xs text-blue-600 mt-2 font-medium">New results available</div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                            <div className="text-gray-500 text-sm mb-1">Health Score</div>
                            <div className="text-3xl font-bold text-[#00A651]">98</div>
                            <div className="text-xs text-green-600 mt-2 font-medium">Excellent condition</div>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-[#003B5C] mb-6 border-l-4 border-[#FFD100] pl-4">
                        Quick Actions
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {/* Request Professional Access - Highlighted */}
                        {isPatient && (
                            <div
                                onClick={() => navigate('/dqr-health/request-access')}
                                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer border-t-4 border-[#2774AE] group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                                    <FaUserMd className="text-9xl text-[#2774AE]" />
                                </div>
                                <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
                                    <FaUserMd className="text-2xl text-[#2774AE]" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Are you a Provider?</h3>
                                <p className="text-gray-600 mb-4 z-10 relative">
                                    Request professional access to manage patients, schedule appointments, and update medical records.
                                </p>
                                <span className="text-[#2774AE] font-semibold group-hover:underline">Request Access →</span>
                            </div>
                        )}

                        {/* Admin Dashboard */}
                        {isAdmin && (
                            <div
                                onClick={() => navigate('/dqr-health/admin/credentials')}
                                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer border-t-4 border-purple-600 group"
                            >
                                <div className="bg-purple-50 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
                                    <FaShieldAlt className="text-2xl text-purple-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Admin Dashboard</h3>
                                <p className="text-gray-600 mb-4">
                                    Review pending professional access requests, manage user roles and system settings.
                                </p>
                                <span className="text-purple-600 font-semibold group-hover:underline">Manage System →</span>
                            </div>
                        )}

                        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 group">
                            <div className="bg-green-50 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-100 transition">
                                <FaCalendarCheck className="text-2xl text-[#00A651]" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Schedule Appointment</h3>
                            <p className="text-gray-600 mb-4">Book a consultation with our specialists.</p>
                            <span className="text-sm font-medium text-gray-400">Coming Soon</span>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 group">
                            <div className="bg-yellow-50 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-yellow-100 transition">
                                <FaFlask className="text-2xl text-[#FFD100]" />
                            </div>
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Lab Results</h3>
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">NEW</span>
                            </div>
                            <p className="text-gray-600 mb-4">View your recent blood work and imaging.</p>
                            <span className="text-sm font-medium text-gray-400">Coming Soon</span>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 group">
                            <div className="bg-red-50 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-red-100 transition">
                                <FaNotesMedical className="text-2xl text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">My Records</h3>
                            <p className="text-gray-600 mb-4">Access your complete medical history.</p>
                            <span className="text-sm font-medium text-gray-400">Coming Soon</span>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
