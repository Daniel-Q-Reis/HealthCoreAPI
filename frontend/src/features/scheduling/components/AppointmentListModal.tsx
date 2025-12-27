import React from 'react';
import { format } from 'date-fns';
import { FaTimes, FaCalendarDay, FaUserMd, FaClock } from 'react-icons/fa';
import { Appointment } from '../types';

interface AppointmentListModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointments: Appointment[];
}

export const AppointmentListModal: React.FC<AppointmentListModalProps> = ({
    isOpen,
    onClose,
    appointments,
}) => {
    if (!isOpen) return null;

    // Filter only future appointments and sort by date
    const upcomingAppointments = appointments
        .filter(apt => {
            const slot = apt.slot as any;
            return new Date(slot.start_time || slot) > new Date();
        })
        .sort((a, b) => {
            const slotA = a.slot as any;
            const slotB = b.slot as any;
            return new Date(slotA.start_time || slotA).getTime() - new Date(slotB.start_time || slotB).getTime();
        });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="bg-[#003B5C] text-white p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">Your Schedule</h2>
                        <p className="text-blue-200 text-sm mt-1">
                            {upcomingAppointments.length} upcoming appointment{upcomingAppointments.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-full transition"
                    >
                        <FaTimes size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="max-h-[60vh] overflow-y-auto p-6 bg-gray-50">
                    {upcomingAppointments.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <FaCalendarDay className="mx-auto text-4xl mb-3 text-gray-300" />
                            <p>No upcoming appointments found.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {upcomingAppointments.map((apt) => {
                                const slot = apt.slot as any;
                                const practitioner = apt.practitioner as any; // expanded
                                const startTime = new Date(slot.start_time);
                                const endTime = new Date(slot.end_time);

                                return (
                                    <div
                                        key={apt.id}
                                        className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-4 items-start md:items-center"
                                    >
                                        {/* Date Box */}
                                        <div className="bg-blue-50 text-[#003B5C] p-3 rounded-lg text-center min-w-[80px]">
                                            <div className="text-xs font-bold uppercase">{format(startTime, 'MMM')}</div>
                                            <div className="text-2xl font-bold">{format(startTime, 'dd')}</div>
                                            <div className="text-xs text-gray-500">{format(startTime, 'yyyy')}</div>
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 text-[#003B5C] font-semibold text-lg mb-1">
                                                <FaClock className="text-[#2774AE]" />
                                                {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                                            </div>

                                            <div className="flex items-center gap-2 text-gray-700 mb-2">
                                                <FaUserMd className="text-gray-400" />
                                                Dr. {practitioner.given_name} {practitioner.family_name}
                                                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                                                    {practitioner.specialty || 'General'}
                                                </span>
                                            </div>

                                            <div className="text-sm text-gray-500">
                                                Status: <span className={`capitalize font-medium ${apt.status === 'booked' ? 'text-green-600' : 'text-gray-600'}`}>{apt.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-white p-4 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
