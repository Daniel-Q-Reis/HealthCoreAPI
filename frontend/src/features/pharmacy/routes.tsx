import { RouteObject, Navigate } from 'react-router-dom';
import { PharmacyLayout } from './layouts/PharmacyLayout';
import { InventoryPage } from './pages/InventoryPage';
import { DispensePage } from './pages/DispensePage';

export const pharmacyRoutes: RouteObject = {
    path: 'pharmacy',
    element: <PharmacyLayout />,
    children: [
        {
            index: true,
            element: <Navigate to="inventory" replace />,
        },
        {
            path: 'inventory',
            element: <InventoryPage />,
        },
        {
            path: 'dispense',
            element: <DispensePage />,
        },
    ],
};
