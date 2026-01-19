import React from 'react';
import { FaYoutube, FaShieldAlt, FaUserLock } from 'react-icons/fa';

export const EducationalResources = () => {
    return (
        <section className="py-20 bg-gray-50 dark:bg-dark-bg transition-colors">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500 bg-clip-text text-transparent mb-4 transition-colors">
                        Understanding Security & Privacy
                    </h2>
                    <p className="text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto transition-colors">
                        Learn about the core technologies and compliance standards that keep your data safe.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* HIPAA Card */}
                    <div className="bg-white dark:bg-dark-surface rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 border border-gray-200 dark:border-dark-border hover:border-blue-500 group shadow-sm dark:shadow-none">
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-500/10 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-500/20 transition-colors">
                                    <FaShieldAlt className="text-2xl text-blue-600 dark:text-blue-400 transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100 transition-colors">What is HIPAA?</h3>
                            </div>
                            <p className="text-slate-600 dark:text-zinc-400 mb-6 h-20 transition-colors">
                                The Health Insurance Portability and Accountability Act sets the standard for sensitive patient data protection.
                            </p>
                            <a
                                href="https://www.youtube.com/results?search_query=what+is+hipaa"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-red-600 dark:text-red-500 hover:text-red-500 dark:hover:text-red-400 font-semibold transition-colors"
                            >
                                <FaYoutube className="text-xl" />
                                Watch Explanation
                            </a>
                        </div>
                    </div>

                    {/* RBAC Card */}
                    <div className="bg-white dark:bg-dark-surface rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 border border-gray-200 dark:border-dark-border hover:border-purple-500 group shadow-sm dark:shadow-none">
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-purple-100 dark:bg-purple-500/10 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-500/20 transition-colors">
                                    <FaUserLock className="text-2xl text-purple-600 dark:text-purple-400 transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100 transition-colors">Role-Based Access Control</h3>
                            </div>
                            <p className="text-slate-600 dark:text-zinc-400 mb-6 h-20 transition-colors">
                                RBAC ensures that access to computer or network resources is restricted to users based on their role within the organization.
                            </p>
                            <a
                                href="https://www.youtube.com/results?search_query=what+is+rbac"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-red-600 dark:text-red-500 hover:text-red-500 dark:hover:text-red-400 font-semibold transition-colors"
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
