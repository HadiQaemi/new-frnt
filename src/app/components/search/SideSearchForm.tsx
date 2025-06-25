import React, { useState, useRef, useEffect, useCallback, useImperativeHandle } from 'react';
import { X } from 'lucide-react';
import { useResearchFields } from '@/app/hooks/useResearchFields';
import { useJournals } from '@/app/hooks/useJournals';
import { useAuthors } from '@/app/hooks/useAuthors';
import { useConcepts } from '@/app/hooks/useConcepts';
import { helper } from '@/app/utils/helper';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';

interface Item {
    id: string;
    name: string;
}

interface SideSearchFormProps {
    currentPage: number;
    pageSize: number;
    submitError?: any;
    conceptParam?: any;
    titleParam?: any;
    isSubmitting: any;
    handleFilter: (data: FilterData) => void;
}

interface FilterData {
    title: string | undefined;
    timeRange: {
        start: number;
        end: number;
    };
    page: number;
    per_page: number;
    authors: string[];
    scientific_venues: string[];
    research_fields: string[];
    concepts: string[];
}

interface SideSearchFormRef {
    setSelectedConcepts: (concepts: Item[]) => void;
    setSelectedResearchFields: (fields: Item[]) => void;
    setSelectedAuthors: (authors: Item[]) => void;
    setSelectedScientificVenues: (journals: Item[]) => void;
    handleSubmit: (e: React.FormEvent) => void;
}

interface AutocompleteFieldProps {
    label: string;
    value: string;
    inputRef: React.RefObject<HTMLInputElement>;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    suggestions: Item[];
    // selected: Item[];
    selected: any;
    onRemove: (id: string) => void;
    type: 'author' | 'journal' | 'research_field' | 'concept';
    placeholder: string;
}

interface SuggestionBoxProps {
    suggestions: any;
    onSelect: (item: Item) => void;
    searchTerm: string;
    type: string;
    inputRef: React.RefObject<HTMLInputElement>;
}

