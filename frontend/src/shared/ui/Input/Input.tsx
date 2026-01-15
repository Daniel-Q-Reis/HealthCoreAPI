import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    /**
     * Input label
     */
    label?: string;

    /**
     * Error message to display
     */
    error?: string;

    /**
     * Helper text below input
     */
    helperText?: string;

    /**
     * Icon to display (left side)
     */
    icon?: ReactNode;

    /**
     * Size of the input
     */
    inputSize?: 'sm' | 'md' | 'lg';

    /**
     * Make input full width
     */
    fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
    label,
    error,
    helperText,
    icon,
    inputSize = 'md',
    fullWidth = false,
    disabled,
    className = '',
    ...props
}, ref) => {
    // Base input classes
    const baseClasses = 'border rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1';

    // Size classes
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-5 py-3 text-lg',
    };

    // State classes
    const stateClasses = error
        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
        : 'border-gray-300 focus:ring-[#003B5C] focus:border-[#003B5C]';

    const disabledClasses = disabled
        ? 'bg-gray-100 cursor-not-allowed opacity-60'
        : 'bg-white';

    // Combine input classes
    const inputClasses = `
    ${baseClasses}
    ${sizeClasses[inputSize]}
    ${stateClasses}
    ${disabledClasses}
    ${icon ? 'pl-10' : ''}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

    return (
        <div className={fullWidth ? 'w-full' : ''}>
            {/* Label */}
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}

            {/* Input Container */}
            <div className="relative">
                {/* Icon */}
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        {icon}
                    </div>
                )}

                {/* Input */}
                <input
                    ref={ref}
                    className={inputClasses}
                    disabled={disabled}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
                    {...props}
                />
            </div>

            {/* Error Message */}
            {error && (
                <p
                    id={`${props.id}-error`}
                    className="mt-1 text-sm text-red-600"
                >
                    {error}
                </p>
            )}

            {/* Helper Text */}
            {!error && helperText && (
                <p
                    id={`${props.id}-helper`}
                    className="mt-1 text-sm text-gray-500"
                >
                    {helperText}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';
