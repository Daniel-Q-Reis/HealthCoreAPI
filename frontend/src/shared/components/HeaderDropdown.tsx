
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface DropdownItem {
    label: string;
    href?: string;
    onClick?: () => void;
    target?: string;
    rel?: string;
}

interface HeaderDropdownProps {
    title: string;
    items: DropdownItem[];
    className?: string;
}

export const HeaderDropdown: React.FC<HeaderDropdownProps> = ({ title, items, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 hover:text-gray-200 transition-colors focus:outline-none"
            >
                {title}
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100 border border-gray-100">
                    {/* Triangle pointer if desired, but sticking to clean flat design for now to match image */}
                    <div className="flex flex-col">
                        {items.map((item, index) => {
                            const itemClass = "px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 text-left transition-colors w-full flex items-center";

                            if (item.onClick) {
                                return (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            item.onClick?.();
                                            setIsOpen(false);
                                        }}
                                        className={itemClass}
                                    >
                                        {item.label}
                                    </button>
                                );
                            }

                            if (item.href?.startsWith('http') || item.href?.startsWith('mailto') || item.href?.startsWith('tel')) {
                                return (
                                    <a
                                        key={index}
                                        href={item.href}
                                        target={item.target}
                                        rel={item.rel}
                                        className={itemClass}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {item.label}
                                    </a>
                                );
                            }

                            return (
                                <Link
                                    key={index}
                                    to={item.href || '#'}
                                    className={itemClass}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
