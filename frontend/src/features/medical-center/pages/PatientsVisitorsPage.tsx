
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

            <div className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">

                    {/* Key Information Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">

                        {/* Visiting Hours */}
                        <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-[#004B87]">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="bg-blue-50 p-3 rounded-full">
                                    <FaClock className="text-2xl text-[#004B87]" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">Visiting Hours</h3>
                            </div>
                            <ul className="space-y-3 text-gray-600">
                                <li className="flex justify-between">
                                    <span className="font-semibold">General Wards:</span>
                                    <span>10:00 AM - 8:00 PM</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="font-semibold">ICU / CCU:</span>
                                    <span>11:00 AM - 1:00 PM</span>
                                </li>
                                <li className="text-sm text-gray-500 mt-4 italic">
                                    *Exceptions may apply based on patient condition.
                                </li>
                            </ul>
                        </div>

                        {/* Visitor Policy */}
                        <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-[#004B87]">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="bg-blue-50 p-3 rounded-full">
                                    <FaUserFriends className="text-2xl text-[#004B87]" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">Visitor Limits</h3>
                            </div>
                            <div className="text-gray-600 space-y-4">
                                <p>To ensure patient rest and recovery, we kindly request:</p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>Max <strong className="text-gray-900">2 visitors</strong> at a time per patient.</li>
                                    <li>Children under 12 must be accompanied by an adult.</li>
                                    <li>Please sanitize hands upon entry.</li>
                                </ul>
                            </div>
                        </div>

                        {/* Data Privacy */}
                        <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-[#004B87]">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="bg-blue-50 p-3 rounded-full">
                                    <FaLock className="text-2xl text-[#004B87]" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">Privacy & HIPAA</h3>
                            </div>
                            <p className="text-gray-600 mb-4">
                                Your medical information is strictly confidential. DQR Health adheres to all HIPAA regulations to protect your data.
                            </p>
                            <button
                                onClick={() => setIsPrivacyModalOpen(true)}
                                className="font-semibold text-[#0066CC] hover:underline flex items-center gap-2"
                            >
                                Read Privacy Policy →
                            </button>
                        </div>
                    </div>

                    {/* Amenities Section */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="bg-[#003B5C] p-8">
                            <h2 className="text-2xl font-bold text-white">Hospital Amenities</h2>
                        </div>
                        <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                            <div className="p-8 hover:bg-gray-50 transition">
                                <FaParking className="text-4xl text-gray-400 mb-4" />
                                <h3 className="font-bold text-lg mb-2">Visitor Parking</h3>
                                <p className="text-gray-600 text-sm">Validations available at the main desk. Main garage open 24/7.</p>
                            </div>
                            <div className="p-8 hover:bg-gray-50 transition">
                                <FaWifi className="text-4xl text-gray-400 mb-4" />
                                <h3 className="font-bold text-lg mb-2">Free Wi-Fi</h3>
                                <p className="text-gray-600 text-sm">Connect to "DQR-Guest" anywhere in the medical center.</p>
                            </div>
                            <div className="p-8 hover:bg-gray-50 transition">
                                <FaSmokingBan className="text-4xl text-gray-400 mb-4" />
                                <h3 className="font-bold text-lg mb-2">Smoke-Free Campus</h3>
                                <p className="text-gray-600 text-sm">For the health of our patients, smoking is prohibited on hospital grounds.</p>
                            </div>
                        </div>
                    </div>

                    <Modal
                        isOpen={isPrivacyModalOpen}
                        onClose={() => setIsPrivacyModalOpen(false)}
                        title="DQR Health Privacy & HIPAA Policy"
                        maxWidth="800px"
                    >
                        <div className="space-y-6 text-gray-700">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-4 items-start">
                                <FaShieldAlt className="text-3xl text-[#004B87] shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-bold text-[#003B5C] mb-1">Our Commitment to Privacy</h4>
                                    <p className="text-sm">
                                        DQR Health Medical Center is committed to protecting the privacy and security of your protected health information (PHI) in compliance with the Health Insurance Portability and Accountability Act (HIPAA).
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-6">
                                <h4 className="flex items-center gap-2 font-bold text-lg text-[#003B5C] mb-3">
                                    <FaUserLock className="text-[#0066CC]" />
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

                            <div className="border-t border-gray-200 pt-6">
                                <h4 className="flex items-center gap-2 font-bold text-lg text-[#003B5C] mb-3">
                                    <FaNotesMedical className="text-[#0066CC]" />
                                    How We Use Your Information
                                </h4>
                                <p className="mb-3">We may use and disclose your health information for:</p>
                                <ul className="list-disc list-inside space-y-2 pl-4">
                                    <li><strong>Treatment:</strong> Provision, coordination, or management of your health care.</li>
                                    <li><strong>Payment:</strong> Activities involved in obtaining reimbursement for services.</li>
                                    <li><strong>Healthcare Operations:</strong> Quality assessment, training, and administrative activities.</li>
                                </ul>
                            </div>

                            <div className="bg-gray-100 p-4 rounded-lg text-sm mt-6">
                                <p className="font-semibold mb-1">Questions regarding our Privacy Policy?</p>
                                <p>Contact our Privacy Officer at: <a href="mailto:privacy@dqrhealth.com" className="text-blue-600 hover:underline">privacy@dqrhealth.com</a></p>
                            </div>
                        </div>
                    </Modal>
                </div>
            </div>
        </MainLayout>
    );
};
