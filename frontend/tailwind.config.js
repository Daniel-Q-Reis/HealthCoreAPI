/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                brand: {
                    dark: '#0f172a',
                    accent: '#3b82f6',
                    light: '#f8fafc',
                },
                primary: {
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#6366f1',
                    600: '#4f46e5',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                    950: '#1e1b4b',
                    26: '#1e1b4b',
                },
                // Custom Dark Mode Palette - Graphite/Zinc
                'dark-bg': '#09090b', // Zinc-950
                'dark-surface': '#18181b', // Zinc-900
                'dark-border': '#27272a', // Zinc-800
                'dark-hover': '#27272a', // Zinc-800
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['Fira Code', 'monospace'],
            }
        },
    },
    plugins: [],
}