const SideSearchForm = React.forwardRef<SideSearchFormRef, SideSearchFormProps>(({ currentPage, pageSize, submitError, isSubmitting, handleFilter, conceptParam, titleParam }, ref) => {
    const [timeRange, setTimeRange] = useState<[number, number]>([2015, 2025]);
    const [titleSearch, setTitleSearch] = useState('');
    const [authorSearch, setAuthorSearch] = useState('');
    const [scientificVenues, setScientificVenues] = useState('');
    const [researchFieldSearch, setResearchFieldSearch] = useState('');
    const [conceptSearch, setConceptSearch] = useState('');

    const [authorSuggestions, setAuthorSuggestions] = useState<Item[]>([]);
    const [scientificVenuesSuggestions, setScientificVenuesSuggestions] = useState<Item[]>([]);
    const [researchFieldSuggestions, setResearchFieldSuggestions] = useState<Item[]>([]);
    const [conceptSuggestions, setConceptSuggestions] = useState<Item[]>([]);

    const [selectedAuthors, setSelectedAuthors] = useState<Item[]>([]);
    const [selectedScientificVenues, setSelectedScientificVenues] = useState<Item[]>([]);
    const [selectedResearchFields, setSelectedResearchFields] = useState<Item[]>([]);
    const [selectedConcepts, setSelectedConcepts] = useState<Item[]>([]);

    const authorsRef = useRef<HTMLInputElement>(null);
    const journalsRef = useRef<HTMLInputElement>(null);
    const researchFieldsRef = useRef<HTMLInputElement>(null);
    const conceptRef = useRef<HTMLInputElement>(null);

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
                {suggestions.items ? (
                    suggestions.items.map((item: any) => (
                        <div
                            key={`${item.id}-${nanoid()}`}
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
    }) => (
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
                    onSelect={(item: any) => {
                        if (!selected.some((s: any) => s.id === item.id)) {
                            const setters = {
                                author: setSelectedAuthors,
                                journal: setSelectedScientificVenues,
                                research_field: setSelectedResearchFields,
                                concept: setSelectedConcepts
                            };

                            const clearers = {
                                author: () => {
                                    setAuthorSearch('');
                                    setAuthorSuggestions([]);
                                },
                                journal: () => {
                                    setScientificVenues('');
                                    setScientificVenuesSuggestions([]);
                                },
                                research_field: () => {
                                    setResearchFieldSearch('');
                                    setResearchFieldSuggestions([]);
                                },
                                concept: () => {
                                    setConceptSearch('');
                                    setConceptSuggestions([]);
                                }
                            };

                            setters[type]([...selected, item]);
                            clearers[type]();
                        }
                    }}
                />
            </div>
            <div className="mt-2 space-y-2">
                {selected.map((item: any) => (
                    <div key={`authors-${item.id}`} className="flex items-center">
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

    const { data: researchFields, isLoading: isLoadingFields } = useResearchFields(researchFieldSearch);
    useEffect(() => {
        if (researchFields) {
            const storedData = localStorage.getItem('fields');
            let existingFields = []
            if (storedData) {
                existingFields = JSON.parse(storedData);
            }
            researchFields.items.forEach((researchField: { id: string | number; name: any; }) => {
                const temp_researchField = existingFields.find((_researchField: { id: string; }) => _researchField.id === researchField.id)
                if (typeof temp_researchField === 'undefined') {
                    existingFields[existingFields.length] = researchField;
                }
            });
            localStorage.setItem('fields', JSON.stringify(existingFields));
            setResearchFieldSuggestions(researchFields);
        }
    }, [researchFields]);
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setResearchFieldSearch(e.target.value);
    };

    const { data: journals, isLoading: isLoadingJournals } = useJournals(scientificVenues);
    useEffect(() => {
        if (journals) {
            const storedData = localStorage.getItem('journals');
            let existingJournals = []
            if (storedData) {
                existingJournals = JSON.parse(storedData);
            }
            journals.items.forEach((journal: { id: string | number; name: any; }) => {
                const temp_journal = existingJournals.find((_journal: { id: string; }) => _journal.id === journal.id)
                if (typeof temp_journal === 'undefined') {
                    existingJournals[existingJournals.length] = journal;
                }
            });
            localStorage.setItem('journals', JSON.stringify(existingJournals));
            setScientificVenuesSuggestions(journals);
        }
    }, [journals]);
    const handleJournalsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setScientificVenues(e.target.value);
    };

    const { data: concepts, isLoading: isLoadingConcepts } = useConcepts(conceptSearch);
    useEffect(() => {
        if (concepts) {
            const storedData = localStorage.getItem('concepts');
            let existingConcepts = []
            if (storedData) {
                existingConcepts = JSON.parse(storedData);
            }
            concepts.items.forEach((concept: { id: string | number; name: any; }) => {
                const temp_concept = existingConcepts.find((_concept: { id: string; }) => _concept.id === concept.id)
                if (typeof temp_concept === 'undefined') {
                    existingConcepts[existingConcepts.length] = concept;
                }
            });
            localStorage.setItem('concepts', JSON.stringify(existingConcepts));
            setConceptSuggestions(concepts);
        }
    }, [concepts]);
    const handleConcepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConceptSearch(e.target.value);
    };

    const { data: authors, isLoading: isLoadingAuthors } = useAuthors(authorSearch);
    useEffect(() => {
        if (authors) {
            const storedData = localStorage.getItem('authors');
            let existingAuthors = []
            if (storedData) {
                existingAuthors = JSON.parse(storedData);
            }
            authors.items.forEach((author: { author_id: string | number; name: any; }) => {
                const temp_author = existingAuthors.find((_author: { author_id: string; }) => _author.author_id === author.author_id)
                if (typeof temp_author === 'undefined') {
                    existingAuthors[existingAuthors.length] = author;
                }
            });
            localStorage.setItem('authors', JSON.stringify(existingAuthors));
            setAuthorSuggestions(authors);
        }
    }, [authors]);
    const handleAuthorsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAuthorSearch(e.target.value);
    };

    useEffect(() => {
        const initializeFromURL = async () => {
            const searchParams = new URLSearchParams(window.location.search);

            const title = searchParams.get('title');
            if (title) setTitleSearch(title);

            const startYear = searchParams.get('start_year');
            const endYear = searchParams.get('end_year');
            if (startYear && endYear) {
                const start = parseInt(startYear);
                const end = parseInt(endYear);
                if (!isNaN(start) && !isNaN(end)) {
                    setTimeRange([start, end]);
                }
            }

            const authorIds = helper.getArrayFromURL('authors');
            const scientificVenueIds = helper.getArrayFromURL('scientific_venues');
            const fieldIds = helper.getArrayFromURL('research_fields');
            const conceptIds = helper.getArrayFromURL('concepts');

            if (conceptIds.length > 0) {
                const conceptsWithNames = conceptIds.map(id => ({
                    id,
                    name: getConceptNameById(id) || id
                })).filter(item => item.name);
                setSelectedConcepts(conceptsWithNames);
            }

            if (scientificVenueIds.length > 0) {
                const journalsWithNames = scientificVenueIds.map(id => ({
                    id,
                    name: getItemNameById(id, 'journals') || id
                })).filter(item => item.name);
                setSelectedScientificVenues(journalsWithNames);
            }

            if (fieldIds.length > 0) {
                const fieldsWithNames = fieldIds.map(id => ({
                    id,
                    name: getItemNameById(id, 'fields') || id
                })).filter(item => item.name);
                setSelectedResearchFields(fieldsWithNames);
            }

            if (authorIds.length > 0) {
                const authorsWithNames = authorIds.map(id => ({
                    id,
                    name: getItemNameById(id, 'authors') || id
                })).filter(item => item.name);
                setSelectedAuthors(authorsWithNames);
            }
        };
        initializeFromURL();
    }, []);

    const removeItem = (id: string, type: 'author' | 'journal' | 'research_field' | 'concept') => {
        const setters = {
            author: setSelectedAuthors,
            journal: setSelectedScientificVenues,
            research_field: setSelectedResearchFields,
            concept: setSelectedConcepts
        };
        setters[type](prev => prev.filter(item => item.id !== id));
    };
    const router = useRouter();
    const handleReset = () => {
        setTimeRange([2015, 2025]);
        setTitleSearch('');
        setAuthorSearch('');
        setScientificVenues('');
        setResearchFieldSearch('');
        setConceptSearch('');
        setSelectedAuthors([]);
        setSelectedScientificVenues([]);
        setSelectedResearchFields([]);
        setSelectedConcepts([]);
        if (window.location.pathname.includes('/statements')) {
            handleFilter({
                title: '',
                timeRange: { start: 2015, end: 2025 },
                page: currentPage,
                per_page: pageSize,
                authors: [],
                scientific_venues: [],
                research_fields: [],
                concepts: []
            });
            router.push(`/statements`);
        } else {
            handleFilter({
                title: '',
                timeRange: { start: 2015, end: 2025 },
                page: currentPage,
                per_page: pageSize,
                authors: [],
                scientific_venues: [],
                research_fields: [],
                concepts: []
            });
            router.push('/statements');
            // router.refresh();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const filterData = {
            title: titleSearch || undefined,
            timeRange: {
                start: timeRange[0],
                end: timeRange[1]
            },
            page: currentPage,
            per_page: pageSize,
            authors: selectedAuthors.map(author => author.id),
            scientific_venues: selectedScientificVenues.map(journal => journal.id),
            research_fields: selectedResearchFields.map(field => field.id),
            concepts: selectedConcepts.map(concept => concept.id)
        };

        const urlParams = {
            title: titleSearch || undefined,
            start_year: timeRange[0],
            end_year: timeRange[1],
            authors: selectedAuthors.map(author => author.id),
            scientific_venues: selectedScientificVenues.map(journal => journal.id),
            research_fields: selectedResearchFields.map(field => field.id),
            concepts: selectedConcepts.map(concept => concept.id),
            page: currentPage,
            per_page: pageSize
        };
        updateURLParams(urlParams);
        handleFilter(filterData);
        // if (window.location.pathname.includes('/statements')) {
        //     updateURLParams(urlParams);
        //     handleFilter(filterData);
        // } else {
        //     updateURLParams(urlParams);
        // }
    };

    useImperativeHandle(ref, () => ({
        setSelectedConcepts,
        setSelectedResearchFields,
        setSelectedAuthors,
        setSelectedScientificVenues,
        handleSubmit
    }));

    function getItemNameById(id: string, item: string): string | undefined {
        const stored = localStorage.getItem(item);
        if (!stored) return undefined;
        const items = JSON.parse(stored) || [];
        const data = items.find((concept: { id: string; }) => concept.id === id);
        return data?.name;
    }

    function getConceptNameById(id: string): string | undefined {
        const storedConcepts = localStorage.getItem('concepts');
        if (!storedConcepts) return undefined;
        const concepts = JSON.parse(storedConcepts) || [];
        const concept = concepts.find((concept: { id: string; }) => concept.id === id);
        return concept?.name;
    }

    const updateURLParams = (params: Record<string, any>) => {
        const searchParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach(v => {
                    if (v) searchParams.append(key, v);
                });
            } else if (value) {
                searchParams.set(key, String(value));
            }
        });

        const newUrl = `${'/statements'}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
        window.location.href = newUrl;
        // router.push(newUrl);
        // router.refresh();
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md">
                <div className="mb-4 px-4 pt-4">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                        Time Range: {timeRange[0]} - {timeRange[1]}
                    </label>
                    <div className="relative w-full h-8">
                        <div className="absolute h-1 w-full bg-gray-200 rounded top-1/2 -translate-y-1/2"></div>
                        <input
                            type="range"
                            min={2000}
                            max={2025}
                            value={timeRange[0]}
                            onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (value < timeRange[1]) {
                                    setTimeRange([value, timeRange[1]]);
                                }
                            }}
                            className="absolute top-1/2 -translate-y-1/2 w-full pointer-events-none appearance-none bg-transparent cursor-pointer z-[100]
                             [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto
                             [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full
                             [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
                             [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:bg-blue-700
                             
                             [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto
                             [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full
                             [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white
                             [&::-moz-range-thumb]:shadow-md hover:[&::-moz-range-thumb]:bg-blue-700"
                        />
                        <input
                            type="range"
                            min={2000}
                            max={2025}
                            value={timeRange[1]}
                            onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (value > timeRange[0]) {
                                    setTimeRange([timeRange[0], value]);
                                }
                            }}
                            className="absolute top-1/2 -translate-y-1/2 w-full pointer-events-none appearance-none bg-transparent cursor-pointer z-[100]
                             [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto
                             [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full
                             [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
                             [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:bg-blue-700
                             
                             [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto
                             [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full
                             [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white
                             [&::-moz-range-thumb]:shadow-md hover:[&::-moz-range-thumb]:bg-blue-700"
                        />

                        <div
                            className="absolute h-1 bg-blue-600 rounded top-1/2 -translate-y-1/2"
                            style={{
                                left: `${(timeRange[0] - 2000) * (100 / 25)}%`,
                                width: `${((timeRange[1] - timeRange[0]) / 25) * 100}%`
                            }}
                        ></div>
                    </div>
                </div>

                <div className="space-y-4 px-4 pb-4">
                    <div>
                        <label className="block mb-2">Title or DOI</label>
                        <input
                            type="text"
                            value={titleSearch}
                            onChange={(e) => setTitleSearch(e.target.value)}
                            placeholder="Search by Title or DOI..."
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <AutocompleteField
                        label="Authors"
                        value={authorSearch}
                        inputRef={authorsRef}
                        onChange={handleAuthorsChange}
                        suggestions={authors || []}
                        selected={selectedAuthors}
                        onRemove={(id) => removeItem(id, 'author')}
                        type="author"
                        placeholder="Search authors..."
                    />

                    <AutocompleteField
                        label="Journals or Conferences"
                        value={scientificVenues}
                        inputRef={journalsRef}
                        onChange={handleJournalsChange}
                        suggestions={journals || []}
                        selected={selectedScientificVenues}
                        onRemove={(id) => removeItem(id, 'journal')}
                        type="journal"
                        placeholder="Search Journals or Conferences..."
                    />

                    <AutocompleteField
                        label="Research Fields"
                        value={researchFieldSearch}
                        inputRef={researchFieldsRef}
                        onChange={handleSearchChange}
                        suggestions={researchFields || []}
                        selected={selectedResearchFields}
                        onRemove={(id) => removeItem(id, 'research_field')}
                        type="research_field"
                        placeholder="Search Research Fields..."
                    />

                    <AutocompleteField
                        label="Keywords"
                        value={conceptSearch}
                        inputRef={conceptRef}
                        onChange={handleConcepsChange}
                        suggestions={concepts || []}
                        selected={selectedConcepts}
                        onRemove={(id) => removeItem(id, 'concept')}
                        type="concept"
                        placeholder="Search Keywords..."
                    />

                    {submitError && (
                        <div className="p-3 mb-4 text-red-700 bg-red-100 rounded-md">
                            {submitError}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Filtering...' : 'Filter'}
                        </button>

                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
});

export default SideSearchForm;