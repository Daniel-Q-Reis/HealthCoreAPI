import { SelectHTMLAttributes, ReactNode, forwardRef } from 'react';

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
    /**
     * Select label
     */
    label?: string;

    /**
     * Error message
     */
    error?: string;

    /**
     * Helper text
     */
    helperText?: string;

    /**
     * Select options
     */
    options: SelectOption[];

    /**
     * Placeholder option
     */
    placeholder?: string;

    /**
     * Size of select
     */
    selectSize?: 'sm' | 'md' | 'lg';

    /**
     * Full width
     */
    fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
    label,
    error,
    helperText,
    options,
    placeholder,
    selectSize = 'md',
    fullWidth = false,
    disabled,
    className = '',
    ...props
}, ref) => {
    // Base classes
    const baseClasses = 'border rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 bg-white';

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
        : 'cursor-pointer';

    // Combine classes
    const selectClasses = `
    ${baseClasses}
    ${sizeClasses[selectSize]}
    ${stateClasses}
    ${disabledClasses}
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

            {/* Select */}
            <select
                ref={ref}
                className={selectClasses}
                disabled={disabled}
                aria-invalid={!!error}
                aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
                {...props}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                    >
                        {option.label}
                    </option>
                ))}
            </select>

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

Select.displayName = 'Select';
