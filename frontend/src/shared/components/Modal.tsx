
import React, { ReactNode, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div
                className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full flex flex-col border border-gray-100 dark:border-zinc-800 overflow-hidden transition-colors"
                style={{ maxWidth }}
            >
                {/* Header */}
                <div className="bg-[#003B5C] dark:bg-zinc-900 px-6 py-4 flex justify-between items-center border-b border-[#002a42] dark:border-zinc-800 transition-colors">
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                    >
                        <FaTimes className="text-lg" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[80vh] text-gray-700 dark:text-zinc-300">
                    {children}
                </div>
            </div>
        </div>
    );
};
