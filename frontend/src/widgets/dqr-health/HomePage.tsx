import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const HomePage = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav>
                {/* Top Bar - Dark Blue */}
                <div className="bg-[#003B5C] text-white">
                    <div className="container mx-auto px-4">
                        <div className="flex justify-between items-center py-2 text-sm">
                            <div className="flex gap-6">
                                <a href="#" className="hover:text-gray-200">Explore DQR Health</a>
                                <a href="#" className="hover:text-gray-200">myDQRHealth</a>
                                <a href="#" className="hover:text-gray-200">News & Insights</a>
                                <a href="#" className="hover:text-gray-200">Contact Us</a>
                            </div>
                            <div className="flex gap-4 items-center">
                                <span>📞 +55 (11) 9999-9999</span>
                                <button className="hover:text-gray-200">🌐 Translate</button>
                                <button className="hover:text-gray-200">🔍 Search</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Nav - White Background */}
                <div className="bg-white border-b border-gray-200">
                    <div className="container mx-auto px-4">
                        <div className="flex justify-between items-center py-4">
                            <div className="flex items-center gap-2">
                                <div className="text-2xl font-bold text-[#003B5C]">DQR</div>
                                <div className="text-xl text-[#0066CC]">Health</div>
                            </div>
                            <div className="flex gap-8 text-[#003B5C]">
                                <Link to="/dqr-health/dashboard" className="hover:text-[#0066CC] transition">Find Care</Link>
                                <a href="#" className="hover:text-[#0066CC] transition">Patient Resources</a>
                                <a href="#" className="hover:text-[#0066CC] transition">Treatment Options</a>
                                <a href="#" className="hover:text-[#0066CC] transition">Locations</a>
                                <a href="#" className="hover:text-[#0066CC] transition">Discover</a>
                            </div>
                            <div className="flex gap-3">
                                <Link
                                    to="/dqr-health/login"
                                    className="border-2 border-[#2774AE] text-[#2774AE] px-6 py-2 rounded font-semibold hover:bg-[#2774AE] hover:text-white transition"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/dqr-health/register"
                                    className="bg-[#2774AE] text-white px-6 py-2 rounded font-semibold hover:bg-[#1e5a8a] transition shadow-sm"
                                >
                                    Create Account
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative h-[600px] overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
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
                <div className="absolute bottom-0 left-0 right-0 bg-white shadow-lg">
                    <div className="container mx-auto px-4">
                        <div className="flex gap-8 text-[#004B87] font-semibold">
                            <a href="#about" className="py-4 border-b-4 border-[#004B87]">About the Medical Center</a>
                            <a href="#patients" className="py-4 hover:text-[#0066CC]">For Patients & Visitors</a>
                            <a href="#resources" className="py-4 hover:text-[#0066CC]">Health Resources</a>
                            <a href="#units" className="py-4 hover:text-[#0066CC]">Our Units & Floors</a>
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
                            className="bg-gradient-to-br from-[#004B87] to-[#0066CC] text-white p-8 rounded-2xl shadow-xl"
                        >
                            <div className="text-4xl mb-4">🧬</div>
                            <h3 className="text-2xl font-bold mb-4">AI Pharmacy Assistant</h3>
                            <p className="text-gray-100 mb-4">
                                Advanced drug interaction analysis powered by Gemini 2.5 Flash.
                                Get instant insights on medication safety and dosage recommendations.
                            </p>
                            <Link
                                to="/dqr-health/pharmacy"
                                className="inline-block bg-[#FFD100] text-[#004B87] px-6 py-2 rounded font-semibold hover:bg-[#FFC700] transition"
                            >
                                Try AI Assistant
                            </Link>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-gradient-to-br from-[#00A3AD] to-[#00C4CC] text-white p-8 rounded-2xl shadow-xl"
                        >
                            <div className="text-4xl mb-4">📊</div>
                            <h3 className="text-2xl font-bold mb-4">Smart Diagnostics</h3>
                            <p className="text-gray-100 mb-4">
                                AI-powered diagnostic results analysis with real-time insights
                                and personalized treatment recommendations.
                            </p>
                            <Link
                                to="/dqr-health/dashboard"
                                className="inline-block bg-white text-[#00A3AD] px-6 py-2 rounded font-semibold hover:bg-gray-100 transition"
                            >
                                View Dashboard
                            </Link>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-gradient-to-br from-[#00A651] to-[#00C96D] text-white p-8 rounded-2xl shadow-xl"
                        >
                            <div className="text-4xl mb-4">💬</div>
                            <h3 className="text-2xl font-bold mb-4">Patient Experience AI</h3>
                            <p className="text-gray-100 mb-4">
                                Sentiment analysis and actionable insights from patient feedback
                                to continuously improve care quality.
                            </p>
                            <Link
                                to="/dqr-health/experience"
                                className="inline-block bg-white text-[#00A651] px-6 py-2 rounded font-semibold hover:bg-gray-100 transition"
                            >
                                Share Feedback
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#003366] text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="font-bold text-xl mb-4">DQR Health</h3>
                            <p className="text-gray-300 text-sm">
                                Advanced Healthcare with AI-Powered Intelligence
                            </p>
                            <p className="text-gray-300 text-sm mt-4">
                                São Paulo, Brazil
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Find Care</h4>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li><a href="#" className="hover:text-white">Find a Doctor</a></li>
                                <li><a href="#" className="hover:text-white">Locations</a></li>
                                <li><a href="#" className="hover:text-white">Appointments</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Patient Resources</h4>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li><a href="#" className="hover:text-white">Patient Portal</a></li>
                                <li><a href="#" className="hover:text-white">Medical Records</a></li>
                                <li><a href="#" className="hover:text-white">Billing</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">About</h4>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li><a href="#" className="hover:text-white">About Us</a></li>
                                <li><a href="#" className="hover:text-white">Careers</a></li>
                                <li><a href="#" className="hover:text-white">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-gray-300">
                        <p>© 2025 Daniel de Queiroz Reis Tecnologia da Informação LTDA (Royal Tech)</p>
                        <p className="mt-2">CNPJ: 63.419.534/0001-77 | São Paulo, Brazil</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};
