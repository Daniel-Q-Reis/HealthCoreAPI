import React from 'react';
import { format } from 'date-fns';
import { FaTimes, FaUserMd, FaClock, FaCalendarCheck, FaSpinner } from 'react-icons/fa';
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

    const isLoading = false; // Placeholder

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">

                {/* Header */}
                <div className="bg-[#003B5C] dark:bg-zinc-800 p-6 flex justify-between items-center shrink-0 transition-colors">
                    <div className="flex items-center gap-3 text-white">
                        <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                            <FaCalendarCheck className="text-2xl" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">My Appointments</h2>
                            <p className="text-blue-200 dark:text-zinc-400 text-xs">Manage upcoming visits</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full"
                    >
                        <FaTimes className="text-xl" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-0 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-dark-bg transition-colors flex-1">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-zinc-400">
                            <FaSpinner className="text-4xl animate-spin text-[#003B5C] dark:text-brand-accent mb-4" />
                            <p>Loading appointments...</p>
                        </div>
                    ) : appointments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                            <div className="bg-white dark:bg-zinc-800 p-4 rounded-full shadow-sm mb-4">
                                <FaCalendarCheck className="text-4xl text-gray-300 dark:text-zinc-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-zinc-200">No Appointments Found</h3>
                            <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1 max-w-xs">You don't have any upcoming appointments scheduled at this time.</p>
                            <button onClick={onClose} className="mt-6 text-[#0066CC] dark:text-brand-accent font-semibold text-sm hover:underline">
                                Close Window
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                            {appointments.map((apt) => {
                                const slot = apt.slot as any;
                                const practitioner = apt.practitioner as any;

                                return (
                                    <div key={apt.id} className="p-6 bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors group">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-blue-50 dark:bg-blue-900/30 text-[#004B87] dark:text-blue-400 p-2 rounded-lg">
                                                    <FaUserMd className="text-xl" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-800 dark:text-zinc-100">{practitioner.given_name} {practitioner.family_name}</h4>
                                                    <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium bg-gray-100 dark:bg-zinc-700 px-2 py-0.5 rounded-full inline-block mt-1">
                                                        {practitioner.specialty || 'General Practice'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                            ${apt.status === 'booked' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    apt.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}
                                        `}>
                                                {apt.status}
                                            </div>
                                        </div>

                                        <div className="ml-14 space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-300">
                                                <FaClock className="text-gray-400 dark:text-zinc-500" />
                                                <span className="font-medium text-gray-900 dark:text-zinc-200">
                                                    {format(new Date(slot.start_time), 'MMMM d, yyyy')}
                                                </span>
                                                <span className="text-gray-400 dark:text-zinc-600">•</span>
                                                <span>
                                                    {format(new Date(slot.start_time), 'h:mm a')} - {format(new Date(slot.end_time), 'h:mm a')}
                                                </span>
                                            </div>

                                            {apt.notes && (
                                                <div className="text-sm text-gray-500 dark:text-zinc-400 italic pl-6 border-l-2 border-gray-100 dark:border-zinc-700 mt-2">
                                                    "{apt.notes}"
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 flex justify-between items-center shrink-0 transition-colors">
                    <span className="text-xs text-gray-400 dark:text-zinc-500">
                        Showing {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
                    </span>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 rounded-lg hover:bg-gray-300 dark:hover:bg-zinc-700 font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
