import { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /**
     * Visual style variant
     */
    variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost';

    /**
     * Size of the button
     */
    size?: 'sm' | 'md' | 'lg';

    /**
     * Show loading state
     */
    loading?: boolean;

    /**
     * Make button full width
     */
    fullWidth?: boolean;

    /**
     * Button content
     */
    children: ReactNode;
}

export const Button = ({
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    disabled,
    children,
    className = '',
    ...props
}: ButtonProps) => {
    // Base classes - always applied
    const baseClasses = 'font-semibold rounded transition-all duration-200 inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2';

    // Variant-specific classes
    const variantClasses = {
        primary: 'bg-[#003B5C] text-white hover:bg-[#002A42] focus:ring-[#003B5C] shadow-sm',
        secondary: 'bg-white text-[#003B5C] border-2 border-[#003B5C] hover:bg-gray-50 focus:ring-[#003B5C]',
        accent: 'bg-[#F2C94C] text-[#003B5C] hover:bg-[#E5B840] focus:ring-[#F2C94C] shadow-sm',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600 shadow-sm',
        ghost: 'bg-transparent text-[#003B5C] hover:bg-gray-100 focus:ring-[#003B5C]',
    };

    // Size-specific classes
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-6 py-2 text-base',
        lg: 'px-8 py-3 text-lg',
    };

    // Combine all classes
    const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `.trim().replace(/\s+/g, ' ');

    return (
        <button
            className={classes}
            disabled={disabled || loading}
            aria-busy={loading}
            {...props}
        >
            {loading ? (
                <>
                    <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                    Loading...
                </>
            ) : (
                children
            )}
        </button>
    );
};
