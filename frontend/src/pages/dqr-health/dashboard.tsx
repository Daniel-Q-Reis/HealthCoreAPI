import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientApi } from '@/features/patients/api';
import { CompleteProfileForm } from '@/features/patients/components/CompleteProfileForm';
import { Patient } from '@/features/patients/types';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { LogOut, User, Activity, Calendar, Pill, FileText } from 'lucide-react';

export const DashboardPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<Patient | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await patientApi.getMyProfile();
                setProfile(data);
            } catch (error) {
                console.error(error);
                // 404 handled in api
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleProfileCreated = (newProfile: Patient) => {
        setProfile(newProfile);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004B87]"></div>
            </div>
        );
    }

    // 1. If Patient Profile is Missing -> Show Form
    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-[#004B87]">Welcome to DQR Health</h1>
                        <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 font-medium">
                            Sign Out
                        </button>
                    </div>
                    <CompleteProfileForm onSuccess={handleProfileCreated} />
                </div>
            </div>
        );
    }

    // 2. Main Dashboard (Profile Exists)
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="bg-primary-100 p-2 rounded-lg">
                            <Activity className="h-6 w-6 text-primary-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Patient Portal</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <div className="bg-gray-100 p-2 rounded-full">
                                <User className="h-5 w-5 text-gray-600" />
                            </div>
                            <div className="text-right hidden sm:block">
                                <span className="block text-sm font-medium text-gray-700">{profile.given_name} {profile.family_name}</span>
                                <span className="block text-xs text-gray-500">MRN: {profile.mrn}</span>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Welcome Back, {profile.given_name}</h2>
                    <p className="mt-2 text-gray-600">Manage your health journey with DQR Health.</p>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Appointments Card */}
                    <div
                        onClick={() => navigate('/dqr-health/schedule')}
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
                    >
                        <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                            <Calendar className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2"> Appointments</h3>
                        <p className="text-gray-500 text-sm">Schedule a new visit or manage upcoming consultations.</p>
                    </div>

                    {/* Prescriptions Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="bg-green-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                            <Pill className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">myPharmacy</h3>
                        <p className="text-gray-500 text-sm">View active prescriptions and request refills.</p>
                    </div>

                    {/* Medical Records Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="bg-purple-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                            <FileText className="h-6 w-6 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Medical Records</h3>
                        <p className="text-gray-500 text-sm">Access your history, lab results, and documents.</p>
                    </div>
                </div>

                {/* Status Section */}
                <div className="mt-12">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Upcoming Schedule</h3>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
                            <Calendar className="h-8 w-8 text-gray-400" />
                        </div>
                        <h4 className="text-lg font-medium text-gray-900">No Upcoming Appointments</h4>
                        <p className="mt-2 text-gray-500 max-w-sm mx-auto">
                            You don't have any appointments scheduled at the moment.
                        </p>
                        <button
                            onClick={() => navigate('/dqr-health/schedule')}
                            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            Book Appointment
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};
