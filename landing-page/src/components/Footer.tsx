import { useTranslation } from 'react-i18next';

export const Footer = () => {
    const { t } = useTranslation();

    return (
        <footer className="border-t border-slate-800 py-12 bg-black">
            <div className="max-w-7xl mx-auto px-6 text-center">
                <div className="font-bold text-lg text-white mb-2">ROYAL TECH</div>
                <p className="text-slate-500 text-sm mb-6">{t('footer.tagline')}</p>

                <div className="text-xs text-slate-600 space-y-1">
                    <p>{t('footer.copyright')}</p>
                    <p>{t('footer.entity')}</p>
                </div>

                <div className="mt-8 flex justify-center gap-6">
                    <a
                        href="https://github.com/Daniel-Q-Reis"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-500 hover:text-white transition"
                    >
                        GitHub
                    </a>
                    <a
                        href="https://linkedin.com/in/danielqreis"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-500 hover:text-white transition"
                    >
                        LinkedIn
                    </a>
                    <a href="mailto:danielqreis@gmail.com" className="text-slate-500 hover:text-white transition">
                        Email
                    </a>
                </div>
            </div>
        </footer>
    );
};
