
import React, { useState } from 'react';
import { MainLayout } from '@/shared/layout/MainLayout';
import { PageHero } from '@/shared/components/PageHero';
import { Modal } from '@/shared/components/Modal';
import { FaClock, FaUserFriends, FaLock, FaParking, FaWifi, FaSmokingBan, FaShieldAlt, FaUserLock, FaNotesMedical } from 'react-icons/fa';

export const PatientsVisitorsPage = () => {
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

    return (
        <MainLayout>
            <PageHero
                title="For Patients & Visitors"
                description="Everything you need to know about your stay or visit to DQR Health Medical Center."
                image="/images/main_entrance.png"
            />

            <div className="py-16 bg-gray-50 dark:bg-dark-bg transition-colors">
                <div className="container mx-auto px-4">

                    {/* Key Information Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">

                        {/* Visiting Hours */}
                        <div className="bg-white dark:bg-dark-surface p-8 rounded-xl shadow-md border-t-4 border-[#004B87] dark:border-blue-500 transition-colors">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="bg-blue-50 dark:bg-zinc-800 p-3 rounded-full">
                                    <FaClock className="text-2xl text-[#004B87] dark:text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-zinc-100">Visiting Hours</h3>
                            </div>
                            <ul className="space-y-3 text-gray-600 dark:text-zinc-400">
                                <li className="flex justify-between">
                                    <span className="font-semibold dark:text-zinc-200">General Wards:</span>
                                    <span>10:00 AM - 8:00 PM</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="font-semibold dark:text-zinc-200">ICU / CCU:</span>
                                    <span>11:00 AM - 1:00 PM</span>
                                </li>
                                <li className="text-sm text-gray-500 dark:text-zinc-500 mt-4 italic">
                                    *Exceptions may apply based on patient condition.
                                </li>
                            </ul>
                        </div>

                        {/* Visitor Policy */}
                        <div className="bg-white dark:bg-dark-surface p-8 rounded-xl shadow-md border-t-4 border-[#004B87] dark:border-blue-500 transition-colors">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="bg-blue-50 dark:bg-zinc-800 p-3 rounded-full">
                                    <FaUserFriends className="text-2xl text-[#004B87] dark:text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-zinc-100">Visitor Limits</h3>
                            </div>
                            <div className="text-gray-600 dark:text-zinc-400 space-y-4">
                                <p>To ensure patient rest and recovery, we kindly request:</p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>Max <strong className="text-gray-900 dark:text-zinc-200">2 visitors</strong> at a time per patient.</li>
                                    <li>Children under 12 must be accompanied by an adult.</li>
                                    <li>Please sanitize hands upon entry.</li>
                                </ul>
                            </div>
                        </div>

                        {/* Data Privacy */}
                        <div className="bg-white dark:bg-dark-surface p-8 rounded-xl shadow-md border-t-4 border-[#004B87] dark:border-blue-500 transition-colors">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="bg-blue-50 dark:bg-zinc-800 p-3 rounded-full">
                                    <FaLock className="text-2xl text-[#004B87] dark:text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-zinc-100">Privacy & HIPAA</h3>
                            </div>
                            <p className="text-gray-600 dark:text-zinc-400 mb-4">
                                Your medical information is strictly confidential. DQR Health adheres to all HIPAA regulations to protect your data.
                            </p>
                            <button
                                onClick={() => setIsPrivacyModalOpen(true)}
                                className="font-semibold text-[#0066CC] dark:text-blue-400 hover:underline flex items-center gap-2"
                            >
                                Read Privacy Policy →
                            </button>
                        </div>
                    </div>

                    {/* Amenities Section */}
                    <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl overflow-hidden transition-colors">
                        <div className="bg-[#003B5C] dark:bg-zinc-800 p-8 transition-colors">
                            <h2 className="text-2xl font-bold text-white">Hospital Amenities</h2>
                        </div>
                        <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-zinc-800">
                            <div className="p-8 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition">
                                <FaParking className="text-4xl text-gray-400 dark:text-zinc-500 mb-4" />
                                <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-zinc-100">Visitor Parking</h3>
                                <p className="text-gray-600 dark:text-zinc-400 text-sm">Validations available at the main desk. Main garage open 24/7.</p>
                            </div>
                            <div className="p-8 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition">
                                <FaWifi className="text-4xl text-gray-400 dark:text-zinc-500 mb-4" />
                                <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-zinc-100">Free Wi-Fi</h3>
                                <p className="text-gray-600 dark:text-zinc-400 text-sm">Connect to "DQR-Guest" anywhere in the medical center.</p>
                            </div>
                            <div className="p-8 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition">
                                <FaSmokingBan className="text-4xl text-gray-400 dark:text-zinc-500 mb-4" />
                                <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-zinc-100">Smoke-Free Campus</h3>
                                <p className="text-gray-600 dark:text-zinc-400 text-sm">For the health of our patients, smoking is prohibited on hospital grounds.</p>
                            </div>
                        </div>
                    </div>

                    <Modal
                        isOpen={isPrivacyModalOpen}
                        onClose={() => setIsPrivacyModalOpen(false)}
                        title="DQR Health Privacy & HIPAA Policy"
                        maxWidth="800px"
                    >
                        <div className="space-y-6 text-gray-700 dark:text-zinc-300">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 flex gap-4 items-start">
                                <FaShieldAlt className="text-3xl text-[#004B87] dark:text-blue-400 shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-bold text-[#003B5C] dark:text-blue-300 mb-1">Our Commitment to Privacy</h4>
                                    <p className="text-sm">
                                        DQR Health Medical Center is committed to protecting the privacy and security of your protected health information (PHI) in compliance with the Health Insurance Portability and Accountability Act (HIPAA).
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 dark:border-zinc-700 pt-6">
                                <h4 className="flex items-center gap-2 font-bold text-lg text-[#003B5C] dark:text-zinc-100 mb-3">
                                    <FaUserLock className="text-[#0066CC] dark:text-brand-accent" />
                                    Your Patient Rights
                                </h4>
                                <ul className="list-disc list-inside space-y-2 pl-4">
                                    <li>Right to inspect and copy your medical records.</li>
                                    <li>Right to request amendments to your health information.</li>
                                    <li>Right to request confidential communications.</li>
                                    <li>Right to a list of disclosures we have made of your information.</li>
                                    <li>Right to file a complaint if you believe your privacy rights were violated.</li>
                                </ul>
                            </div>

                            <div className="border-t border-gray-200 dark:border-zinc-700 pt-6">
                                <h4 className="flex items-center gap-2 font-bold text-lg text-[#003B5C] dark:text-zinc-100 mb-3">
                                    <FaNotesMedical className="text-[#0066CC] dark:text-brand-accent" />
                                    How We Use Your Information
                                </h4>
                                <p className="mb-3">We may use and disclose your health information for:</p>
                                <ul className="list-disc list-inside space-y-2 pl-4">
                                    <li><strong>Treatment:</strong> Provision, coordination, or management of your health care.</li>
                                    <li><strong>Payment:</strong> Activities involved in obtaining reimbursement for services.</li>
                                    <li><strong>Healthcare Operations:</strong> Quality assessment, training, and administrative activities.</li>
                                </ul>
                            </div>

                            <div className="bg-gray-100 dark:bg-zinc-800 p-4 rounded-lg text-sm mt-6 transition-colors">
                                <p className="font-semibold mb-1">Questions regarding our Privacy Policy?</p>
                                <p>Contact our Privacy Officer at: <a href="mailto:privacy@dqrhealth.com" className="text-blue-600 dark:text-blue-400 hover:underline">privacy@dqrhealth.com</a></p>
                            </div>
                        </div>
                    </Modal>
                </div>
            </div>
        </MainLayout>
    );
};
