import React from 'react';
import { FaYoutube, FaShieldAlt, FaUserLock } from 'react-icons/fa';

export const EducationalResources = () => {
    return (
        <section className="py-20 bg-slate-900">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
                        Understanding Security & Privacy
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Learn about the core technologies and compliance standards that keep your data safe.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* HIPAA Card */}
                    <div className="bg-slate-800 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 border border-slate-700 hover:border-blue-500 group">
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                                    <FaShieldAlt className="text-2xl text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white">What is HIPAA?</h3>
                            </div>
                            <p className="text-slate-400 mb-6 h-20">
                                The Health Insurance Portability and Accountability Act sets the standard for sensitive patient data protection.
                            </p>
                            <a
                                href="https://www.youtube.com/results?search_query=what+is+hipaa"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-red-500 hover:text-red-400 font-semibold transition-colors"
                            >
                                <FaYoutube className="text-xl" />
                                Watch Explanation
                            </a>
                        </div>
                    </div>

                    {/* RBAC Card */}
                    <div className="bg-slate-800 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 border border-slate-700 hover:border-purple-500 group">
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                                    <FaUserLock className="text-2xl text-purple-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Role-Based Access Control</h3>
                            </div>
                            <p className="text-slate-400 mb-6 h-20">
                                RBAC ensures that access to computer or network resources is restricted to users based on their role within the organization.
                            </p>
                            <a
                                href="https://www.youtube.com/results?search_query=what+is+rbac"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-red-500 hover:text-red-400 font-semibold transition-colors"
                            >
                                <FaYoutube className="text-xl" />
                                Watch Explanation
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
