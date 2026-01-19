import React, { useState, useEffect } from 'react';
import { FaRobot, FaTimes, FaLightbulb, FaSpinner } from 'react-icons/fa';
import { resultsApi, LifestyleAdvice } from '../api';

interface LifestyleAdvisorModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportId: number;
    reportConclusion: string;
}

export const LifestyleAdvisorModal = ({ isOpen, onClose, reportId, reportConclusion }: LifestyleAdvisorModalProps) => {
    const [advice, setAdvice] = useState<LifestyleAdvice | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && reportId) {
            fetchAdvice();
        } else {
            setAdvice(null);
            setError(null);
        }
    }, [isOpen, reportId]);

    const fetchAdvice = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await resultsApi.getLifestyleAdvice(reportId);
            setAdvice(data);
        } catch (err: any) {
            console.error(err);
            setError("Unable to generate advice at this time. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">

                {/* Header */}
                <div className="bg-gradient-to-r from-[#003B5C] to-[#0066CC] dark:from-zinc-900 dark:to-zinc-800 p-6 flex justify-between items-center shrink-0 transition-colors">
                    <div className="flex items-center gap-3 text-white">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                            <FaRobot className="text-2xl" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Lifestyle AI Advisor</h2>
                            <p className="text-blue-100 dark:text-zinc-400 text-xs">Powered by {advice?.model_used || 'Artificial Intelligence'}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full"
                    >
                        <FaTimes className="text-xl" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto custom-scrollbar bg-white dark:bg-dark-surface transition-colors">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-zinc-400">
                            <FaSpinner className="text-4xl animate-spin text-[#003B5C] dark:text-brand-accent mb-4" />
                            <p className="animate-pulse">Analyzing diagnostic report...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-4 rounded-xl border border-red-100 dark:border-red-800 text-center">
                            {error}
                        </div>
                    ) : advice ? (
                        <div className="space-y-6">
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50 text-sm text-[#003B5C] dark:text-blue-300">
                                <strong>Based on your report:</strong> <span className="italic">"{reportConclusion}"</span>
                            </div>

                            <div className="prose prose-blue dark:prose-invert max-w-none">
                                {/* Simple newline rendering for now, could handle markdown if needed */}
                                {advice.advice.split('\n').map((line, i) => (
                                    <p key={i} className={`mb-2 ${line.startsWith('**') || line.startsWith('##') ? 'font-bold text-[#003B5C] dark:text-zinc-100 text-lg mt-4' : 'text-gray-700 dark:text-zinc-300'}`}>
                                        {line.replace(/\*\*/g, '').replace(/##/g, '')}
                                    </p>
                                ))}
                            </div>

                            <div className="flex items-start gap-3 bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-100 dark:border-yellow-900/50 text-sm md:text-base text-yellow-800 dark:text-yellow-300 mt-6">
                                <FaLightbulb className="text-yellow-500 text-xl shrink-0 mt-0.5" />
                                <p>
                                    This advice is generated by AI for educational purposes and does not replace professional medical advice. Always consult your doctor before making significant lifestyle changes.
                                </p>
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 flex justify-end shrink-0 transition-colors">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 rounded-lg hover:bg-gray-300 dark:hover:bg-zinc-700 font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
