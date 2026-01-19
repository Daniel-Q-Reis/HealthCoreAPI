import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Pill, Activity, AlertCircle } from 'lucide-react';
import { MainLayout } from '@/shared/layout/MainLayout';

export const PharmacyLayout: React.FC = () => {
    const location = useLocation();

    const isActive = (path: string) => location.pathname.includes(path);

    return (
        <MainLayout>
            <div className="flex h-full flex-col space-y-6 p-8 bg-gray-50 dark:bg-zinc-800 min-h-screen transition-colors">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">Pharmacy Management</h2>
                        <p className="text-muted-foreground mt-2 text-lg text-gray-500 dark:text-zinc-400">
                            Manage inventory, dispense medications, and access clinical drug information.
                        </p>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-3 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-900/50">
                        <AlertCircle className="h-5 w-5" />
                        <span className="font-medium">Stock Alert:</span>
                        <span className="text-sm">Check critical items below</span>
                    </div>
                </div>

                <div className="border-b border-gray-200 dark:border-zinc-700">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <Link
                            to="/dqr-health/pharmacy/inventory"
                            className={`
                                group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium
                                ${isActive('inventory')
                                    ? 'border-primary-600 text-primary-600 dark:text-blue-400 dark:border-blue-400'
                                    : 'border-transparent text-gray-500 dark:text-zinc-400 hover:border-gray-300 dark:hover:border-zinc-600 hover:text-gray-700 dark:hover:text-zinc-200'}
                            `}
                        >
                            <Pill className={`mr-2 h-5 w-5 ${isActive('inventory') ? 'text-primary-600 dark:text-blue-400' : 'text-gray-400 dark:text-zinc-500 group-hover:text-gray-500 dark:group-hover:text-zinc-300'}`} />
                            Inventory
                        </Link>

                        <Link
                            to="/dqr-health/pharmacy/dispense"
                            className={`
                                group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium
                                ${isActive('dispense')
                                    ? 'border-primary-600 text-primary-600 dark:text-blue-400 dark:border-blue-400'
                                    : 'border-transparent text-gray-500 dark:text-zinc-400 hover:border-gray-300 dark:hover:border-zinc-600 hover:text-gray-700 dark:hover:text-zinc-200'}
                            `}
                        >
                            <Activity className={`mr-2 h-5 w-5 ${isActive('dispense') ? 'text-primary-600 dark:text-blue-400' : 'text-gray-400 dark:text-zinc-500 group-hover:text-gray-500 dark:group-hover:text-zinc-300'}`} />
                            Dispense
                        </Link>
                    </nav>
                </div>

                <div className="flex-1">
                    <Outlet />
                </div>
            </div>
        </MainLayout>
    );
};
