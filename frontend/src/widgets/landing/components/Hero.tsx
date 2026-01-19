import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { SiPython, SiDjango, SiGo, SiAmazon, SiDocker, SiPostgresql } from 'react-icons/si';

const techStacks = [
    { name: 'Python & Django', icon: SiPython, color: 'from-blue-600 to-yellow-500', Icon2: SiDjango },
    { name: 'Golang', icon: SiGo, color: 'from-cyan-500 to-blue-600' },
    { name: 'AWS Cloud', icon: SiAmazon, color: 'from-orange-500 to-yellow-600' },
    { name: 'Docker', icon: SiDocker, color: 'from-blue-500 to-cyan-400' },
    { name: 'PostgreSQL', icon: SiPostgresql, color: 'from-blue-600 to-white' },
];

export const Hero = () => {
    const { t, i18n } = useTranslation();
    const [currentStack, setCurrentStack] = useState(0);
    const lang = i18n.language;

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStack((prev) => (prev + 1) % techStacks.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const current = techStacks[currentStack];
    const Icon = current.icon;
    const Icon2 = current.Icon2;

    return (
        <section className="pt-32 pb-20 px-6 bg-white dark:bg-dark-bg transition-colors">
            <div className="max-w-4xl mx-auto text-center">
                {/* Badge */}
                <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-dark-surface border border-blue-100 dark:border-dark-border text-blue-600 dark:text-brand-accent text-sm font-semibold tracking-wide transition-colors">
                    {t(`hero.badge_${lang}`)}
                </div>

                {/* Title */}
                <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-zinc-100 mb-6 tracking-tight transition-colors">
                    {t(`hero.title_${lang}`)}
                </h1>

                {/* Subtitle */}
                <p className="text-xl text-slate-600 dark:text-zinc-400 mb-10 max-w-3xl mx-auto leading-relaxed transition-colors">
                    {t(`hero.subtitle_${lang}`)}
                </p>

                {/* Tech Stack Banner Carousel */}
                <div className="mb-10 h-48 relative overflow-hidden rounded-xl border border-gray-200 dark:border-dark-border shadow-sm dark:shadow-none">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStack}
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ duration: 0.5 }}
                            className={`absolute inset-0 bg-gradient-to-r ${current.color} flex items-center justify-center gap-6`}
                        >
                            <Icon className="w-24 h-24 text-white drop-shadow-2xl" />
                            {Icon2 && <Icon2 className="w-24 h-24 text-white drop-shadow-2xl" />}
                            <h2 className="text-4xl font-bold text-white drop-shadow-lg">
                                {current.name}
                            </h2>
                        </motion.div>
                    </AnimatePresence>

                    {/* Carousel Indicators */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                        {techStacks.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentStack(idx)}
                                className={`w-2 h-2 rounded-full transition-all ${idx === currentStack ? 'bg-white w-8' : 'bg-white/50'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                        href="/admin/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group bg-blue-600 dark:bg-brand-accent hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold py-3.5 px-8 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 dark:shadow-none border border-transparent"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        {t(`hero.cta_admin_${lang}`)}
                    </a>
                    <a
                        href="/api/v1/schema/swagger-ui/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-dark-hover text-slate-700 dark:text-zinc-100 font-semibold py-3.5 px-8 rounded-lg border border-gray-200 dark:border-dark-border transition-all flex items-center justify-center gap-2 shadow-sm dark:shadow-none"
                    >
                        <svg className="w-5 h-5 text-blue-600 dark:text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        {t(`hero.cta_docs_${lang}`)}
                    </a>
                </div>

                <p className="mt-4 text-xs text-slate-500 dark:text-zinc-500 tech-font">
                    User: user@user.com | Pass: user1234
                </p>
            </div>
        </section>
    );
};
