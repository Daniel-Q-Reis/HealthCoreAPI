import { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * Visual style variant
     */
    variant?: 'default' | 'outlined' | 'elevated';

    /**
     * Add hover effect
     */
    hoverable?: boolean;

    /**
     * Card content
     */
    children: ReactNode;
}

export const Card = ({
    variant = 'default',
    hoverable = false,
    children,
    className = '',
    ...props
}: CardProps) => {
    // Base classes
    const baseClasses = 'rounded-lg transition-all duration-200';

    // Variant classes
    const variantClasses = {
        default: 'bg-white shadow-md',
        outlined: 'bg-white border-2 border-gray-200',
        elevated: 'bg-white shadow-xl',
    };

    // Hover classes
    const hoverClasses = hoverable
        ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer'
        : '';

    // Combine classes
    const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${hoverClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    );
};

// Card subcomponents for better structure
export const CardHeader = ({
    children,
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) => (
    <div
        className={`px-6 py-4 border-b border-gray-200 ${className}`}
        {...props}
    >
        {children}
    </div>
);

export const CardBody = ({
    children,
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) => (
    <div
        className={`px-6 py-4 ${className}`}
        {...props}
    >
        {children}
    </div>
);

export const CardFooter = ({
    children,
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) => (
    <div
        className={`px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg ${className}`}
        {...props}
    >
        {children}
    </div>
);
