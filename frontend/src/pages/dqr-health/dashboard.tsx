import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { FaUserMd, FaShieldAlt } from 'react-icons/fa';

export function DashboardPage() {
    const { user, hasRole } = useAuth();
    const navigate = useNavigate();

    // Safety check - though ProtectedRoute should handle this
    if (!user) return null;

    const isPatient = hasRole('Patients');
    const isAdmin = hasRole('Admins');

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-[#004B87] mb-2">
                        Welcome, {user.first_name || user.username}
                    </h1>
                    <p className="text-gray-600 text-lg">
                        You are logged in as: <span className="font-semibold">{user.role}</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Patient Actions */}
                    {isPatient && (
                        <div
                            onClick={() => navigate('/dqr-health/request-access')}
                            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 group"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-[#2774AE] group-hover:text-white transition-colors">
                                    <FaUserMd className="text-2xl text-[#2774AE] group-hover:text-white" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Request Professional Access</h3>
                            <p className="text-gray-600">
                                Are you a healthcare provider? Submit your credentials to access professional features.
                            </p>
                        </div>
                    )}

                    {/* Admin Actions */}
                    {isAdmin && (
                        <div
                            onClick={() => navigate('/dqr-health/admin/credentials')}
                            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 group"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                    <FaShieldAlt className="text-2xl text-purple-600 group-hover:text-white" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Admin Credential Dashboard</h3>
                            <p className="text-gray-600">
                                Review pending professional access requests and manage user roles.
                            </p>
                        </div>
                    )}

                    {/* Placeholder for other dashboard items */}
                    <div className="bg-gray-100 p-6 rounded-xl border border-gray-200 border-dashed flex flex-col items-center justify-center text-center">
                        <p className="text-gray-500 font-medium">More features coming soon...</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
