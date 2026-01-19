
import React from 'react';
import { MainLayout } from '@/shared/layout/MainLayout';
import { PageHero } from '@/shared/components/PageHero';
import { FaBookMedical, FaHeartbeat, FaAppleAlt, FaBrain } from 'react-icons/fa';

export const HealthResourcesPage = () => {
    const resources = [
        {
            icon: <FaHeartbeat className="text-red-500" />,
            title: "Heart Health Guide",
            desc: "Tips for maintaining a healthy cardiovascular system through diet and exercise."
        },
        {
            icon: <FaAppleAlt className="text-green-500" />,
            title: "Nutrition & Wellness",
            desc: "Expert advice from our nutritionists on balanced diets and healthy eating habits."
        },
        {
            icon: <FaBrain className="text-purple-500" />,
            title: "Mental Health Support",
            desc: "Resources and counseling services for anxiety, depression, and stress management."
        },
        {
            icon: <FaBookMedical className="text-blue-500" />,
            title: "Patient Education Library",
            desc: "Searchable database of conditions, treatments, and medication information."
        }
    ];

    return (
        <MainLayout>
            <PageHero
                title="Health Resources"
                description="Empowering you with knowledge. Access our library of health guides, wellness tips, and patient education materials."
                image="/images/healing_garden.png"
            />

            <div className="py-16 bg-gray-50 dark:bg-dark-bg transition-colors">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-8">
                        {resources.map((res, idx) => (
                            <div key={idx} className="bg-white dark:bg-dark-surface p-8 rounded-xl shadow-md border border-gray-100 dark:border-zinc-800 hover:shadow-lg transition flex gap-6 items-start">
                                <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-full text-3xl shrink-0">
                                    {res.icon}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-[#003B5C] dark:text-zinc-100 mb-2">{res.title}</h3>
                                    <p className="text-gray-600 dark:text-zinc-400 mb-4">{res.desc}</p>
                                    <a href="#" className="text-[#0066CC] dark:text-brand-accent font-semibold hover:underline">Learn More →</a>
                                </div>
                            </div>
                        ))}
                    </div>


                    {/* Newsletter */}
                    <div className="mt-16 bg-[#003B5C] dark:bg-zinc-800 rounded-2xl p-12 text-center text-white relative overflow-hidden transition-colors">
                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h2 className="text-3xl font-bold mb-4">Stay Healthy, Stay Informed</h2>
                            <p className="text-blue-100 dark:text-zinc-400 mb-8">Subscribe to our monthly newsletter for the latest health news and hospital updates.</p>
                            <div className="flex flex-col md:flex-row gap-4 justify-center">
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    className="px-6 py-3 rounded-lg text-gray-900 bg-white dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500 w-full md:w-96 focus:outline-none focus:ring-2 focus:ring-[#FFD100] border-none"
                                />
                                <button className="bg-[#FFD100] text-[#003B5C] font-bold px-8 py-3 rounded-lg hover:bg-yellow-400 transition">
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </MainLayout>
    );
};
