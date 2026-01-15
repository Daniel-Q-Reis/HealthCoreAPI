// Design Tokens - UCLA Health Design System
// Based on the design we implemented in HomePage

export const colors = {
    // Primary Colors
    primary: {
        main: '#003B5C',      // Dark blue (header, buttons)
        light: '#004B87',     // Lighter blue
        dark: '#002A42',      // Darker blue (hover states)
    },

    // Secondary Colors
    secondary: {
        main: '#0066CC',      // Bright blue (logo, links)
        light: '#3385D6',     // Lighter blue
        dark: '#004D99',      // Darker blue
    },

    // Accent Colors
    accent: {
        main: '#F2C94C',      // Soft yellow (CTA buttons)
        light: '#F5D673',     // Lighter yellow
        dark: '#E5B840',      // Darker yellow (hover)
    },

    // Neutral Colors
    neutral: {
        white: '#FFFFFF',
        gray50: '#F9FAFB',
        gray100: '#F3F4F6',
        gray200: '#E5E7EB',
        gray300: '#D1D5DB',
        gray400: '#9CA3AF',
        gray500: '#6B7280',
        gray600: '#4B5563',
        gray700: '#374151',
        gray800: '#1F2937',
        gray900: '#111827',
        black: '#000000',
    },

    // Semantic Colors
    success: {
        main: '#10B981',      // Green
        light: '#34D399',
        dark: '#059669',
        bg: '#D1FAE5',
    },

    warning: {
        main: '#F59E0B',      // Orange
        light: '#FBBF24',
        dark: '#D97706',
        bg: '#FEF3C7',
    },

    error: {
        main: '#EF4444',      // Red
        light: '#F87171',
        dark: '#DC2626',
        bg: '#FEE2E2',
    },

    info: {
        main: '#3B82F6',      // Blue
        light: '#60A5FA',
        dark: '#2563EB',
        bg: '#DBEAFE',
    },
};

export const typography = {
    fontFamily: {
        sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
        mono: "'Fira Code', 'Courier New', monospace",
    },

    fontSize: {
        xs: '0.75rem',      // 12px
        sm: '0.875rem',     // 14px
        base: '1rem',       // 16px
        lg: '1.125rem',     // 18px
        xl: '1.25rem',      // 20px
        '2xl': '1.5rem',    // 24px
        '3xl': '1.875rem',  // 30px
        '4xl': '2.25rem',   // 36px
        '5xl': '3rem',      // 48px
        '6xl': '3.75rem',   // 60px
    },

    fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
    },

    lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
    },
};

export const spacing = {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
};

export const shadows = {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

export const borderRadius = {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    full: '9999px',
};

export const transitions = {
    fast: '150ms ease-in-out',
    base: '200ms ease-in-out',
    slow: '300ms ease-in-out',
};

export const breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
};

// Export all tokens
export const tokens = {
    colors,
    typography,
    spacing,
    shadows,
    borderRadius,
    transitions,
    breakpoints,
};

export default tokens;
