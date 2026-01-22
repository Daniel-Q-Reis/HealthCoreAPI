import { HTMLAttributes, ReactNode } from 'react';

// Heading Component
export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
    /**
     * Heading level (h1-h6)
     */
    level?: 1 | 2 | 3 | 4 | 5 | 6;

    /**
     * Text color
     */
    color?: 'primary' | 'secondary' | 'neutral' | 'inherit';

    /**
     * Font weight
     */
    weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';

    /**
     * Text alignment
     */
    align?: 'left' | 'center' | 'right';

    /**
     * Content
     */
    children: ReactNode;
}

export const Heading = ({
    level = 2,
    color = 'primary',
    weight = 'bold',
    align = 'left',
    className = '',
    children,
    ...props
}: HeadingProps) => {
    const sizeClasses = {
        1: 'text-5xl',
        2: 'text-4xl',
        3: 'text-3xl',
        4: 'text-2xl',
        5: 'text-xl',
        6: 'text-lg',
    };

    const colorClasses = {
        primary: 'text-[#003B5C]',
        secondary: 'text-[#0066CC]',
        neutral: 'text-gray-900',
        inherit: '',
    };

    const weightClasses = {
        light: 'font-light',
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
    };

    const alignClasses = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
    };

    const classes = `
    ${sizeClasses[level]}
    ${colorClasses[color]}
    ${weightClasses[weight]}
    ${alignClasses[align]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

    // Use createElement to avoid TypeScript issues with dynamic tags
    const headingElements = {
        1: (p: HeadingProps) => <h1 className={classes} {...p}>{children}</h1>,
        2: (p: HeadingProps) => <h2 className={classes} {...p}>{children}</h2>,
        3: (p: HeadingProps) => <h3 className={classes} {...p}>{children}</h3>,
        4: (p: HeadingProps) => <h4 className={classes} {...p}>{children}</h4>,
        5: (p: HeadingProps) => <h5 className={classes} {...p}>{children}</h5>,
        6: (p: HeadingProps) => <h6 className={classes} {...p}>{children}</h6>,
    };

    return headingElements[level](props as HeadingProps);
};

// Text Component
export interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
    /**
     * Text size
     */
    size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';

    /**
     * Text color
     */
    color?: 'primary' | 'secondary' | 'neutral' | 'muted' | 'inherit';

    /**
     * Font weight
     */
    weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';

    /**
     * Text alignment
     */
    align?: 'left' | 'center' | 'right' | 'justify';

    /**
     * Render as span instead of p
     */
    as?: 'p' | 'span';

    /**
     * Content
     */
    children: ReactNode;
}

export const Text = ({
    size = 'base',
    color = 'neutral',
    weight = 'normal',
    align = 'left',
    as = 'p',
    className = '',
    children,
    ...props
}: TextProps) => {
    const Tag = as;

    const sizeClasses = {
        xs: 'text-xs',
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
    };

    const colorClasses = {
        primary: 'text-[#003B5C]',
        secondary: 'text-[#0066CC]',
        neutral: 'text-gray-900',
        muted: 'text-gray-500',
        inherit: '',
    };

    const weightClasses = {
        light: 'font-light',
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
    };

    const alignClasses = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
        justify: 'text-justify',
    };

    const classes = `
    ${sizeClasses[size]}
    ${colorClasses[color]}
    ${weightClasses[weight]}
    ${alignClasses[align]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

    return <Tag className={classes} {...props}>{children}</Tag>;
};

// Label Component
export interface LabelProps extends HTMLAttributes<HTMLLabelElement> {
    /**
     * Label size
     */
    size?: 'sm' | 'base' | 'lg';

    /**
     * Required indicator
     */
    required?: boolean;

    /**
     * Content
     */
    children: ReactNode;
}

export const Label = ({
    size = 'base',
    required = false,
    className = '',
    children,
    ...props
}: LabelProps) => {
    const sizeClasses = {
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg',
    };

    const classes = `
    block font-medium text-gray-700
    ${sizeClasses[size]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

    return (
        <label className={classes} {...props}>
            {children}
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
    );
};
