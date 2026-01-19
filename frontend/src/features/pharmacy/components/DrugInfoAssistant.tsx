import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { pharmacyApi } from '../api';
import { Bot, Loader2, BookOpen, AlertCircle } from 'lucide-react';
import { DrugInfoResponse } from '../types';

interface DrugInfoAssistantProps {
    medicationName: string;
    patientContext?: string;
    onApplyInfo?: (info: string) => void;
}

export const DrugInfoAssistant: React.FC<DrugInfoAssistantProps> = ({
    medicationName,
    patientContext,
    onApplyInfo
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [info, setInfo] = useState<DrugInfoResponse | null>(null);

    const { mutate: fetchInfo, isLoading, error } = useMutation({
        mutationFn: pharmacyApi.getDrugInfo,
        onSuccess: (data) => {
            setInfo(data);
            setIsOpen(true);
        }
    });

    const handleAskAI = () => {
        if (!medicationName) return;
        fetchInfo({
            medication_name: medicationName,
            patient_context: patientContext
        });
    };

    if (!medicationName && !isOpen) return null;

    return (
        <div className="rounded-lg border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/50 dark:bg-indigo-900/10 p-4 transition-colors">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Bot className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">AI Drug Assistant</h3>
                </div>
                {!isOpen && (
                    <button
                        type="button"
                        onClick={handleAskAI}
                        disabled={isLoading || !medicationName}
                        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            'Ask AI Agent'
                        )}
                    </button>
                )}
            </div>

            {error && (
                <div className="mt-3 rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
                    Error consulting AI: {(error as Error).message}
                </div>
            )}

            {isOpen && info && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                    <div className="prose prose-sm max-w-none rounded-md bg-white dark:bg-dark-surface p-4 shadow-sm ring-1 ring-gray-200 dark:ring-zinc-700 transition-colors">
                        <div className="mb-2 flex items-center justify-between border-b dark:border-zinc-700 pb-2">
                            <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">
                                Model: {info.model_used}
                            </span>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-xs text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                            >
                                Close
                            </button>
                        </div>
                        <div className="whitespace-pre-wrap text-sm text-gray-700 dark:text-zinc-300">
                            {info.information}
                        </div>

                        <div className="mt-3 flex items-start space-x-2 rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-2 text-xs text-yellow-800 dark:text-yellow-200">
                            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            <p>
                                <strong>Disclaimer:</strong> AI-generated content. Always verify with official clinical resources.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
