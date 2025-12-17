import { useTranslation } from 'react-i18next';
import { FiGlobe } from 'react-icons/fi';

export const Navbar = () => {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'pt' : 'en';
        i18n.changeLanguage(newLang);
        localStorage.setItem('royal_tech_lang', newLang);
    };

    return (
        <nav className="fixed w-full z-50 bg-brand-dark/90 backdrop-blur border-b border-slate-800">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="font-bold text-2xl text-white tracking-tighter">
                        ROYAL<span className="text-brand-accent">TECH</span>
                    </div>
                    <div className="tech-font text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">&lt;/&gt;</div>
                </div>

                <button
                    onClick={toggleLanguage}
                    className="text-sm font-medium hover:text-white transition flex items-center gap-2 border border-slate-700 px-3 py-1 rounded hover:border-brand-accent"
                >
                    <span>{i18n.language === 'en' ? 'PT-BR' : 'EN-US'}</span>
                    <FiGlobe className="w-4 h-4" />
                </button>
            </div>
        </nav>
    );
};
