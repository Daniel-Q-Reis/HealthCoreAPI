import React from 'react';
import { FaTimes, FaYoutube } from 'react-icons/fa';

interface SecurityModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    videoUrl: string;
}

export const SecurityModal = ({ isOpen, onClose, title, videoUrl }: SecurityModalProps) => {
    if (!isOpen) return null;

    // Convert youtube watch URL to embed URL if needed
    // URL format: https://www.youtube.com/watch?v=VIDEO_ID -> https://www.youtube.com/embed/VIDEO_ID
    const embedUrl = videoUrl.replace("watch?v=", "embed/");

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col border border-gray-200 dark:border-dark-border transition-colors">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-zinc-900 transition-colors">
                    <div className="flex items-center gap-3">
                        <FaYoutube className="text-red-600 dark:text-red-500 text-2xl" />
                        <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100 transition-colors">{title}</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <FaTimes className="text-2xl" />
                    </button>
                </div>
                <div className="relative pt-[56.25%] bg-black">
                    <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={embedUrl}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen>
                    </iframe>
                </div>
            </div>
        </div>
    );
};
