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
        <section className="py-12 bg-slate-900/50 border-y border-slate-800">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center opacity-60 hover:opacity-100 transition-opacity duration-500">
                    {techs.map((tech) => {
                        const Icon = tech.icon;
                        return (
                            <div key={tech.name} className="text-center group">
                                <Icon className="w-12 h-12 mx-auto mb-2 text-white group-hover:text-brand-accent transition-colors" />
                                <div className="font-bold text-sm text-white">{tech.name}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
