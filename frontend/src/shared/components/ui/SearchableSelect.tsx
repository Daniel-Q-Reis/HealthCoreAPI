import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

export interface Option {
    value: string | number;
    label: string;
    subtext?: string;
}

interface SearchableSelectProps {
    options: Option[];
    value?: string | number;
    onChange: (value: string | number) => void;
    placeholder?: string;
    className?: string;
    label?: string;
    error?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
    options,
    value,
    onChange,
    placeholder = 'Select option...',
    className = '',
    label,
    error
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Filter options
    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.subtext?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedOption = options.find(o => o.value === value);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className}`} ref={wrapperRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                    {label}
                </label>
            )}

            <div
                className="relative cursor-pointer border rounded-md shadow-sm bg-white dark:bg-dark-surface border-gray-300 dark:border-dark-border hover:border-gray-400 dark:hover:border-zinc-600 focus-within:ring-1 focus-within:ring-primary-500 focus-within:border-primary-500 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center justify-between p-2 min-h-[38px]">
                    <span className={`block truncate ${!selectedOption ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-zinc-100'} transition-colors`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-dark-surface shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm border border-gray-100 dark:border-dark-border transition-colors">
                    <div className="sticky top-0 z-10 bg-white dark:bg-dark-surface px-2 py-1.5 border-b border-gray-100 dark:border-dark-border transition-colors">
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 pl-2 flex items-center">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full rounded-md border-gray-300 dark:border-zinc-700 pl-8 sm:text-sm focus:ring-primary-500 focus:border-primary-500 py-1 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white transition-colors placeholder-gray-400 dark:placeholder-gray-500"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    {filteredOptions.length === 0 ? (
                        <div className="cursor-default select-none relative py-2 px-4 text-gray-700 dark:text-gray-400">
                            No results found.
                        </div>
                    ) : (
                        filteredOptions.map((option) => (
                            <div
                                key={option.value}
                                className={`
                                    cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-primary-50 dark:hover:bg-dark-hover
                                    ${value === option.value ? 'bg-primary-50 dark:bg-dark-hover text-primary-900 dark:text-blue-400' : 'text-gray-900 dark:text-zinc-200'}
                                    transition-colors
                                `}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                    setSearchTerm('');
                                }}
                            >
                                <div className="flex flex-col">
                                    <span className={`block truncate ${value === option.value ? 'font-semibold' : 'font-normal'}`}>
                                        {option.label}
                                    </span>
                                    {option.subtext && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {option.subtext}
                                        </span>
                                    )}
                                </div>

                                {value === option.value && (
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary-600 dark:text-blue-400">
                                        <Check className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors">{error}</p>}
        </div>
    );
};
