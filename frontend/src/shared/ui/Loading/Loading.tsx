import { HTMLAttributes } from 'react';

// Spinner Component
export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * Size of the spinner
     */
    size?: 'sm' | 'md' | 'lg' | 'xl';

    /**
     * Color of the spinner
     */
    color?: 'primary' | 'secondary' | 'accent' | 'white';
}

export const Spinner = ({
    size = 'md',
    color = 'primary',
    className = '',
    ...props
}: SpinnerProps) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16',
    };

    const colorClasses = {
        primary: 'text-[#003B5C]',
        secondary: 'text-[#0066CC]',
        accent: 'text-[#F2C94C]',
        white: 'text-white',
    };

    return (
        <div className={`inline-block ${className}`} {...props}>
            <svg
                className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
            </svg>
        </div>
    );
};

// Skeleton Component
export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * Width of skeleton
     */
    width?: string;

    /**
     * Height of skeleton
     */
    height?: string;

    /**
     * Variant
     */
    variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton = ({
    width = '100%',
    height = '1rem',
    variant = 'rectangular',
    className = '',
    ...props
}: SkeletonProps) => {
    const variantClasses = {
        text: 'rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-md',
    };

    return (
        <div
            className={`animate-pulse bg-gray-200 ${variantClasses[variant]} ${className}`}
            style={{ width, height }}
            {...props}
        />
    );
};

// Dots Component
export interface DotsProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * Size of dots
     */
    size?: 'sm' | 'md' | 'lg';

    /**
     * Color of dots
     */
    color?: 'primary' | 'secondary' | 'accent';
}

export const Dots = ({
    size = 'md',
    color = 'primary',
    className = '',
    ...props
}: DotsProps) => {
    const sizeClasses = {
        sm: 'h-1.5 w-1.5',
        md: 'h-2.5 w-2.5',
        lg: 'h-4 w-4',
    };

    const colorClasses = {
        primary: 'bg-[#003B5C]',
        secondary: 'bg-[#0066CC]',
        accent: 'bg-[#F2C94C]',
    };

    return (
        <div className={`flex space-x-2 ${className}`} {...props}>
            <div
                className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce`}
                style={{ animationDelay: '0ms' }}
            />
            <div
                className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce`}
                style={{ animationDelay: '150ms' }}
            />
            <div
                className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce`}
                style={{ animationDelay: '300ms' }}
            />
        </div>
    );
};
