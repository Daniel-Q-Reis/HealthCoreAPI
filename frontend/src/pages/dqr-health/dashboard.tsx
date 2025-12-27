import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientApi } from '@/features/patients/api';
import { schedulingApi } from '@/features/scheduling/api';
import { CompleteProfileForm } from '@/features/patients/components/CompleteProfileForm';
import { AppointmentListModal } from '@/features/scheduling/components/AppointmentListModal';
import { Patient } from '@/features/patients/types';
import { Appointment } from '@/features/scheduling/types';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { MainLayout } from '@/shared/layout/MainLayout';
import {
    FaUserMd,
    FaShieldAlt,
    FaNotesMedical,
    FaFlask,
    FaCalendarCheck,
    FaBell,
    FaPills
} from 'react-icons/fa';

export const DashboardPage = () => {
    const { user, hasRole, hasAnyRole } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<Patient | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isAppointmentsModalOpen, setIsAppointmentsModalOpen] = useState(false);

    // Initial Data Fetch
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Parallel fetch for speed
                const [profileData, appointmentsData] = await Promise.all([
                    patientApi.getMyProfile().catch(() => null), // Allow profile fail (404)
                    schedulingApi.getAppointments().catch(() => []) // Allow appointments fail
                ]);

                setProfile(profileData);
                setAppointments(appointmentsData || []);
            } catch (error) {
                console.error("Dashboard data load failed", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleProfileCreated = (newProfile: Patient) => {
        setProfile(newProfile);
    };

    if (!user) return null;

    const isAdmin = hasRole('Admins');
    const isMedicalStaff = hasAnyRole(['Doctors', 'Nurses', 'Pharmacists']);
    // If they are not staff/admin, they are a Patient (or potential patient)
    const isPatientUser = !isMedicalStaff && !isAdmin;

    return (
        <MainLayout>
            <div className="bg-gray-50 min-h-screen pb-16">

                {/* 1. HERO SECTION (Restored) */}
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
                                    Welcome back, {profile ? profile.given_name : (user.first_name || user.username)}
                                </h1>
                                <p className="text-blue-100 text-lg">
                                    Manage your health journey with our AI-powered tools.
                                </p>
                            </div>

                            {/* Notification / Profile Status */}
                            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 flex items-center gap-4">
                                <div className={`${profile ? 'bg-[#FFD100] text-[#003B5C]' : 'bg-red-500 text-white'} p-3 rounded-full`}>
                                    <FaBell className="text-xl" />
                                </div>
                                <div>
                                    <div className="font-bold">{profile ? 'System Online' : 'Action Required'}</div>
                                    <div className="text-sm text-gray-200">
                                        {profile ? 'You are fully connected' : 'Please complete your profile'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 -mt-8 relative z-20">

                    {/* Role Badge */}
                    <div className="inline-block bg-white text-[#003B5C] px-6 py-2 rounded-full shadow-lg font-bold border-2 border-[#003B5C] mb-8">
                        Logged in as: <span className="text-[#0066CC]">{user.role || 'Guest'}</span>
                        {profile && <span className="ml-2 text-sm text-gray-500">| MRN: {profile.mrn}</span>}
                    </div>

                    {/* 2. PROFILE COMPLETION (The "New Logic" Integrated) */}
                    {/* If no profile and not admin/staff, show the form here prominently */}
                    {isPatientUser && !profile && !isLoading && (
                        <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-[#FFD100] mb-8 animate-fade-in-up">
                            <h2 className="text-2xl font-bold text-[#003B5C] mb-4">Complete Your Medical Profile</h2>
                            <p className="text-gray-600 mb-6">Before you can book appointments, we need a few details to generate your Medical Record Number (MRN).</p>
                            <CompleteProfileForm onSuccess={handleProfileCreated} />
                        </div>
                    )}

                    {/* 3. MAIN DASHBOARD CARDS (Restored) */}
                    {/* Only show these if profile exists OR if user is admin/staff (who don't need patient profiles to work) */}
                    {(profile || !isPatientUser) && (
                        <>
                            {/* Stats Row */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                                <div
                                    onClick={() => setIsAppointmentsModalOpen(true)}
                                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition cursor-pointer group"
                                >
                                    <div className="text-gray-500 text-sm mb-1 group-hover:text-[#2774AE] transition-colors">
                                        {isMedicalStaff ? 'My Schedule' : 'Upcoming Appointments'}
                                    </div>
                                    <div className="text-3xl font-bold text-[#003B5C]">
                                        {appointments.filter(apt => {
                                            const slot = apt.slot as any;
                                            return new Date(slot.start_time || slot) > new Date();
                                        }).length}
                                    </div>
                                    <div className="text-xs text-green-600 mt-2 font-medium">
                                        {(() => {
                                            const upcoming = appointments
                                                .filter(apt => {
                                                    const slot = apt.slot as any;
                                                    return new Date(slot.start_time || slot) > new Date();
                                                })
                                                .sort((a, b) => {
                                                    const slotA = a.slot as any;
                                                    const slotB = b.slot as any;
                                                    return new Date(slotA.start_time || slotA).getTime() - new Date(slotB.start_time || slotB).getTime();
                                                });

                                            const next = upcoming[0];
                                            if (!next) return 'No events scheduled';

                                            const slotObj = next.slot as any;
                                            return `Next: ${new Date(slotObj.start_time || slotObj).toLocaleDateString()}`;
                                        })()}
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                                    <div className="text-gray-500 text-sm mb-1">Health Score</div>
                                    <div className="text-3xl font-bold text-[#00A651]">98</div>
                                    <div className="text-xs text-green-600 mt-2 font-medium">Excellent</div>
                                </div>
                                {/* Placeholders for layout balance */}
                                <div className="hidden md:block bg-transparent"></div>
                                <div className="hidden md:block bg-transparent"></div>
                            </div>

                            <h2 className="text-2xl font-bold text-[#003B5C] mb-6 border-l-4 border-[#FFD100] pl-4">
                                Quick Actions
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

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
                                        <p className="text-gray-600 mb-4">Manage users and settings.</p>
                                        <span className="text-purple-600 font-semibold group-hover:underline">Manage System →</span>
                                    </div>
                                )}

                                {/* Schedule Appointment */}
                                <div
                                    onClick={() => navigate('/dqr-health/schedule')}
                                    className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 group"
                                >
                                    <div className="bg-green-50 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-100 transition">
                                        <FaCalendarCheck className="text-2xl text-[#00A651]" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Schedule Appointment</h3>
                                    <p className="text-gray-600 mb-4">Book a consultation with our specialists.</p>
                                    <span className="text-[#2774AE] font-semibold group-hover:underline">Find a Doctor →</span>
                                </div>

                                {/* Lab Results */}
                                <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 group">
                                    <div className="bg-yellow-50 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-yellow-100 transition">
                                        <FaFlask className="text-2xl text-[#FFD100]" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Lab Results</h3>
                                    <p className="text-gray-600 mb-4">View your recent blood work.</p>
                                    <span className="text-sm font-medium text-gray-400">Coming Soon</span>
                                </div>

                                {/* Medical Records */}
                                <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 group">
                                    <div className="bg-red-50 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-red-100 transition">
                                        <FaNotesMedical className="text-2xl text-red-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">My Records</h3>
                                    <p className="text-gray-600 mb-4">Access complete history.</p>
                                    <span className="text-sm font-medium text-gray-400">Coming Soon</span>
                                </div>

                                {/* PHARMACY (Protected) */}
                                {(isAdmin || isMedicalStaff) && (
                                    <div
                                        onClick={() => navigate('/dqr-health/pharmacy/inventory')}
                                        className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer border-t-4 border-teal-600 group"
                                    >
                                        <div className="bg-teal-50 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
                                            <FaPills className="text-2xl text-teal-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Pharmacy & Stock</h3>
                                        <p className="text-gray-600 mb-4">Manage inventory and dispensing.</p>
                                        <span className="text-teal-600 font-semibold group-hover:underline">Open Pharmacy →</span>
                                    </div>
                                )}

                                {/* Request Access (For Patients who want to be providers) */}
                                {isPatientUser && profile && (
                                    <div
                                        onClick={() => navigate('/dqr-health/request-access')}
                                        className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border-t-4 border-[#2774AE] group opacity-75 hover:opacity-100"
                                    >
                                        <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
                                            <FaUserMd className="text-2xl text-[#2774AE]" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Are you a Provider?</h3>
                                        <p className="text-gray-600 mb-4">Request professional access.</p>
                                        <span className="text-[#2774AE] font-semibold group-hover:underline">Request Access →</span>
                                    </div>
                                )}

                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Modal Integration */}
            <AppointmentListModal
                isOpen={isAppointmentsModalOpen}
                onClose={() => setIsAppointmentsModalOpen(false)}
                appointments={appointments}
            />
        </MainLayout>
    );
};
