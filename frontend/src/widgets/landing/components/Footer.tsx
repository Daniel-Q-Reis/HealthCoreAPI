import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SecurityModal } from './SecurityModal';

export const Footer = () => {
    const { t } = useTranslation();
    const [modalConfig, setModalConfig] = useState<{ isOpen: boolean, title: string, url: string }>(
        { isOpen: false, title: '', url: '' }
    );

    const openModal = (title: string, url: string) => {
        setModalConfig({ isOpen: true, title, url });
    };

    return (
        <footer className="border-t border-slate-800 py-12 bg-black">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                <div>
                    <div className="font-bold text-lg text-white mb-4">ROYAL TECH</div>
                    <p className="text-slate-500 text-sm">{t('footer.tagline')}</p>
                </div>

                <div>
                    <h4 className="font-bold text-white mb-4">About the Medical Center</h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li><a href="#" className="hover:text-blue-400 transition">Our History</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition">Mission & Vision</a></li>
                        <li>
                            <button
                                onClick={() => openModal('HIPAA Compliance', 'https://www.youtube.com/watch?v=s9znUYvVO4A')}
                                className="hover:text-blue-400 transition text-left"
                            >
                                HIPAA Compliance (Video)
                            </button>
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-white mb-4">For Patients & Visitors</h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li><a href="#" className="hover:text-blue-400 transition">Visitor Policy</a></li>
                        <li><a href="/login" className="hover:text-blue-400 transition">Patient Portal Login</a></li>
                        <li>
                            <button
                                onClick={() => openModal('Role-Based Access Control', 'https://www.youtube.com/watch?v=fxa8Jo1ViqA')}
                                className="hover:text-blue-400 transition text-left"
                            >
                                Security & RBAC (Video)
                            </button>
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-white mb-4">Contact Us</h4>
                    <div className="flex gap-4">
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
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 text-center border-t border-slate-900 pt-8">
                <div className="text-xs text-slate-600 space-y-1">
                    <p>{t('footer.copyright')}</p>
                    <p>{t('footer.entity')}</p>
                </div>
            </div>

            <SecurityModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                title={modalConfig.title}
                videoUrl={modalConfig.url}
            />
        </footer>
    );
};
