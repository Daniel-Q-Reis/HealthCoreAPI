import React, { useState } from 'react';
import { MainLayout } from '@/shared/layout/MainLayout';
import { resultsApi, LifestyleAdvice } from '@/features/results/api';
import { FaFlask, FaMagic, FaFileMedicalAlt, FaRobot, FaLightbulb, FaSpinner } from 'react-icons/fa';
import { Modal } from '@/shared/components/Modal';

export const ResultsPage = () => {
    const [diagnosisInput, setDiagnosisInput] = useState('');
    const [advice, setAdvice] = useState<LifestyleAdvice | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!diagnosisInput.trim()) return;

        setIsLoading(true);
        setError(null);
        setAdvice(null);

        try {
            const data = await resultsApi.analyzeDiagnosis(diagnosisInput);
            setAdvice(data);
            setIsModalOpen(true);
        } catch (err: any) {
            console.error(err);
            setError("Unable to generate advice. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12 transition-colors">
                <div className="container mx-auto px-4 max-w-5xl">

                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-block p-4 bg-gradient-to-br from-[#003B5C] to-[#0066CC] dark:from-zinc-800 dark:to-zinc-700 rounded-2xl shadow-lg mb-6">
                            <FaRobot className="text-4xl text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-[#003B5C] dark:text-zinc-100 mb-4">AI Lifestyle Advisor</h1>
                        <p className="text-xl text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto">
                            Enter your diagnosis below to receive personalized, AI-powered lifestyle and dietary recommendations to improve your well-being.
                        </p>
                    </div>

                    {/* Input Section */}
                    <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl p-8 mb-12 border border-gray-100 dark:border-zinc-800 transition-colors">
                        <form onSubmit={handleAnalyze} className="space-y-6">
                            <div>
                                <label htmlFor="diagnosis" className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-2">
                                    Your Diagnosis / Medical Condition
                                </label>
                                <textarea
                                    id="diagnosis"
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:border-[#0066CC] dark:focus:border-brand-accent focus:ring focus:ring-blue-200 dark:focus:ring-brand-accent/20 transition-all text-gray-700 dark:text-zinc-100 text-lg placeholder-gray-400 dark:placeholder-zinc-600"
                                    placeholder="e.g., Type 2 Diabetes, High Cholesterol, Hypertension..."
                                    value={diagnosisInput}
                                    onChange={(e) => setDiagnosisInput(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading || !diagnosisInput.trim()}
                                className="w-full bg-gradient-to-r from-[#003B5C] to-[#0066CC] hover:from-[#002a42] hover:to-[#0055aa] dark:from-sky-700 dark:to-blue-700 dark:hover:from-sky-600 dark:hover:to-blue-600 text-white font-bold py-4 rounded-xl shadow-md transition-all transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                            >
                                {isLoading ? (
                                    <>
                                        <FaSpinner className="animate-spin" /> Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <FaMagic className="text-yellow-300" /> Generate Recommendation
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Results Section */}
                    {error && (
                        <div className="mb-12 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 rounded-r-xl">
                            <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
                        </div>
                    )}

                    {/* Results Modal */}
                    <Modal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        title="AI Analysis Results"
                        maxWidth="800px"
                    >
                        {advice && (
                            <div className="animate-fade-in bg-white dark:bg-dark-surface text-gray-800 dark:text-zinc-200">
                                <div className="bg-[#003B5C] dark:bg-zinc-800 p-6 rounded-xl text-white flex items-center justify-between mb-6 shadow-md transition-colors">
                                    <div className="flex items-center gap-3">
                                        <FaLightbulb className="text-2xl text-yellow-300" />
                                        <h3 className="text-xl font-bold">Recommended Lifestyle Changes</h3>
                                    </div>
                                    <span className="text-xs bg-white/20 px-3 py-1 rounded-full">{advice.model_used}</span>
                                </div>
                                <div className="">
                                    <div className="prose prose-blue dark:prose-invert max-w-none text-gray-700 dark:text-zinc-300">
                                        {advice.advice.split('\n').map((line, i) => (
                                            <p key={i} className={`mb-3 ${line.startsWith('**') || line.startsWith('##') ? 'font-bold text-[#003B5C] dark:text-zinc-100 text-lg mt-6' : ''}`}>
                                                {line.replace(/\*\*/g, '').replace(/##/g, '')}
                                            </p>
                                        ))}
                                    </div>
                                    <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-100 dark:border-yellow-900/50 text-sm text-yellow-800 dark:text-yellow-200 flex gap-3">
                                        <FaFileMedicalAlt className="text-xl shrink-0 mt-0.5" />
                                        <p>
                                            <strong>Disclaimer:</strong> This information is generated by AI for educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Modal>

                    {/* "Coming Soon" Medical Reports Section */}
                    <div className="border-t border-gray-200 dark:border-zinc-800 pt-12 transition-colors">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-400 dark:text-zinc-500">Your Medical Reports</h2>
                                <p className="text-gray-400 dark:text-zinc-600">Access your official lab results and imaging history.</p>
                            </div>
                            <div className="bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 px-4 py-1 rounded-full text-sm font-bold">
                                Coming Soon
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 opacity-60 grayscale select-none pointer-events-none">
                            {[1, 2].map((i) => (
                                <div key={i} className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-gray-200 dark:border-zinc-700 flex gap-4 transition-colors">
                                    <div className="bg-gray-100 dark:bg-zinc-700 w-12 h-12 rounded-lg flex items-center justify-center shrink-0">
                                        <FaFlask className="text-gray-400 dark:text-zinc-500 text-xl" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-200 dark:bg-zinc-600 rounded w-3/4 mb-3"></div>
                                        <div className="h-3 bg-gray-100 dark:bg-zinc-700 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </MainLayout>
    );
};
