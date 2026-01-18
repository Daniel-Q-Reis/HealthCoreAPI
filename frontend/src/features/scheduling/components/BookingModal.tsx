import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import { schedulingApi } from '../api';
import { Slot, Practitioner } from '../types';
import { Calendar, Clock, CheckCircle } from 'lucide-react';

interface BookingModalProps {
    practitioner: Practitioner;
    slots: Slot[];
    onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ practitioner, slots, onClose }) => {
    const queryClient = useQueryClient();
    const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
    const [notes, setNotes] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const { mutate: bookAppointment, isLoading, error } = useMutation({
        mutationFn: schedulingApi.createAppointment,
        onSuccess: () => {
            setIsSuccess(true);
            queryClient.invalidateQueries(['slots', practitioner.id]);
        }
    });

    const handleConfirm = () => {
        if (!selectedSlotId) return;
        bookAppointment({ slot_id: selectedSlotId, notes });
    };

    if (isSuccess) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Appointment Confirmed!</h3>
                    <p className="mt-2 text-gray-600">
                        Your appointment with Dr. {practitioner.family_name} is scheduled.
                    </p>
                    <div className="mt-6">
                        <button
                            onClick={onClose}
                            className="w-full rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Helper function to format time in UTC (hospital timezone)
    const formatTimeInHospitalTZ = (utcDateString: string) => {
        const utcDate = new Date(utcDateString);

        // Use UTC hours/minutes directly (no conversion)
        const hours = utcDate.getUTCHours();
        const minutes = utcDate.getUTCMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const displayMinutes = minutes.toString().padStart(2, '0');

        return `${displayHours}:${displayMinutes} ${ampm}`;
    };

    // Group slots by date in UTC
    const slotsByDate = slots.reduce((acc, slot) => {
        const utcDate = new Date(slot.start_time);

        const today = new Date();

        // Compare dates in UTC
        const slotDateOnly = new Date(Date.UTC(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate()));
        const todayOnly = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

        // Skip past dates
        if (slotDateOnly < todayOnly) return acc;

        // Group by UTC date (YYYY-MM-DD)
        const dateKey = utcDate.toISOString().split('T')[0];
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(slot);
        return acc;
    }, {} as Record<string, Slot[]>);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
            <div className="flex h-[80vh] w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-gray-900/5">
                {/* Left Side: Summary */}
                <div className="hidden w-1/3 flex-col bg-gray-50 p-6 md:flex border-r border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Book Appointment</h3>
                    <div className="mt-6 flex flex-col items-center text-center">
                        <img
                            src={practitioner.image_url}
                            alt={practitioner.family_name}
                            className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-md"
                        />
                        <h4 className="mt-4 text-base font-semibold text-gray-900">
                            {practitioner.given_name} {practitioner.family_name}
                        </h4>
                        <p className="text-sm text-primary-600 font-medium">{practitioner.role}</p>
                        <p className="text-xs text-gray-500 mt-1">{practitioner.specialty}</p>

                        <div className="mt-8 w-full space-y-4 text-left">
                            <div className="flex items-start text-sm text-gray-600">
                                <Calendar className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
                                <span>Select a date and time from the available slots.</span>
                            </div>
                            <div className="flex items-start text-sm text-gray-600">
                                <Clock className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
                                <span>Appointments are 30 minutes.</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Slot Selection */}
                <div className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex items-center justify-between border-b px-6 py-4">
                        <h3 className="text-lg font-medium text-gray-900 md:hidden">Booking</h3>
                        <h3 className="hidden text-lg font-medium text-gray-900 md:block">Select a Time</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                            ✕
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {Object.keys(slotsByDate).length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-gray-500">
                                <Calendar className="mb-2 h-8 w-8 text-gray-300" />
                                <p>No available slots found for this practitioner.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {Object.entries(slotsByDate).map(([date, daySlots]) => (
                                    <div key={date}>
                                        <h4 className="mb-3 text-sm font-semibold text-gray-900 bg-gray-50 px-3 py-1 rounded inline-block">
                                            {format(new Date(date), 'EEEE, MMMM d')}
                                        </h4>
                                        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                                            {daySlots.map((slot) => (
                                                <button
                                                    key={slot.id}
                                                    onClick={() => setSelectedSlotId(slot.id)}
                                                    className={`
                                                        flex flex-col items-center rounded-lg border px-3 py-2 text-sm font-medium transition-all
                                                        ${selectedSlotId === slot.id
                                                            ? 'border-primary-600 bg-primary-50 text-primary-700 ring-1 ring-primary-600'
                                                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'}
                                                    `}
                                                >
                                                    {formatTimeInHospitalTZ(slot.start_time)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {selectedSlotId && (
                        <div className="border-t bg-gray-50 p-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Reason for Visit (Optional)
                            </label>
                            <input
                                type="text"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2 px-3 mb-3"
                                placeholder="E.g., Fever, Annual Checkup..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />

                            {error && (
                                <p className="text-xs text-red-600 mb-2">
                                    {(error as any)?.response?.data?.detail || 'Booking failed'}
                                </p>
                            )}

                            <button
                                onClick={handleConfirm}
                                disabled={isLoading}
                                className="w-full rounded-md bg-primary-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-primary-700 disabled:opacity-50"
                            >
                                {isLoading ? 'Confirming...' : 'Confirm Appointment'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
