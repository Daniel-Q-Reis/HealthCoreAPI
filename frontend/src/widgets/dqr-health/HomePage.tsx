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
                        className="w-full h-full object-cover dark:opacity-80 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#003B5C]/90 dark:from-black/50 to-transparent transition-colors duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent dark:from-black/30" />
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
                            <span className="text-[#FFD100] dark:text-yellow-400">Medical Center</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white">
                            DQR Health Medical Center
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-gray-100 dark:text-gray-200">
                            Advanced Healthcare with AI-Powered Intelligence
                        </p>

                        {/* Quick Stats Glass Card */}
                        <div className="backdrop-blur-md bg-white/10 dark:bg-black/30 border border-white/20 dark:border-white/10 rounded-2xl p-6 mt-8 transition-colors">
                            <div className="grid grid-cols-3 gap-6">
                                <div>
                                    <div className="text-3xl font-bold text-[#FFD100] dark:text-yellow-400">50,000+</div>
                                    <div className="text-sm text-gray-200 dark:text-gray-300">Patients Served</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-[#FFD100] dark:text-yellow-400">98%</div>
                                    <div className="text-sm text-gray-200 dark:text-gray-300">Satisfaction Rate</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-[#FFD100] dark:text-yellow-400">10,000+</div>
                                    <div className="text-sm text-gray-200 dark:text-gray-300">AI Consultations</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom Tabs */}
                <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-dark-surface shadow-lg z-20 transition-colors">
                    <div className="container mx-auto px-4">
                        <div className="flex gap-8 text-[#004B87] dark:text-zinc-200 font-semibold overflow-x-auto">
                            <a href="#about" className="py-4 border-b-4 border-[#004B87] dark:border-brand-accent whitespace-nowrap">About the Medical Center</a>
                            <Link to="/dqr-health/patients-visitors" className="py-4 hover:text-[#0066CC] dark:hover:text-brand-accent whitespace-nowrap transition-colors">For Patients & Visitors</Link>
                            <Link to="/dqr-health/health-resources" className="py-4 hover:text-[#0066CC] dark:hover:text-brand-accent whitespace-nowrap transition-colors">Health Resources</Link>
                            <Link to="/dqr-health/units" className="py-4 hover:text-[#0066CC] dark:hover:text-brand-accent whitespace-nowrap transition-colors">Our Units & Floors</Link>
                            <Link to="/dqr-health/developers" className="py-4 hover:text-[#0066CC] dark:hover:text-brand-accent whitespace-nowrap transition-colors">For Developers</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Respected Around the World Section */}
            <section className="py-16 bg-gray-50 dark:bg-zinc-800 transition-colors">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-[#004B87] dark:text-zinc-100 mb-6 transition-colors">
                        Respected Around the World for Research and Patient Care
                    </h2>
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-4 text-gray-700 dark:text-zinc-400 leading-relaxed transition-colors">
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
                                className="rounded-lg shadow-lg w-full h-48 object-cover opacity-90 hover:opacity-100 transition-opacity"
                            />
                            <img
                                src="/images/healing_garden.png"
                                alt="Patient Care"
                                className="rounded-lg shadow-lg w-full h-48 object-cover opacity-90 hover:opacity-100 transition-opacity"
                            />
                            <img
                                src="/images/main_hall.png"
                                alt="AI Technology"
                                className="rounded-lg shadow-lg w-full h-48 object-cover opacity-90 hover:opacity-100 transition-opacity"
                            />
                            <img
                                src="/images/ccu.png"
                                alt="Medical Team"
                                className="rounded-lg shadow-lg w-full h-48 object-cover opacity-90 hover:opacity-100 transition-opacity"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* AI-Powered Features Section */}
            <section className="py-16 bg-white dark:bg-dark-bg/50 transition-colors">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-[#004B87] dark:text-zinc-100 mb-12 text-center transition-colors">
                        AI-Powered Healthcare Innovation
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-[#003366] dark:bg-dark-surface text-white p-8 rounded-2xl shadow-xl dark:shadow-none border border-transparent dark:border-dark-border transition-colors"
                        >
                            <div className="text-4xl mb-4">🧬</div>
                            <h3 className="text-2xl font-bold mb-4 text-white dark:text-zinc-100">AI Pharmacy Assistant</h3>
                            <p className="text-gray-100 dark:text-zinc-400 mb-4 transition-colors">
                                Advanced drug interaction analysis powered by Gemini 2.5 Flash.
                                Get instant insights on medication safety and dosage recommendations.
                            </p>
                            <Link
                                to="/dqr-health/pharmacy"
                                className="inline-block bg-white dark:bg-zinc-800 text-[#004B87] dark:text-zinc-100 px-6 py-2 rounded font-semibold hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                            >
                                Try AI Assistant
                            </Link>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-[#003366] dark:bg-dark-surface text-white p-8 rounded-2xl shadow-xl dark:shadow-none border border-transparent dark:border-dark-border transition-colors"
                        >
                            <div className="text-4xl mb-4">📊</div>
                            <h3 className="text-2xl font-bold mb-4 text-white dark:text-zinc-100">Smart Diagnostics</h3>
                            <p className="text-gray-100 dark:text-zinc-400 mb-4 transition-colors">
                                AI-powered diagnostic results analysis with real-time insights
                                and personalized treatment recommendations.
                            </p>
                            <Link
                                to="/dqr-health/dashboard"
                                className="inline-block bg-white dark:bg-zinc-800 text-[#004B87] dark:text-zinc-100 px-6 py-2 rounded font-semibold hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                            >
                                View Dashboard
                            </Link>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-[#003366] dark:bg-dark-surface text-white p-8 rounded-2xl shadow-xl dark:shadow-none border border-transparent dark:border-dark-border transition-colors"
                        >
                            <div className="text-4xl mb-4">💬</div>
                            <h3 className="text-2xl font-bold mb-4 text-white dark:text-zinc-100">Patient Experience AI</h3>
                            <p className="text-gray-100 dark:text-zinc-400 mb-4 transition-colors">
                                Sentiment analysis and actionable insights from patient feedback
                                to continuously improve care quality.
                            </p>
                            <Link
                                to="/dqr-health/experience"
                                className="inline-block bg-white dark:bg-zinc-800 text-[#004B87] dark:text-zinc-100 px-6 py-2 rounded font-semibold hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
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
