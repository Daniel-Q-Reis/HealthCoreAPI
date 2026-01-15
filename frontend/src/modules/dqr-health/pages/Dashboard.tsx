import React, { useEffect, useState } from 'react';
import { patientApi } from '../../../features/patients/api';
import { CompleteProfileForm } from '../../../features/patients/components/CompleteProfileForm';
import { Patient } from '../../../features/patients/types';

export const Dashboard = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<Patient | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await patientApi.getMyProfile();
                setProfile(data);
            } catch (error) {
                console.error(error);
                // 404 is handled in api, returns null
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleProfileCreated = (newProfile: Patient) => {
        setProfile(newProfile);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004B87]"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-[#004B87] mb-8">Welcome to DQR Health</h1>
                    <CompleteProfileForm onSuccess={handleProfileCreated} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[#004B87]">Patient Dashboard</h1>
                        <p className="text-gray-600">Welcome back, {profile.given_name}</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg shadow border border-gray-100">
                        <span className="text-xs text-gray-500 uppercase font-semibold block">Medical Record Number</span>
                        <span className="font-mono text-lg font-bold text-[#004B87]">{profile.mrn}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Quick Actions */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-lg mb-4 text-gray-800">My Appointments</h3>
                        <p className="text-gray-500 text-sm mb-4">You have no upcoming appointments.</p>
                        <a href="/find-provider" className="text-[#004B87] hover:underline text-sm font-medium">Book a new appointment →</a>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-lg mb-4 text-gray-800">Test Results</h3>
                        <p className="text-gray-500 text-sm">No recent test results available.</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-lg mb-4 text-gray-800">Profile Settings</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Email</span>
                                <span className="font-medium">{profile.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Phone</span>
                                <span className="font-medium">{profile.phone_number}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
