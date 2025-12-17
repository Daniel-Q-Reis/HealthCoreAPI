import { TextareaHTMLAttributes, forwardRef, useEffect, useRef } from 'react';

export interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
    /**
     * TextArea label
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
     * Size of textarea
     */
    textareaSize?: 'sm' | 'md' | 'lg';

    /**
     * Auto-resize based on content
     */
    autoResize?: boolean;

    /**
     * Show character count
     */
    showCount?: boolean;

    /**
     * Full width
     */
    fullWidth?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({
    label,
    error,
    helperText,
    textareaSize = 'md',
    autoResize = false,
    showCount = false,
    fullWidth = false,
    disabled,
    maxLength,
    value,
    className = '',
    ...props
}, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    // Auto-resize functionality
    useEffect(() => {
        if (autoResize && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [value, autoResize]);

    // Base classes
    const baseClasses = 'border rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 resize-vertical';

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

    // Combine classes
    const textareaClasses = `
    ${baseClasses}
    ${sizeClasses[textareaSize]}
    ${stateClasses}
    ${disabledClasses}
    ${fullWidth ? 'w-full' : ''}
    ${autoResize ? 'resize-none' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

    const characterCount = typeof value === 'string' ? value.length : 0;

    return (
        <div className={fullWidth ? 'w-full' : ''}>
            {/* Label */}
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}

            {/* TextArea */}
            <textarea
                ref={(node) => {
                    textareaRef.current = node;
                    if (typeof ref === 'function') {
                        ref(node);
                    } else if (ref) {
                        ref.current = node;
                    }
                }}
                className={textareaClasses}
                disabled={disabled}
                maxLength={maxLength}
                value={value}
                aria-invalid={!!error}
                aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
                {...props}
            />

            {/* Character Count */}
            {showCount && maxLength && (
                <div className="mt-1 text-right">
                    <span className={`text-sm ${characterCount > maxLength ? 'text-red-600' : 'text-gray-500'}`}>
                        {characterCount} / {maxLength}
                    </span>
                </div>
            )}

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

TextArea.displayName = 'TextArea';
