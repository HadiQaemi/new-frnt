export interface ResearchField {
    research_field_id: number;
    label: string;
}

import React, { useState, useEffect, useRef } from 'react';
import { XCircle, Search } from 'lucide-react';
import { REBORN_API_URL } from '@/app/lib/config/constants';
import { nanoid } from 'nanoid';

interface MultiSelectProps {
    selectedFields: ResearchField[];
    onChange: (fields: ResearchField[]) => void;
    placeholder?: string;
    className?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
    selectedFields,
    onChange,
    placeholder = 'Select research fields...',
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [fields, setFields] = useState<ResearchField[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const fetchResearchFields = async () => {
            try {
                setLoading(true);
                const url = searchQuery
                    ? `${REBORN_API_URL}/articles/get_research_fields?label=${encodeURIComponent(searchQuery)}`
                    : `${REBORN_API_URL}/articles/get_research_fields?limit=2`;

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Failed to fetch research fields');
                }
                const data = await response.json();
                setFields(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchResearchFields();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const toggleField = (field: ResearchField) => {
        const isSelected = selectedFields.some((f) => f.research_field_id === field.research_field_id);
        if (isSelected) {
            onChange(selectedFields.filter((f) => f.research_field_id !== field.research_field_id));
        } else {
            onChange([...selectedFields, field]);
        }
    };

    const removeField = (fieldId: number) => {
        onChange(selectedFields.filter((field) => field.research_field_id !== fieldId));
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleContainerClick = () => {
        setIsOpen(true);
        setTimeout(() => {
            if (searchInputRef.current) {
                searchInputRef.current.focus();
            }
        }, 0);
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <div
                className={`min-h-[40px] p-2 border rounded-md cursor-pointer bg-white ${isOpen ? 'border-blue-500' : 'border-gray-300'
                    } ${className}`}
                onClick={handleContainerClick}
            >
                <div className="flex flex-wrap gap-2">
                    {selectedFields.map((field) => (
                        <span
                            key={field.research_field_id}
                            className="inline-flex items-center px-2 py-1 text-red-500 bg-gray-50 rounded"
                        >
                            {field.label}
                            <XCircle
                                className="ml-1 h-4 w-4 cursor-pointer hover:text-blue-600"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeField(field.research_field_id);
                                }}
                            />
                        </span>
                    ))}
                    {selectedFields.length === 0 && (
                        <span className="text-gray-400">{placeholder}</span>
                    )}
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                    <div className="p-2 border-b border-gray-200 flex items-center gap-2">
                        <Search className="h-4 w-4 text-gray-400" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            className="w-full outline-none text-sm"
                            placeholder="Search fields..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    <div className="max-h-60 overflow-auto">
                        {loading && (
                            <div className="p-2 text-center text-gray-500">Loading...</div>
                        )}
                        {error && (
                            <div className="p-2 text-center text-red-500">{error}</div>
                        )}
                        {!loading && !error && fields.length === 0 && (
                            <div className="p-2 text-center text-gray-500">No results found</div>
                        )}
                        {!loading && !error && fields.slice(0, 10).map((field) => (
                            <div
                                key={`${nanoid()}`}
                                className={`p-2 cursor-pointer hover:bg-gray-100 ${selectedFields.some((f) => f.research_field_id === field.research_field_id)
                                    ? 'bg-blue-50'
                                    : ''
                                    }`}
                                onClick={() => toggleField(field)}
                            >
                                {field.label}
                            </div>
                        ))}
                        {!loading && !error && fields.length > 10 && (
                            <div className="p-2 text-center text-sm text-gray-500">
                                Showing top 10 results
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MultiSelect;