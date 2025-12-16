import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
    /**
     * Checkbox label
     */
    label?: string | ReactNode;

    /**
     * Error message
     */
    error?: string;

    /**
     * Helper text
     */
    helperText?: string;

    /**
     * Indeterminate state
     */
    indeterminate?: boolean;

    /**
     * Size of checkbox
     */
    checkboxSize?: 'sm' | 'md' | 'lg';
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
    label,
    error,
    helperText,
    indeterminate = false,
    checkboxSize = 'md',
    disabled,
    className = '',
    ...props
}, ref) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
    };

    const checkboxClasses = `
    ${sizeClasses[checkboxSize]}
    rounded
    border-gray-300
    text-[#003B5C]
    focus:ring-[#003B5C]
    transition-colors
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${error ? 'border-red-500' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

    return (
        <div>
            <div className="flex items-start">
                <div className="flex items-center h-5">
                    <input
                        ref={ref}
                        type="checkbox"
                        className={checkboxClasses}
                        disabled={disabled}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
                        {...props}
                    />
                </div>
                {label && (
                    <div className="ml-3 text-sm">
                        <label
                            htmlFor={props.id}
                            className={`font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}
                        >
                            {label}
                        </label>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <p
                    id={`${props.id}-error`}
                    className="mt-1 text-sm text-red-600 ml-8"
                >
                    {error}
                </p>
            )}

            {/* Helper Text */}
            {!error && helperText && (
                <p
                    id={`${props.id}-helper`}
                    className="mt-1 text-sm text-gray-500 ml-8"
                >
                    {helperText}
                </p>
            )}
        </div>
    );
});

Checkbox.displayName = 'Checkbox';
