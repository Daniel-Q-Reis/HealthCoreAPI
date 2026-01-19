
import React from 'react';
import { MainLayout } from '@/shared/layout/MainLayout';
import { PageHero } from '@/shared/components/PageHero';

export const UnitsAndFloorsPage = () => {
    const units = [
        {
            title: "Critical Care Unit (CCU)",
            desc: "Our state-of-the-art CCU provides intensive monitoring and specialized care for patients with life-threatening conditions. Equipped with advanced life support technology, our team of specialists ensures 24/7 vigilance.",
            image: "/images/ccu.png",
            floor: "Floor 3"
        },
        {
            title: "Advanced Imaging Center",
            desc: "Home to our MRI, CT Scan, and X-Ray facilities. Our AI-powered diagnostic imaging department delivers rapid, high-resolution results to aid in accurate diagnosis.",
            image: "/images/imaging.png",
            floor: "Floor 2"
        },
        {
            title: "Healing Gardens",
            desc: "A tranquil outdoor space designed for patients and visitors. Studies show that connection with nature accelerates recovery. The garden features walking paths and meditation zones.",
            image: "/images/healing_garden.png",
            floor: "Ground Level (East Wing)"
        },
        {
            title: "Nutrition & Dining",
            desc: "Our full-service cafeteria offers healthy, gourmet meals prepared by culinary chefs. Specialized dietary plans are available for patients, while visitors can enjoy a wide variety of options.",
            image: "/images/cafeteria.png",
            floor: "Floor 1"
        },
        {
            title: "Welcome Hall & Admissions",
            desc: "The heart of our medical center. Our spacious main hall is designed to provide a warm welcome, with easy access to patient registration, information desks, and elevators.",
            image: "/images/main_hall.png",
            floor: "Main Lobby"
        }
    ];

    return (
        <MainLayout>
            <PageHero
                title="Our Units & Floors"
                description="Explore our world-class facilities designed for patient care, comfort, and advanced medical treatment."
                image="/images/full_hospital.png"
            />

            <div className="py-16 bg-gray-50 dark:bg-dark-bg transition-colors">
                <div className="container mx-auto px-4">
                    <div className="space-y-16">
                        {units.map((unit, index) => (
                            <div
                                key={index}
                                className={`flex flex-col lg:flex-row gap-12 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
                            >
                                {/* Image */}
                                <div className="w-full lg:w-1/2">
                                    <div className="relative group overflow-hidden rounded-2xl shadow-xl">
                                        <img
                                            src={unit.image}
                                            alt={unit.title}
                                            className="w-full h-80 object-cover transform group-hover:scale-105 transition duration-700 dark:opacity-90"
                                        />
                                        <div className="absolute top-4 left-4 bg-[#FFD100] text-[#003B5C] font-bold px-4 py-1 rounded shadow-md">
                                            {unit.floor}
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="w-full lg:w-1/2">
                                    <h2 className="text-3xl font-bold text-[#003B5C] dark:text-zinc-100 mb-6 relative">
                                        {unit.title}
                                        <span className="block h-1 w-20 bg-[#00A3AD] mt-2 rounded"></span>
                                    </h2>
                                    <p className="text-lg text-gray-700 dark:text-zinc-300 leading-relaxed">
                                        {unit.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};
