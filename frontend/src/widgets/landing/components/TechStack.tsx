import { SiPython, SiDjango, SiGo, SiAmazon, SiDocker, SiPostgresql } from 'react-icons/si';

export const TechStack = () => {
    const techs = [
        { name: 'Go (Golang)', icon: SiGo },
        { name: 'Python', icon: SiPython },
        { name: 'Django', icon: SiDjango },
        { name: 'AWS', icon: SiAmazon },
        { name: 'Docker', icon: SiDocker },
        { name: 'PostgreSQL', icon: SiPostgresql },
    ];

    return (
        <section className="py-12 bg-white dark:bg-dark-bg border-y border-gray-200 dark:border-dark-border transition-colors">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center opacity-80 hover:opacity-100 transition-opacity duration-500">
                    {techs.map((tech) => {
                        const Icon = tech.icon;
                        return (
                            <div key={tech.name} className="text-center group">
                                <Icon className="w-12 h-12 mx-auto mb-2 text-slate-600 dark:text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-brand-accent transition-colors" />
                                <div className="font-bold text-sm text-slate-900 dark:text-zinc-100 transition-colors">{tech.name}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
