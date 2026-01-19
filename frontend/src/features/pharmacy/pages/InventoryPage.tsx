import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { pharmacyApi } from '../api';
import { StockLevelBadge } from '../components/StockLevelBadge';
import { Search, Package, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

import { Medication } from '../types';

export const InventoryPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const { data: medications, isLoading, error } = useQuery<Medication[]>({
        queryKey: ['medications'],
        queryFn: pharmacyApi.getMedications,
    });

    const filteredMedications = medications?.filter((med: Medication) =>
        med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading inventory...</div>;
    }

    if (error) {
        return (
            <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error loading inventory</h3>
                        <div className="mt-2 text-sm text-red-700">
                            <p>Please try again later. {(error as Error).message}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header / Search */}
            <div className="flex items-center justify-between">
                <div className="relative max-w-lg flex-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-zinc-900 dark:ring-zinc-700 dark:text-white dark:placeholder-zinc-500 transition-colors"
                        placeholder="Search by name, brand, or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Total Items: <span className="font-medium text-gray-900 dark:text-white">{filteredMedications?.length || 0}</span>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-zinc-800 shadow sm:rounded-lg transition-colors">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
                    <thead className="bg-gray-50 dark:bg-zinc-900/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Medication
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                SKU / Batch
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Expiry
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Status
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-zinc-800 bg-white dark:bg-dark-surface">
                        {filteredMedications?.map((med: Medication) => (
                            <tr key={med.id}>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                            <Package className="h-5 w-5" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{med.name}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{med.brand}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="text-sm text-gray-900 dark:text-white">{med.sku}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{med.batch_number}</div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{format(new Date(med.expiry_date), 'MMM d, yyyy')}</div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <StockLevelBadge quantity={med.stock_quantity} />
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                    <button className="text-primary-600 dark:text-blue-400 hover:text-primary-900 dark:hover:text-blue-300">Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
