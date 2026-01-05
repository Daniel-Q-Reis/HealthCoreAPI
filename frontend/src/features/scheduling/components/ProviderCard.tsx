import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Practitioner } from '../types';
import { schedulingApi } from '../api';
import { BookingModal } from './BookingModal';
import { Star, MapPin, Calendar, Globe } from 'lucide-react';

interface ProviderCardProps {
    practitioner: Practitioner;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({ practitioner }) => {
    const [isBookingOpen, setIsBookingOpen] = useState(false);

    // Fetch slots only when booking starts (optimization)
    const { data: slots, isLoading: isLoadingSlots } = useQuery(
        ['slots', practitioner.id],
        () => schedulingApi.getSlots(practitioner.id),
        {
            enabled: isBookingOpen,
            staleTime: 60000 // 1 minute
        }
    );

    return (
        <>
            <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md h-full">
                {/* Header / Avatar */}
                <div className="flex p-5 gap-4">
                    <div className="flex-shrink-0">
                        <img
                            className="h-20 w-20 rounded-full object-cover border-2 border-white shadow-sm"
                            src={practitioner.image_url}
                            alt={practitioner.family_name}
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <h3 className="truncate text-lg font-bold text-[#2774AE]">
                                {practitioner.given_name} {practitioner.family_name}
                            </h3>
                            <div className="flex items-center rounded bg-blue-50 px-2 py-0.5">
                                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                                <span className="text-xs font-bold text-blue-700">{practitioner.rating?.toFixed(1)}</span>
                            </div>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{practitioner.role}</p>
                        <p className="text-sm text-gray-500 mb-2">{practitioner.specialty}</p>

                        <div className="flex items-center text-xs text-gray-500 mt-1">
                            <MapPin className="mr-1 h-3 w-3 text-gray-400" />
                            <span className="truncate">{practitioner.hospital_affiliation || 'Main Campus'}</span>
                        </div>
                    </div>
                </div>

                {/* Content / Bio */}
                <div className="flex-1 px-5 pb-2">
                    <p className="text-sm text-gray-600 line-clamp-2">
                        {practitioner.bio}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1">
                        {practitioner.languages?.map((lang) => (
                            <span key={lang} className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                <Globe className="mr-1 h-3 w-3" />
                                {lang}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Footer / Actions */}
                <div className="mt-4 border-t border-gray-100 bg-gray-50 px-5 py-3">
                    <button
                        onClick={() => setIsBookingOpen(true)}
                        className="flex w-full items-center justify-center rounded-md bg-[#2774AE] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1e5a8a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
                    >
                        <Calendar className="mr-2 h-4 w-4" />
                        Book Appointment
                    </button>
                    <p className="mt-2 text-center text-xs text-gray-500">
                        Available today & tomorrow
                    </p>
                </div>
            </div>

            {/* Modal */}
            {isBookingOpen && (
                <BookingModal
                    practitioner={practitioner}
                    slots={slots || []}
                    onClose={() => setIsBookingOpen(false)}
                />
            )}
        </>
    );
};
