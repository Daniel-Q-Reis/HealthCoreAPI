
import React from 'react';
import { MainLayout } from '@/shared/layout/MainLayout';
import { PageHero } from '@/shared/components/PageHero';
import { FaServer, FaDatabase, FaChartLine, FaGithub, FaLinkedin, FaBook, FaLock, FaExternalLinkAlt, FaCode } from 'react-icons/fa';

export const DevelopersPage = () => {
    const services = [
        {
            name: "Landing Page",
            url: "http://localhost:5173",
            desc: "Modern React + TypeScript landing page with bilingual support (PT/EN)",
            icon: <FaCode />,
            creds: "-"
        },
        {
            name: "Django API",
            url: "http://localhost:8000",
            desc: "RESTful API with DRF (Backend Core)",
            icon: <FaServer />,
            creds: "user@user.com / user1234"
        },
        {
            name: "API Documentation",
            url: "http://localhost:5173/api/docs/",
            desc: "Interactive Swagger UI for API exploration",
            icon: <FaBook />,
            creds: "-"
        },
        {
            name: "Django Admin",
            url: "http://localhost:8000/admin",
            desc: "Native Django Administration Interface",
            icon: <FaLock />,
            creds: "user@user.com / user1234"
        },
        {
            name: "Grafana",
            url: "http://localhost:3000",
            desc: "Observability dashboards & visualization",
            icon: <FaChartLine />,
            creds: "admin / admin"
        },
        {
            name: "Prometheus",
            url: "http://localhost:9090",
            desc: "Metrics collection and monitoring",
            icon: <FaChartLine />,
            creds: "-"
        }
    ];

    const infrastructure = [
        { name: "PostgreSQL", url: "localhost:5432", desc: "Primary Relational Database", creds: "postgres / postgres" },
        { name: "Redis", url: "localhost:6379", desc: "Cache layer & Celery broker", creds: "-" },
        { name: "Kafka", url: "localhost:9092", desc: "Event streaming platform (KRaft mode)", creds: "-" }
    ];

    return (
        <MainLayout>
            <PageHero
                title="For Developers"
                description="Technical overview, service endpoints, and documentation for the HealthCoreAPI project."
                image="/images/imaging.png"
                parentSection="Project Overview"
            />

            <div className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">

                    {/* Documentation Links */}
                    <div className="flex flex-col md:flex-row gap-6 mb-16">
                        <a
                            href="https://github.com/Daniel-Q-Reis/HealthCoreAPI/blob/main/DOCS.md"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-white p-6 rounded-xl shadow-md border-l-4 border-[#003B5C] hover:shadow-lg transition group"
                        >
                            <div className="flex items-center gap-4">
                                <FaGithub className="text-4xl text-gray-800" />
                                <div>
                                    <h3 className="text-xl font-bold text-[#003B5C] group-hover:underline flex items-center gap-2">
                                        Project Documentation <FaExternalLinkAlt className="text-xs" />
                                    </h3>
                                    <p className="text-gray-600">Access full technical documentation on GitHub.</p>
                                </div>
                            </div>
                        </a>

                        <a
                            href="https://github.com/Daniel-Q-Reis"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-white p-6 rounded-xl shadow-md border-l-4 border-[#0066CC] hover:shadow-lg transition group"
                        >
                            <div className="flex items-center gap-4">
                                <FaLinkedin className="text-4xl text-[#0077b5]" />
                                <div>
                                    <h3 className="text-xl font-bold text-[#003B5C] group-hover:underline flex items-center gap-2">
                                        Connect with Daniel <FaExternalLinkAlt className="text-xs" />
                                    </h3>
                                    <p className="text-gray-600">View profile and other projects.</p>
                                </div>
                            </div>
                        </a>
                    </div>

                    {/* Services Grid */}
                    <h2 className="text-3xl font-bold text-[#003B5C] mb-8">Active Services & Endpoints</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                        {services.map((svc, idx) => (
                            <div key={idx} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 flex flex-col hover:border-blue-300 transition-colors">
                                <div className="p-6 flex-1">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-blue-50 p-2 rounded-lg text-xl text-[#004B87]">
                                            {svc.icon}
                                        </div>
                                        <h3 className="font-bold text-lg text-[#003B5C]">{svc.name}</h3>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-4">{svc.desc}</p>
                                    <a
                                        href={svc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#0066CC] hover:underline text-sm font-semibold break-all flex items-center gap-1"
                                    >
                                        {svc.url} <FaExternalLinkAlt className="text-[10px]" />
                                    </a>
                                </div>
                                <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 text-xs text-gray-500 font-mono">
                                    <strong>User:</strong> {svc.creds}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Infrastructure Table */}
                    <h2 className="text-3xl font-bold text-[#003B5C] mb-8">Infrastructure & Database</h2>
                    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                        <table className="w-full text-left">
                            <thead className="bg-[#003B5C] text-white">
                                <tr>
                                    <th className="p-4">Service</th>
                                    <th className="p-4">Address (Internal)</th>
                                    <th className="p-4">Description</th>
                                    <th className="p-4">Default Creds</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {infrastructure.map((infra, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition">
                                        <td className="p-4 font-bold text-gray-800 flex items-center gap-2">
                                            <FaDatabase className="text-gray-400" /> {infra.name}
                                        </td>
                                        <td className="p-4 font-mono text-sm text-[#0066CC]">{infra.url}</td>
                                        <td className="p-4 text-gray-600 text-sm">{infra.desc}</td>
                                        <td className="p-4 font-mono text-xs text-gray-500">{infra.creds}</td>
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
