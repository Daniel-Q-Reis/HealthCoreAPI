import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/shared/contexts/ThemeContext';

export function DarkModeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-slate-900 dark:text-zinc-100"
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
            ) : (
                <Sun className="h-5 w-5 text-slate-500" />
            )}
            <span className="sr-only">Toggle theme</span>
        </button>
    );
}
