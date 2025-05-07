import React from 'react';
import { X } from 'lucide-react';
import SuggestionBox from './SuggestionBox';
interface Item {
    id: string;
    name: string;
}

interface AutocompleteFieldProps {
    label: string;
    value: string;
    inputRef: React.RefObject<HTMLInputElement>;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    suggestions: Item[];
    selected: Item[];
    onRemove: (id: string) => void;
    type: 'author' | 'journal' | 'research_field' | 'concept';
    placeholder?: string;
}

const AutocompleteField: React.FC<AutocompleteFieldProps> = ({
    label,
    value,
    inputRef,
    onChange,
    suggestions,
    selected,
    onRemove,
    type,
    placeholder
}) => {
    return (
        <div className="mb-4">
            <label className="block mb-2">{label}</label>
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    ref={inputRef}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <SuggestionBox
                    suggestions={suggestions}
                    searchTerm={value}
                    inputRef={inputRef}
                    type={type}
                    onSelect={(item) => {
                        if (!selected.some(s => s.id === item.id)) {
                            const setters: Record<string, (items: Item[]) => void> = {
                                author: items => console.log('Setting authors:', items),
                                journal: items => console.log('Setting journals:', items),
                                research_field: items => console.log('Setting research fields:', items),
                                concept: items => console.log('Setting concepts:', items)
                            };

                            const clearers: Record<string, () => void> = {
                                author: () => console.log('Clearing author'),
                                journal: () => console.log('Clearing journal'),
                                research_field: () => console.log('Clearing research field'),
                                concept: () => console.log('Clearing concept')
                            };

                            setters[type]([...selected, item]);
                            clearers[type]();
                        }
                    }}
                />
            </div>
            <div className="mt-2 space-y-2">
                {selected.map(item => (
                    <div key={item.id} className="flex items-center">
                        <span className="flex items-center justify-between w-full px-3 py-2 border rounded-md bg-[#eee]">
                            <span>{item.name}</span>
                            <button
                                type="button"
                                onClick={() => onRemove(item.id)}
                                className="p-1 ml-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AutocompleteField;