import { useTranslation } from 'react-i18next';

export const Features = () => {
    const { t, i18n } = useTranslation();
    const lang = i18n.language;

    return (
        <section className="py-20 px-6 max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-zinc-100 mb-6 transition-colors">
                        {t(`features.title_${lang}`)}
                    </h2>
                    <div className="space-y-4 text-slate-600 dark:text-zinc-400 leading-relaxed transition-colors">
                        <p>{t(`features.description_${lang}`)}</p>
                        <ul className="space-y-2 mt-4">
                            <li className="flex items-center gap-3">
                                <span className="text-blue-600 dark:text-brand-accent">✓</span>
                                {t(`features.item1_${lang}`)}
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-blue-600 dark:text-brand-accent">✓</span>
                                {t(`features.item2_${lang}`)}
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-blue-600 dark:text-brand-accent">✓</span>
                                {t(`features.item3_${lang}`)}
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Code Snippet */}
                <div className="bg-zinc-900 dark:bg-dark-surface rounded-lg border border-zinc-800 dark:border-dark-border p-6 font-mono text-sm shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    <div className="flex gap-2 mb-4">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-blue-400">
                        class <span className="text-yellow-300">RoyalTechServices</span>:
                    </div>
                    <div className="pl-4 text-slate-300">
                        def <span className="text-blue-300">deliver_value</span>(self, client_needs):
                        <br />
                        <span className="text-purple-400 ml-4">return</span> {'{'}<br />
                        &nbsp;&nbsp;"quality": <span className="text-green-400">"Production-Grade"</span>,<br />
                        &nbsp;&nbsp;"architecture": <span className="text-green-400">"Scalable"</span>,<br />
                        &nbsp;&nbsp;"reliability": <span className="text-purple-400">True</span><br />
                        {'}'}
                    </div>
                </div>
            </div>
        </section>
    );
};
