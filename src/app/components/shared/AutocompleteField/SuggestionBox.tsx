import React, { useCallback } from 'react';

interface Item {
    id: string;
    name: string;
}

interface SuggestionBoxProps {
    suggestions: Item[];
    onSelect: (item: Item) => void;
    searchTerm: string;
    type: 'author' | 'journal' | 'research_field' | 'concept';
    inputRef: React.RefObject<HTMLInputElement>;
}

const SuggestionBox: React.FC<SuggestionBoxProps> = ({
    suggestions,
    onSelect,
    searchTerm,
    type,
    inputRef
}) => {
    const afterRender = useCallback((node: HTMLDivElement | null) => {
        if (node && (suggestions.length === 0 || suggestions.length > 0)) {
            inputRef.current?.focus();
        }
    }, [suggestions, inputRef]);

    if (!searchTerm) return null;

    const handleSelect = (item: Item) => {
        onSelect(item);
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    };

    return (
        <div
            ref={afterRender}
            className="absolute w-full bg-white border rounded-md shadow-lg z-50 mt-1"
        >
            {suggestions.length > 0 ? (
                suggestions.map(item => (
                    <div
                        key={item.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() => handleSelect(item)}
                    >
                        {item.name}
                    </div>
                ))
            ) : (
                <div className="p-2 text-gray-500">
                    No {type} found for "{searchTerm}"
                </div>
            )}
        </div>
    );
};

export default SuggestionBox;
