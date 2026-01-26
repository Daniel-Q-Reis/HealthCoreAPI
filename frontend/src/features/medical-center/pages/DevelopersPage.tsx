
import React from 'react';
import { MainLayout } from '@/shared/layout/MainLayout';
import { PageHero } from '@/shared/components/PageHero';
import { FaServer, FaDatabase, FaChartLine, FaGithub, FaLinkedin, FaBook, FaLock, FaExternalLinkAlt, FaCode } from 'react-icons/fa';

export const DevelopersPage = () => {
    const services = [
        {
            name: "Landing Page",
            url: "https://app.danielqreis.com/dqr-health",
            desc: "Modern React + TypeScript landing page with bilingual support (PT/EN)",
            icon: <FaCode />,
            creds: "-"
        },
        {
            name: "RESTful API with DRF",
            url: "https://github.com/Daniel-Q-Reis/HealthCoreAPI",
            desc: "Backend Core - Django REST Framework",
            icon: <FaServer />,
            creds: "-"
        },
        {
            name: "API Documentation (Swagger)",
            url: "https://api.danielqreis.com/api/docs/",
            desc: "Interactive Swagger UI for API exploration",
            icon: <FaBook />,
            creds: "-"
        },
        {
            name: "API Documentation (ReDoc)",
            url: "https://api.danielqreis.com/api/redoc/",
            desc: "Alternative OpenAPI documentation with ReDoc",
            icon: <FaBook />,
            creds: "-"
        },
        {
            name: "Django Admin",
            url: "https://api.danielqreis.com/admin/",
            desc: "Native Django Administration Interface",
            icon: <FaLock />,
            creds: "admin / admin123"
        },
        {
            name: "Grafana Metrics Dashboard",
            url: "https://ca-grafana.politebush-1e329a2d.centralus.azurecontainerapps.io/a/grafana-metricsdrilldown-app/drilldown",
            desc: "Real-time observability dashboards with Prometheus metrics (p99 latency, throughput)",
            icon: <FaChartLine />,
            creds: "admin / admin123"
        },
        {
            name: "Prometheus",
            url: "https://ca-prometheus.politebush-1e329a2d.centralus.azurecontainerapps.io",
            desc: "Metrics collection and monitoring system",
            icon: <FaChartLine />,
            creds: "-"
        },
        {
            name: "Go Audit Microservice (gRPC)",
            url: "https://github.com/Daniel-Q-Reis/HealthCoreAPI/tree/main/services/audit-service",
            desc: "High-performance audit logging with <100ms cold-start latency (Kafka → MongoDB)",
            icon: <FaServer />,
            creds: "Internal gRPC service"
        }
    ];

    const infrastructure = [
        { name: "PostgreSQL", url: "Azure Database for PostgreSQL", desc: "Primary Relational Database (Managed)", creds: "Configured via Terraform" },
        { name: "Redis", url: "Azure Cache for Redis", desc: "Cache layer & Celery broker (Managed)", creds: "Configured via Terraform" },
        { name: "MongoDB", url: "Azure CosmosDB (MongoDB API)", desc: "Document database for audit logs (append-only)", creds: "Configured via Terraform" },
        { name: "Event Hubs", url: "Azure Event Hubs (Kafka)", desc: "Event streaming platform", creds: "Configured via Terraform" }
    ];

    return (
        <MainLayout>
            <PageHero
                title="For Developers"
                description="Technical overview, service endpoints, and documentation for the HealthCoreAPI project."
                image="/images/imaging.png"
                parentSection="Project Overview"
            />

            <div className="py-16 bg-gray-50 dark:bg-dark-bg transition-colors">
                <div className="container mx-auto px-4">

                    {/* Documentation Links */}
                    <div className="flex flex-col md:flex-row gap-6 mb-16">
                        <a
                            href="https://github.com/Daniel-Q-Reis/HealthCoreAPI/blob/main/DOCS.md"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-white dark:bg-dark-surface p-6 rounded-xl shadow-md border-l-4 border-[#003B5C] dark:border-blue-500 hover:shadow-lg transition group"
                        >
                            <div className="flex items-center gap-4">
                                <FaGithub className="text-4xl text-gray-800 dark:text-zinc-200" />
                                <div>
                                    <h3 className="text-xl font-bold text-[#003B5C] dark:text-zinc-100 group-hover:underline flex items-center gap-2">
                                        Project Documentation <FaExternalLinkAlt className="text-xs" />
                                    </h3>
                                    <p className="text-gray-600 dark:text-zinc-400">Access full technical documentation on GitHub.</p>
                                </div>
                            </div>
                        </a>

                        <a
                            href="https://github.com/Daniel-Q-Reis"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-white dark:bg-dark-surface p-6 rounded-xl shadow-md border-l-4 border-[#0066CC] dark:border-blue-400 hover:shadow-lg transition group"
                        >
                            <div className="flex items-center gap-4">
                                <FaLinkedin className="text-4xl text-[#0077b5]" />
                                <div>
                                    <h3 className="text-xl font-bold text-[#003B5C] dark:text-zinc-100 group-hover:underline flex items-center gap-2">
                                        Connect with Daniel <FaExternalLinkAlt className="text-xs" />
                                    </h3>
                                    <p className="text-gray-600 dark:text-zinc-400">View profile and other projects.</p>
                                </div>
                            </div>
                        </a>
                    </div>

                    {/* Services Grid */}
                    <h2 className="text-3xl font-bold text-[#003B5C] dark:text-zinc-100 mb-8">Active Services & Endpoints</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                        {services.map((svc, idx) => (
                            <div key={idx} className="bg-white dark:bg-dark-surface rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-zinc-800 flex flex-col hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                                <div className="p-6 flex-1">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-blue-50 dark:bg-zinc-800 p-2 rounded-lg text-xl text-[#004B87] dark:text-blue-400">
                                            {svc.icon}
                                        </div>
                                        <h3 className="font-bold text-lg text-[#003B5C] dark:text-zinc-100">{svc.name}</h3>
                                    </div>
                                    <p className="text-gray-600 dark:text-zinc-400 text-sm mb-4">{svc.desc}</p>
                                    <a
                                        href={svc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#0066CC] dark:text-brand-accent hover:underline text-sm font-semibold break-all flex items-center gap-1"
                                    >
                                        {svc.url} <FaExternalLinkAlt className="text-[10px]" />
                                    </a>
                                </div>
                                <div className="bg-gray-50 dark:bg-zinc-900 px-6 py-3 border-t border-gray-100 dark:border-zinc-800 text-xs text-gray-500 dark:text-zinc-500 font-mono">
                                    <strong>User:</strong> {svc.creds}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Infrastructure Table */}
                    <h2 className="text-3xl font-bold text-[#003B5C] dark:text-zinc-100 mb-8">Infrastructure & Database</h2>
                    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-zinc-800 transition-colors">
                        <table className="w-full text-left">
                            <thead className="bg-[#003B5C] dark:bg-zinc-800 text-white transition-colors">
                                <tr>
                                    <th className="p-4">Service</th>
                                    <th className="p-4">Address (Internal)</th>
                                    <th className="p-4">Description</th>
                                    <th className="p-4">Default Creds</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {infrastructure.map((infra, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition">
                                        <td className="p-4 font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                                            <FaDatabase className="text-gray-400" /> {infra.name}
                                        </td>
                                        <td className="p-4 font-mono text-sm text-[#0066CC] dark:text-blue-400">{infra.url}</td>
                                        <td className="p-4 text-gray-600 dark:text-zinc-400 text-sm">{infra.desc}</td>
                                        <td className="p-4 font-mono text-xs text-gray-500 dark:text-zinc-500">{infra.creds}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </MainLayout>
    );
};
