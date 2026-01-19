import { useTranslation } from 'react-i18next';

export const CostComparison = () => {
    const { t, i18n } = useTranslation();
    const lang = i18n.language;

    return (
        <section className="py-20 px-6 bg-gray-50 dark:bg-dark-bg transition-colors">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-zinc-100 mb-4 text-center transition-colors">
                    {lang === 'en' ? 'Why Hire a W-8BEN Contractor?' : 'Por Que Contratar PJ?'}
                </h2>
                <p className="text-slate-600 dark:text-zinc-400 text-center mb-12 max-w-3xl mx-auto transition-colors">
                    {lang === 'en'
                        ? 'Significant cost savings with zero compliance risk. Compare a $5,000/month W2 employee vs W-8BEN contractor.'
                        : 'Economia significativa com zero risco trabalhista. Compare um funcionário CLT de R$ 10.000/mês vs contratação PJ.'}
                </p>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* W2 Employee / CLT */}
                    <div className="bg-white dark:bg-dark-surface border border-red-200 dark:border-red-900/50 rounded-xl p-6 shadow-sm dark:shadow-none transition-colors">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100 transition-colors">
                                {lang === 'en' ? 'W2 Employee' : 'Funcionário CLT'}
                            </h3>
                            <span className="tech-font text-xs bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 px-3 py-1 rounded border border-red-100 dark:border-red-800 transition-colors">
                                {lang === 'en' ? 'Higher Cost' : 'Maior Custo'}
                            </span>
                        </div>

                        <div className="text-sm space-y-2 mb-4">
                            {lang === 'en' ? (
                                <>
                                    <div className="flex justify-between text-slate-600 dark:text-zinc-300 transition-colors">
                                        <span>Base Salary</span>
                                        <span className="font-semibold">$5,000</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500 dark:text-zinc-400 transition-colors">
                                        <span>Employer Taxes (FICA ~7.65%)</span>
                                        <span>$383</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500 dark:text-zinc-400 transition-colors">
                                        <span>Unemployment Insurance (~6%)</span>
                                        <span>$300</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500 dark:text-zinc-400 transition-colors">
                                        <span>Workers' Comp (~2%)</span>
                                        <span>$100</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500 dark:text-zinc-400 transition-colors">
                                        <span>Health Insurance + Benefits</span>
                                        <span>$1,000</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500 dark:text-zinc-400 transition-colors">
                                        <span>Paid Time Off (provision)</span>
                                        <span>$417</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500 dark:text-zinc-400 transition-colors">
                                        <span>Administrative Overhead</span>
                                        <span>$250</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex justify-between text-slate-600 dark:text-zinc-300 transition-colors">
                                        <span>Salário Base</span>
                                        <span className="font-semibold">R$ 10.000</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500 dark:text-zinc-400 transition-colors">
                                        <span>INSS Patronal (20%)</span>
                                        <span>R$ 2.000</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500 dark:text-zinc-400 transition-colors">
                                        <span>FGTS (8%)</span>
                                        <span>R$ 800</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500 dark:text-zinc-400 transition-colors">
                                        <span>13º Salário (provisão)</span>
                                        <span>R$ 833</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500 dark:text-zinc-400 transition-colors">
                                        <span>Férias + 1/3 (provisão)</span>
                                        <span>R$ 1.111</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500 dark:text-zinc-400 transition-colors">
                                        <span>RAT/SAT (~2%)</span>
                                        <span>R$ 200</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500 dark:text-zinc-400 transition-colors">
                                        <span>Benefícios (VT, VR, Plano)</span>
                                        <span>R$ 1.500</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500 dark:text-zinc-400 transition-colors">
                                        <span>Risco Trabalhista (provisão)</span>
                                        <span>R$ 800</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="border-t border-gray-200 dark:border-dark-border pt-3 transition-colors">
                            <div className="flex justify-between text-lg font-bold text-red-500 dark:text-red-400 transition-colors">
                                <span>{lang === 'en' ? 'Total Monthly Cost' : 'Custo Total Mensal'}</span>
                                <span>{lang === 'en' ? '$7,450' : 'R$ 17.244'}</span>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-zinc-500 text-right mt-1 transition-colors">
                                {lang === 'en' ? '+49% over base salary' : '+72% sobre o salário base'}
                            </div>
                        </div>
                    </div>

                    {/* W-8BEN Contractor / PJ */}
                    <div className="bg-white dark:bg-dark-surface border border-green-200 dark:border-green-900/50 rounded-xl p-6 shadow-sm dark:shadow-none transition-colors">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100 transition-colors">
                                {lang === 'en' ? 'W-8BEN Contractor' : 'Contratação PJ'}
                            </h3>
                            <span className="tech-font text-xs bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300 px-3 py-1 rounded border border-green-100 dark:border-green-800 transition-colors">
                                {lang === 'en' ? 'Best Value' : 'Melhor Custo'}
                            </span>
                        </div>

                        <div className="text-sm space-y-2 mb-4">
                            {lang === 'en' ? (
                                <>
                                    <div className="flex justify-between text-slate-600 dark:text-zinc-300 transition-colors">
                                        <span>Monthly Invoice</span>
                                        <span className="font-semibold">$5,000</span>
                                    </div>
                                    <div className="flex justify-between text-green-600 dark:text-green-400 transition-colors">
                                        <span>✓ Zero Withholding Tax (W-8BEN)</span>
                                        <span>$0</span>
                                    </div>
                                    <div className="flex justify-between text-green-600 dark:text-green-400 transition-colors">
                                        <span>✓ No Employer Taxes</span>
                                        <span>$0</span>
                                    </div>
                                    <div className="flex justify-between text-green-600 dark:text-green-400 transition-colors">
                                        <span>✓ No Benefits Required</span>
                                        <span>$0</span>
                                    </div>
                                    <div className="flex justify-between text-green-600 dark:text-green-400 transition-colors">
                                        <span>✓ No PTO Costs</span>
                                        <span>$0</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500 dark:text-zinc-400 transition-colors">
                                        <span>Payment Processing</span>
                                        <span>$50</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex justify-between text-slate-600 dark:text-zinc-300 transition-colors">
                                        <span>Nota Fiscal Mensal</span>
                                        <span className="font-semibold">R$ 10.000</span>
                                    </div>
                                    <div className="flex justify-between text-green-600 dark:text-green-400 transition-colors">
                                        <span>✓ Sem Encargos Trabalhistas</span>
                                        <span>R$ 0</span>
                                    </div>
                                    <div className="flex justify-between text-green-600 dark:text-green-400 transition-colors">
                                        <span>✓ Sem Férias e 13º</span>
                                        <span>R$ 0</span>
                                    </div>
                                    <div className="flex justify-between text-green-600 dark:text-green-400 transition-colors">
                                        <span>✓ Sem FGTS e INSS Patronal</span>
                                        <span>R$ 0</span>
                                    </div>
                                    <div className="flex justify-between text-green-600 dark:text-green-400 transition-colors">
                                        <span>✓ Zero Risco Trabalhista</span>
                                        <span>R$ 0</span>
                                    </div>
                                    <div className="flex justify-between text-green-600 dark:text-green-400 transition-colors">
                                        <span>✓ Sem Rescisão ou Multas</span>
                                        <span>R$ 0</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="border-t border-gray-200 dark:border-dark-border pt-3 transition-colors">
                            <div className="flex justify-between text-lg font-bold text-green-600 dark:text-green-400 transition-colors">
                                <span>{lang === 'en' ? 'Total Monthly Cost' : 'Custo Total Mensal'}</span>
                                <span>{lang === 'en' ? '$5,050' : 'R$ 10.000'}</span>
                            </div>
                            <div className="text-xs text-green-600 dark:text-green-400 text-right font-semibold mt-1 transition-colors">
                                {lang === 'en' ? 'SAVE $2,400/month (32%)' : 'ECONOMIA R$ 7.244/mês (42%)'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Benefits */}
                <div className="mt-12 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl p-8 shadow-sm dark:shadow-none transition-colors">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100 mb-6 text-center transition-colors">
                        {lang === 'en' ? 'Additional Benefits' : 'Benefícios Adicionais'}
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6 text-sm">
                        <div>
                            <div className="text-blue-600 dark:text-brand-accent font-semibold mb-2 transition-colors">
                                {lang === 'en' ? '🚀 Flexibility' : '🚀 Flexibilidade'}
                            </div>
                            <p className="text-slate-600 dark:text-zinc-400 transition-colors">
                                {lang === 'en'
                                    ? 'Scale up or down without termination complications or severance costs.'
                                    : 'Escale para cima ou para baixo sem complicações de rescisão ou custos de demissão.'}
                            </p>
                        </div>
                        <div>
                            <div className="text-blue-600 dark:text-brand-accent font-semibold mb-2 transition-colors">
                                {lang === 'en' ? '⚖️ Zero Legal Risk' : '⚖️ Zero Risco Legal'}
                            </div>
                            <p className="text-slate-600 dark:text-zinc-400 transition-colors">
                                {lang === 'en'
                                    ? 'No employment lawsuits, labor disputes, or wrongful termination claims.'
                                    : 'Sem processos trabalhistas, disputas ou ações de demissão indevida.'}
                            </p>
                        </div>
                        <div>
                            <div className="text-blue-600 dark:text-brand-accent font-semibold mb-2 transition-colors">
                                {lang === 'en' ? '📋 Simple Compliance' : '📋 Compliance Simplificado'}
                            </div>
                            <p className="text-slate-600 dark:text-zinc-400 transition-colors">
                                {lang === 'en'
                                    ? 'Just invoice payments. No complex payroll, tax filings, or HR administration.'
                                    : 'Apenas pagamento de nota fiscal. Sem folha de pagamento complexa ou administração de RH.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
