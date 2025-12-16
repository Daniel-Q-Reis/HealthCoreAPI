import { useTranslation } from 'react-i18next';

export const Projects = () => {
    const { t, i18n } = useTranslation();
    const lang = i18n.language;

    const projects = [
        {
            name: 'DrugStore API',
            url: 'https://github.com/Daniel-Q-Reis/drugstore_api',
            status: 'Live Demo',
            statusColor: 'bg-green-900 text-green-300',
            description_en: 'Enterprise-level system featuring Service Layer decoupling via DTOs, strict security hardening, and real-time analytics.',
            description_pt: 'Sistema de nível empresarial apresentando desacoplamento de Serviço via DTOs, segurança reforçada e analytics em tempo real.',
            tags: ['Python', 'Django', 'Docker'],
        },
        {
            name: 'HealthCore API',
            url: 'https://github.com/Daniel-Q-Reis/HealthCoreAPI',
            status: 'In Dev',
            statusColor: 'bg-blue-900 text-blue-300',
            description_en: 'Enterprise healthcare system with 12 DDD modules, 200+ tests (90%+ coverage), Terraform IaC, Kafka event streaming, React landing page, ADRs documentation, and Critical Control Points (CCP).',
            description_pt: 'Sistema empresarial de saúde com 12 módulos DDD, 200+ testes (90%+ cobertura), Terraform IaC, Kafka event streaming, landing page React, documentação ADRs e Pontos Críticos de Controle (CCP).',
            tags: ['DDD', 'Kafka', 'React', 'Terraform'],
        },
        {
            name: 'Social API',
            url: 'https://github.com/Daniel-Q-Reis/social_api',
            status: 'Go',
            statusColor: 'bg-slate-700 text-slate-300',
            description_en: 'High-performance backend emphasizing raw SQL optimization and comprehensive integration tests for reliability.',
            description_pt: 'Backend de alta performance enfatizando otimização SQL pura e testes de integração abrangentes para confiabilidade.',
            tags: ['Golang', 'PostgreSQL', 'JWT'],
        },
    ];

    return (
        <section className="py-20 bg-slate-800/30 px-6">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-white mb-12 text-center">
                    {t(`projects.title_${lang}`)}
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project) => (
                        <a
                            key={project.name}
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-brand-dark p-6 rounded-xl border border-slate-700 hover:border-brand-accent transition group block"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-white group-hover:text-brand-accent transition">
                                    {project.name}
                                </h3>
                                <span className={`text-xs font-mono ${project.statusColor} px-2 py-1 rounded`}>
                                    {project.status}
                                </span>
                            </div>
                            <p className="text-slate-400 mb-6 text-sm h-24">
                                {lang === 'pt' ? project.description_pt : project.description_en}
                            </p>
                            <div className="flex flex-wrap gap-2 text-xs font-mono text-slate-500">
                                {project.tags.map((tag) => (
                                    <span key={tag} className="bg-slate-800 px-2 py-1 rounded">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
};
