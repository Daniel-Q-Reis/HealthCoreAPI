import { useTranslation } from 'react-i18next';

export const CostComparison = () => {
    const { t, i18n } = useTranslation();
    const lang = i18n.language;

    return (
        <section className="py-20 px-6 bg-slate-900/30">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-white mb-4 text-center">
                    {lang === 'en' ? 'Why Hire a W-8BEN Contractor?' : 'Por Que Contratar PJ?'}
                </h2>
                <p className="text-slate-400 text-center mb-12 max-w-3xl mx-auto">
                    {lang === 'en'
                        ? 'Significant cost savings with zero compliance risk. Compare a $5,000/month W2 employee vs W-8BEN contractor.'
                        : 'Economia significativa com zero risco trabalhista. Compare um funcionário CLT de R$ 10.000/mês vs contratação PJ.'}
                </p>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* W2 Employee / CLT */}
                    <div className="bg-brand-dark border border-red-900/50 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xl font-bold text-white">
                                {lang === 'en' ? 'W2 Employee' : 'Funcionário CLT'}
                            </h3>
                            <span className="tech-font text-xs bg-red-900/30 text-red-300 px-3 py-1 rounded border border-red-800">
                                {lang === 'en' ? 'Higher Cost' : 'Maior Custo'}
                            </span>
                        </div>

                        <div className="text-sm space-y-2 mb-4">
                            {lang === 'en' ? (
                                <>
                                    <div className="flex justify-between text-slate-300">
                                        <span>Base Salary</span>
                                        <span className="font-semibold">$5,000</span>
                                    </div>
                                    <div className="flex justify-between text-slate-400">
                                        <span>Employer Taxes (FICA ~7.65%)</span>
                                        <span>$383</span>
                                    </div>
                                    <div className="flex justify-between text-slate-400">
                                        <span>Unemployment Insurance (~6%)</span>
                                        <span>$300</span>
                                    </div>
                                    <div className="flex justify-between text-slate-400">
                                        <span>Workers' Comp (~2%)</span>
                                        <span>$100</span>
                                    </div>
                                    <div className="flex justify-between text-slate-400">
                                        <span>Health Insurance + Benefits</span>
                                        <span>$1,000</span>
                                    </div>
                                    <div className="flex justify-between text-slate-400">
                                        <span>Paid Time Off (provision)</span>
                                        <span>$417</span>
                                    </div>
                                    <div className="flex justify-between text-slate-400">
                                        <span>Administrative Overhead</span>
                                        <span>$250</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex justify-between text-slate-300">
                                        <span>Salário Base</span>
                                        <span className="font-semibold">R$ 10.000</span>
                                    </div>
                                    <div className="flex justify-between text-slate-400">
                                        <span>INSS Patronal (20%)</span>
                                        <span>R$ 2.000</span>
                                    </div>
                                    <div className="flex justify-between text-slate-400">
                                        <span>FGTS (8%)</span>
                                        <span>R$ 800</span>
                                    </div>
                                    <div className="flex justify-between text-slate-400">
                                        <span>13º Salário (provisão)</span>
                                        <span>R$ 833</span>
                                    </div>
                                    <div className="flex justify-between text-slate-400">
                                        <span>Férias + 1/3 (provisão)</span>
                                        <span>R$ 1.111</span>
                                    </div>
                                    <div className="flex justify-between text-slate-400">
                                        <span>RAT/SAT (~2%)</span>
                                        <span>R$ 200</span>
                                    </div>
                                    <div className="flex justify-between text-slate-400">
                                        <span>Benefícios (VT, VR, Plano)</span>
                                        <span>R$ 1.500</span>
                                    </div>
                                    <div className="flex justify-between text-slate-400">
                                        <span>Risco Trabalhista (provisão)</span>
                                        <span>R$ 800</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="border-t border-slate-700 pt-3">
                            <div className="flex justify-between text-lg font-bold text-red-400">
                                <span>{lang === 'en' ? 'Total Monthly Cost' : 'Custo Total Mensal'}</span>
                                <span>{lang === 'en' ? '$7,450' : 'R$ 17.244'}</span>
                            </div>
                            <div className="text-xs text-slate-500 text-right mt-1">
                                {lang === 'en' ? '+49% over base salary' : '+72% sobre o salário base'}
                            </div>
                        </div>
                    </div>

                    {/* W-8BEN Contractor / PJ */}
                    <div className="bg-brand-dark border border-green-900/50 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xl font-bold text-white">
                                {lang === 'en' ? 'W-8BEN Contractor' : 'Contratação PJ'}
                            </h3>
                            <span className="tech-font text-xs bg-green-900/30 text-green-300 px-3 py-1 rounded border border-green-800">
                                {lang === 'en' ? 'Best Value' : 'Melhor Custo'}
                            </span>
                        </div>

                        <div className="text-sm space-y-2 mb-4">
                            {lang === 'en' ? (
                                <>
                                    <div className="flex justify-between text-slate-300">
                                        <span>Monthly Invoice</span>
                                        <span className="font-semibold">$5,000</span>
                                    </div>
                                    <div className="flex justify-between text-green-400">
                                        <span>✓ Zero Withholding Tax (W-8BEN)</span>
                                        <span>$0</span>
                                    </div>
                                    <div className="flex justify-between text-green-400">
                                        <span>✓ No Employer Taxes</span>
                                        <span>$0</span>
                                    </div>
                                    <div className="flex justify-between text-green-400">
                                        <span>✓ No Benefits Required</span>
                                        <span>$0</span>
                                    </div>
                                    <div className="flex justify-between text-green-400">
                                        <span>✓ No PTO Costs</span>
                                        <span>$0</span>
                                    </div>
                                    <div className="flex justify-between text-slate-400">
                                        <span>Payment Processing</span>
                                        <span>$50</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex justify-between text-slate-300">
                                        <span>Nota Fiscal Mensal</span>
                                        <span className="font-semibold">R$ 10.000</span>
                                    </div>
                                    <div className="flex justify-between text-green-400">
                                        <span>✓ Sem Encargos Trabalhistas</span>
                                        <span>R$ 0</span>
                                    </div>
                                    <div className="flex justify-between text-green-400">
                                        <span>✓ Sem Férias e 13º</span>
                                        <span>R$ 0</span>
                                    </div>
                                    <div className="flex justify-between text-green-400">
                                        <span>✓ Sem FGTS e INSS Patronal</span>
                                        <span>R$ 0</span>
                                    </div>
                                    <div className="flex justify-between text-green-400">
                                        <span>✓ Zero Risco Trabalhista</span>
                                        <span>R$ 0</span>
                                    </div>
                                    <div className="flex justify-between text-green-400">
                                        <span>✓ Sem Rescisão ou Multas</span>
                                        <span>R$ 0</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="border-t border-slate-700 pt-3">
                            <div className="flex justify-between text-lg font-bold text-green-400">
                                <span>{lang === 'en' ? 'Total Monthly Cost' : 'Custo Total Mensal'}</span>
                                <span>{lang === 'en' ? '$5,050' : 'R$ 10.000'}</span>
                            </div>
                            <div className="text-xs text-green-400 text-right font-semibold mt-1">
                                {lang === 'en' ? 'SAVE $2,400/month (32%)' : 'ECONOMIA R$ 7.244/mês (42%)'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Benefits */}
                <div className="mt-12 bg-slate-800/50 border border-slate-700 rounded-xl p-8">
                    <h3 className="text-xl font-bold text-white mb-6 text-center">
                        {lang === 'en' ? 'Additional Benefits' : 'Benefícios Adicionais'}
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6 text-sm">
                        <div>
                            <div className="text-brand-accent font-semibold mb-2">
                                {lang === 'en' ? '🚀 Flexibility' : '🚀 Flexibilidade'}
                            </div>
                            <p className="text-slate-400">
                                {lang === 'en'
                                    ? 'Scale up or down without termination complications or severance costs.'
                                    : 'Escale para cima ou para baixo sem complicações de rescisão ou custos de demissão.'}
                            </p>
                        </div>
                        <div>
                            <div className="text-brand-accent font-semibold mb-2">
                                {lang === 'en' ? '⚖️ Zero Legal Risk' : '⚖️ Zero Risco Legal'}
                            </div>
                            <p className="text-slate-400">
                                {lang === 'en'
                                    ? 'No employment lawsuits, labor disputes, or wrongful termination claims.'
                                    : 'Sem processos trabalhistas, disputas ou ações de demissão indevida.'}
                            </p>
                        </div>
                        <div>
                            <div className="text-brand-accent font-semibold mb-2">
                                {lang === 'en' ? '📋 Simple Compliance' : '📋 Compliance Simplificado'}
                            </div>
                            <p className="text-slate-400">
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
