import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Pill, Activity, AlertCircle } from 'lucide-react';
import { MainLayout } from '@/shared/layout/MainLayout';

export const PharmacyLayout: React.FC = () => {
    const location = useLocation();

    const isActive = (path: string) => location.pathname.includes(path);

    return (
        <MainLayout>
            <div className="flex h-full flex-col space-y-6 p-8 bg-gray-50 min-h-screen">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Pharmacy Management</h2>
                        <p className="text-muted-foreground mt-2 text-lg text-gray-500">
                            Manage inventory, dispense medications, and access clinical drug information.
                        </p>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg bg-yellow-50 p-3 text-yellow-800 border border-yellow-200">
                        <AlertCircle className="h-5 w-5" />
                        <span className="font-medium">Stock Alert:</span>
                        <span className="text-sm">Check critical items below</span>
                    </div>
                </div>

                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <Link
                            to="/dqr-health/pharmacy/inventory"
                            className={`
                                group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium
                                ${isActive('inventory')
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}
                            `}
                        >
                            <Pill className={`mr-2 h-5 w-5 ${isActive('inventory') ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
                            Inventory
                        </Link>

                        <Link
                            to="/dqr-health/pharmacy/dispense"
                            className={`
                                group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium
                                ${isActive('dispense')
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}
                            `}
                        >
                            <Activity className={`mr-2 h-5 w-5 ${isActive('dispense') ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
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
