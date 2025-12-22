import React from 'react';

interface StockLevelBadgeProps {
    quantity: number;
}

export const StockLevelBadge: React.FC<StockLevelBadgeProps> = ({ quantity }) => {
    let colorClass = 'bg-green-100 text-green-800';
    let label = 'In Stock';

    if (quantity < 25) {
        colorClass = 'bg-red-100 text-red-800';
        label = 'Critical Low';
    } else if (quantity < 50) {
        colorClass = 'bg-yellow-100 text-yellow-800';
        label = 'Low Stock';
    }

    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
            {label} ({quantity})
        </span>
    );
};
