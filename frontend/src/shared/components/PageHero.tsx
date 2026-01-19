
import React from 'react';
import { motion } from 'framer-motion';

interface PageHeroProps {
    title: string;
    description: string;
    image: string;
    parentSection?: string;
}

export const PageHero: React.FC<PageHeroProps> = ({ title, description, image, parentSection = "Medical Center" }) => {
    return (
        <div className="bg-[#003B5C] dark:bg-zinc-900 text-white py-12 relative overflow-hidden -mt-[108px] pt-[150px] transition-colors">
            {/* Background Image */}
            <div className="absolute inset-0 opacity-20 dark:opacity-50 transition-opacity">
                <img
                    src={image}
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#003B5C] to-transparent dark:from-zinc-900 dark:to-zinc-900/0 transition-colors" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="text-[#FFD100] font-semibold mb-2 uppercase tracking-wider text-sm flex items-center gap-2">
                        <span>🏠</span>
                        <span>›</span>
                        <span>{parentSection}</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        {title}
                    </h1>
                    <p className="text-xl text-blue-100 max-w-2xl">
                        {description}
                    </p>
                </motion.div>
            </div>
        </div>
    );
};
