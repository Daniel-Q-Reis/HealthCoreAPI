import { useTranslation } from 'react-i18next';
import { FiGlobe } from 'react-icons/fi';
import { DarkModeToggle } from '@/shared/components/ui/DarkModeToggle';

export const Navbar = () => {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'pt' : 'en';
        i18n.changeLanguage(newLang);
        localStorage.setItem('royal_tech_lang', newLang);
    };

    return (
        <nav className="fixed w-full z-50 bg-white/90 dark:bg-dark-surface/90 backdrop-blur border-b border-gray-200 dark:border-dark-border transition-colors">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="font-bold text-2xl text-slate-900 dark:text-zinc-100 tracking-tighter transition-colors">
                        ROYAL<span className="text-blue-600 dark:text-brand-accent">TECH</span>
                    </div>
                    <div className="tech-font text-xs bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded text-slate-500 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 transition-colors">&lt;/&gt;</div>
                </div>

                <div className="flex items-center gap-4">
                    <DarkModeToggle />
                    <button
                        onClick={toggleLanguage}
                        className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition flex items-center gap-2 border border-gray-200 dark:border-slate-700 px-3 py-1 rounded hover:border-blue-500 dark:hover:border-brand-accent"
                    >
                        <span>{i18n.language === 'en' ? 'PT-BR' : 'EN-US'}</span>
                        <FiGlobe className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </nav>
    );
};
