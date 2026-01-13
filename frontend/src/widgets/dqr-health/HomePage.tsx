import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MainLayout } from '@/shared/layout/MainLayout';

export const HomePage = () => {
    return (
        <MainLayout>
            {/* Hero Section */}
            <section className="relative h-[600px] overflow-hidden -mt-[108px] pt-[108px]">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/full_hospital.png"
                        alt="DQR Health Medical Center"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#003B5C]/85 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-2xl text-white"
                    >
                        <div className="text-sm mb-2 flex items-center gap-2">
                            <span>🏠</span>
                            <span>›</span>
                            <span className="text-[#FFD100]">Medical Center</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold mb-4">
                            DQR Health Medical Center
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-gray-100">
                            Advanced Healthcare with AI-Powered Intelligence
                        </p>

                        {/* Quick Stats Glass Card */}
                        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 mt-8">
                            <div className="grid grid-cols-3 gap-6">
                                <div>
                                    <div className="text-3xl font-bold text-[#FFD100]">50,000+</div>
                                    <div className="text-sm text-gray-200">Patients Served</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-[#FFD100]">98%</div>
                                    <div className="text-sm text-gray-200">Satisfaction Rate</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-[#FFD100]">10,000+</div>
                                    <div className="text-sm text-gray-200">AI Consultations</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom Tabs */}
                <div className="absolute bottom-0 left-0 right-0 bg-white shadow-lg z-20">
                    <div className="container mx-auto px-4">
                        <div className="flex gap-8 text-[#004B87] font-semibold">
                            <a href="#about" className="py-4 border-b-4 border-[#004B87]">About the Medical Center</a>
                            <Link to="/dqr-health/patients-visitors" className="py-4 hover:text-[#0066CC]">For Patients & Visitors</Link>
                            <Link to="/dqr-health/health-resources" className="py-4 hover:text-[#0066CC]">Health Resources</Link>
                            <Link to="/dqr-health/units" className="py-4 hover:text-[#0066CC]">Our Units & Floors</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Respected Around the World Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-[#004B87] mb-6">
                        Respected Around the World for Research and Patient Care
                    </h2>
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                            <p>
                                DQR Health Medical Center has been a beacon of medical excellence since its founding.
                                Renowned for its award-winning care, the hospital prioritizes healing through open spaces,
                                gardens and panoramic views in patient rooms.
                            </p>
                            <p>
                                With a Level 1 trauma center and 520 inpatient beds, the medical center has specialized
                                floors dedicated to various medical specialties. Every floor offers leading-edge services
                                powered by AI-driven diagnostics and treatment recommendations.
                            </p>
                            <p>
                                As a leader in AI-powered healthcare and organ transplantation, the medical center serves
                                over 50,000 patients each year. DQR Health consistently ranks among the best hospitals
                                nationwide for innovation and patient outcomes.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <img
                                src="/images/imaging.png"
                                alt="Medical Technology"
                                className="rounded-lg shadow-lg w-full h-48 object-cover"
                            />
                            <img
                                src="/images/healing_garden.png"
                                alt="Patient Care"
                                className="rounded-lg shadow-lg w-full h-48 object-cover"
                            />
                            <img
                                src="/images/main_hall.png"
                                alt="AI Technology"
                                className="rounded-lg shadow-lg w-full h-48 object-cover"
                            />
                            <img
                                src="/images/ccu.png"
                                alt="Medical Team"
                                className="rounded-lg shadow-lg w-full h-48 object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* AI-Powered Features Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-[#004B87] mb-12 text-center">
                        AI-Powered Healthcare Innovation
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-[#003366] text-white p-8 rounded-2xl shadow-xl"
                        >
                            <div className="text-4xl mb-4">🧬</div>
                            <h3 className="text-2xl font-bold mb-4">AI Pharmacy Assistant</h3>
                            <p className="text-gray-100 mb-4">
                                Advanced drug interaction analysis powered by Gemini 2.5 Flash.
                                Get instant insights on medication safety and dosage recommendations.
                            </p>
                            <Link
                                to="/dqr-health/pharmacy"
                                className="inline-block bg-white text-[#004B87] px-6 py-2 rounded font-semibold hover:bg-gray-100 transition"
                            >
                                Try AI Assistant
                            </Link>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-[#003366] text-white p-8 rounded-2xl shadow-xl"
                        >
                            <div className="text-4xl mb-4">📊</div>
                            <h3 className="text-2xl font-bold mb-4">Smart Diagnostics</h3>
                            <p className="text-gray-100 mb-4">
                                AI-powered diagnostic results analysis with real-time insights
                                and personalized treatment recommendations.
                            </p>
                            <Link
                                to="/dqr-health/dashboard"
                                className="inline-block bg-white text-[#004B87] px-6 py-2 rounded font-semibold hover:bg-gray-100 transition"
                            >
                                View Dashboard
                            </Link>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-[#003366] text-white p-8 rounded-2xl shadow-xl"
                        >
                            <div className="text-4xl mb-4">💬</div>
                            <h3 className="text-2xl font-bold mb-4">Patient Experience AI</h3>
                            <p className="text-gray-100 mb-4">
                                Sentiment analysis and actionable insights from patient feedback
                                to continuously improve care quality.
                            </p>
                            <Link
                                to="/dqr-health/experience"
                                className="inline-block bg-white text-[#004B87] px-6 py-2 rounded font-semibold hover:bg-gray-100 transition"
                            >
                                Share Feedback
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
};
