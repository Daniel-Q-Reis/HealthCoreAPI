import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { schedulingApi } from '../api';
import { ProviderCard } from '../components/ProviderCard';
import { MainLayout } from '@/shared/layout/MainLayout';
import { Search, Map as MapIcon, SlidersHorizontal, MapPin } from 'lucide-react';

export const ProviderSearchPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showMap, setShowMap] = useState(true);
    const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);

    // Default to Einstein Hospital area in São Paulo as requested
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>({ lat: -23.5990, lng: -46.7198 });
    const [locationName, setLocationName] = useState('Albert Einstein Hospital Area, SP');

    // Note: Automatic IP geolocation removed to prevent CORS/429 errors in development.
    // Defaulting to generic location.

    const { data: practitioners, isLoading } = useQuery(
        ['practitioners', searchTerm],
        () => schedulingApi.getPractitioners(searchTerm),
        { keepPreviousData: true }
    );

    const SPECIALTIES = [
        'Cardiology',
        'Neurology',
        'Pediatrics',
        'Oncology',
        'Orthopedics',
        'Emergency Medicine',
        'Psychiatry',
        'General Practice'
    ];

    const toggleSpecialty = (spec: string) => {
        setSelectedSpecialties(prev =>
            prev.includes(spec)
                ? prev.filter(s => s !== spec)
                : [...prev, spec]
        );
    };

    const filteredPractitioners = practitioners?.filter(p => {
        if (selectedSpecialties.length === 0) return true;
        return selectedSpecialties.some(s => p.specialty?.includes(s));
    });

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors">
                {/* Hero / Header Filter Bar */}
                <div className="bg-[#003B5C] dark:bg-zinc-800 py-8 text-white shadow-md transition-colors">
                    <div className="w-full px-4 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold tracking-tight">Search for DQR Health Doctors</h1>
                        <p className="mt-2 text-[#8BB8E8] dark:text-zinc-400">Find the right care for you and your family.</p>

                        <div className="mt-8 flex flex-col gap-4 md:flex-row">
                            <div className="relative flex-1">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full rounded-md border-0 bg-white dark:bg-zinc-900 py-3 pl-10 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-white dark:focus:ring-brand-accent sm:text-sm sm:leading-6 transition-colors"
                                    placeholder="Search by condition, specialty, or doctor name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="relative w-full md:w-64">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <MapPin className="h-5 w-5 text-gray-400" />
                                </div>
                                <select className="block w-full appearance-none rounded-md border-0 bg-white dark:bg-zinc-900 py-3 pl-10 pr-8 text-gray-900 dark:text-white focus:ring-2 focus:ring-white dark:focus:ring-brand-accent sm:text-sm sm:leading-6 transition-colors">
                                    <option>All Locations</option>
                                    <option>Main Campus</option>
                                    <option>West Wing Clinic</option>
                                </select>
                            </div>
                            <button className="flex items-center justify-center rounded-md bg-[#FFD100] px-6 py-3 text-sm font-bold text-[#003B5C] shadow-sm hover:bg-[#ffe066]">
                                Search
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Filters Sidebar */}
                        <div className="w-full lg:w-64 shrink-0 space-y-6">
                            <div className="rounded-lg bg-white dark:bg-dark-surface p-6 shadow-sm border border-gray-100 dark:border-zinc-800 transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-900 dark:text-zinc-100">Filters</h3>
                                    <SlidersHorizontal className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Specialty</label>
                                        <div className="mt-2 space-y-2">
                                            {SPECIALTIES.map(spec => (
                                                <label key={spec} className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600 dark:bg-zinc-700 dark:border-zinc-600"
                                                        checked={selectedSpecialties.includes(spec)}
                                                        onChange={() => toggleSpecialty(spec)}
                                                    />
                                                    <span className="ml-2 text-sm text-gray-600 dark:text-zinc-400">{spec}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 dark:border-zinc-700">
                                        <label className="flex items-center">
                                            <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300 text-primary-600 dark:bg-zinc-700 dark:border-zinc-600" />
                                            <span className="ml-2 text-sm text-gray-700 dark:text-zinc-300 font-medium">Accepting New Patients</span>
                                        </label>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 dark:border-zinc-700">
                                        <label className="flex items-center">
                                            <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300 text-primary-600 dark:bg-zinc-700 dark:border-zinc-600" />
                                            <span className="ml-2 text-sm text-gray-700 dark:text-zinc-300 font-medium">Online Booking</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Results Area */}
                        <div className="flex-1">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">
                                    {filteredPractitioners?.length || 0} Doctors found
                                </h2>
                                <button
                                    onClick={() => setShowMap(!showMap)}
                                    className="hidden lg:flex items-center text-sm font-medium text-[#2774AE] dark:text-brand-accent hover:underline"
                                >
                                    <MapIcon className="mr-2 h-4 w-4" />
                                    {showMap ? 'Hide Map' : 'Show Map'}
                                </button>
                            </div>

                            <div className="flex flex-col-reverse xl:flex-row gap-6">
                                {/* Cards Grid */}
                                <div className={`grid gap-6 ${showMap ? 'xl:w-1/2' : 'w-full'} grid-cols-1 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2`}>
                                    {isLoading ? (
                                        <div className="col-span-full py-12 text-center text-gray-500 dark:text-zinc-500">Loading doctors...</div>
                                    ) : filteredPractitioners?.length === 0 ? (
                                        <div className="col-span-full py-12 text-center text-gray-500 dark:text-zinc-500">
                                            No doctors found matching your criteria. Try selecting "General Practice" or clearing filters.
                                        </div>
                                    ) : filteredPractitioners?.map((practitioner) => (
                                        <ProviderCard key={practitioner.id} practitioner={practitioner} />
                                    ))}
                                </div>

                                {/* Map Visual (Mock) */}
                                {showMap && (
                                    <div className="xl:w-1/2 xl:h-[calc(100vh-300px)] xl:sticky xl:top-24 rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-sm bg-blue-50 dark:bg-zinc-800 relative hidden xl:block transition-colors">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            className="dark:invert dark:grayscale dark:contrast-125 transition-all duration-500"
                                            style={{ border: 0 }}
                                            loading="lazy"
                                            allowFullScreen
                                            referrerPolicy="no-referrer-when-downgrade"
                                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3656.0513987157833!2d-46.72202682375172!3d-23.599147563098553!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce56ce6d30666b%3A0xe5a3c20058b7617b!2sHospital%20Israelita%20Albert%20Einstein!5e0!3m2!1sen!2sbr!4v1715632195000!5m2!1sen!2sbr">
                                        </iframe>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};
