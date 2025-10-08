import React, { useState, useRef, useEffect, useCallback, useImperativeHandle } from 'react';
import { X } from 'lucide-react';
import { useResearchFields } from '@/app/hooks/useResearchFields';
import { useJournals } from '@/app/hooks/useJournals';
import { useAuthors } from '@/app/hooks/useAuthors';
import { useConcepts } from '@/app/hooks/useConcepts';
import { helper } from '@/app/utils/helper';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import { InitialParams, ResourceType, SearchType, SortBy, SortOrder } from '../json/types';

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
    initialParams: InitialParams;
    handleFilter: (data: FilterData) => void;
}



interface FilterData {
    title: string | undefined;
    start_year: string;
    end_year: string;
    page: number;
    per_page: number;
    authors: string[];
    scientific_venues: string[];
    research_fields: string[];
    concepts: string[];
    resource_type: ResourceType;
    sort_by: SortBy;
    sort_order: SortOrder;
    search_type: SearchType;
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

const SideSearchForm = React.forwardRef<SideSearchFormRef, SideSearchFormProps>(({ currentPage, pageSize, submitError, isSubmitting, handleFilter, conceptParam, titleParam, initialParams }, ref) => {
    const [timeRange, setTimeRange] = useState<[number, number]>([2015, 2025]);
    const [titleSearch, setTitleSearch] = useState('');

    const [resourceType, setResourceType] = useState<ResourceType>('article');
    const [searchType, setSearchType] = useState<SearchType>('keyword');
    const [sortBy, setSortBy] = useState<SortBy>('alphabet');
    const [sortOrder, setSortOrder] = useState<SortOrder>('ASC');

    const [authorSearch, setAuthorSearch] = useState('');
    const [scientificVenues, setScientificVenues] = useState('');
    const [researchFieldSearch, setResearchFieldSearch] = useState('');
    const [conceptSearch, setConceptSearch] = useState('');

    const [startYear, setStartYear] = useState<string>('');
    const [endYear, setEndYear] = useState<string>('');

    const [showMore, setShowMore] = useState(false);

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
            {/* <label className="block mb-2">{label}</label> */}
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

    const { data: researchFields } = useResearchFields(researchFieldSearch);
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

    const { data: journals } = useJournals(scientificVenues);
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

    const { data: concepts } = useConcepts(conceptSearch);
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
            if (startYear) setStartYear(startYear);
            if (endYear) setEndYear(endYear);

            // const urlResource = (searchParams.get('resource_type') as ResourceType) || (window.location.pathname.includes('/articles') ? 'articles' : 'statements');
            const urlResource = (searchParams.get('resource_type') as ResourceType) || 'all';
            setResourceType(urlResource);

            const urlSortBy = (searchParams.get('sort_by') as SortBy) || 'alphabet';
            setSortBy(urlSortBy);

            const urlSortOrder = (searchParams.get('sort_order') as SortOrder) || 'ASC';
            setSortOrder(urlSortOrder);

            const urlSearchType = (searchParams.get('search_type') as SearchType) || 'keyword';
            setSearchType(urlSearchType);

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
        setStartYear('');
        setEndYear('');
        setAuthorSearch('');
        setScientificVenues('');
        setResearchFieldSearch('');
        setConceptSearch('');
        setSelectedAuthors([]);
        setSelectedScientificVenues([]);
        setSelectedResearchFields([]);
        setSelectedConcepts([]);
        // const currentPathType: ResourceType = window.location.pathname.includes('/articles') ? 'article' : 'dataset';
        const currentPathType: ResourceType = 'all';
        setResourceType(currentPathType);
        setSortBy('alphabet')
        setSortOrder('ASC')
        setSearchType('keyword');

        const baseFilter: FilterData = {
            title: '',
            start_year: '',
            end_year: '',
            page: currentPage,
            per_page: pageSize,
            authors: [],
            scientific_venues: [],
            research_fields: [],
            concepts: [],
            resource_type: currentPathType,
            search_type: 'keyword',
            sort_by: 'alphabet',
            sort_order: 'ASC',
        };

        handleFilter(baseFilter);
        const urlParams = {
            title: '',
            start_year: 2015,
            end_year: 2025,
            authors: [],
            scientific_venues: [],
            research_fields: [],
            concepts: [],
            page: currentPage,
            per_page: pageSize,
            resource_type: currentPathType,
            search_type: 'keyword',
            sort_by: 'alphabet',
            sort_order: 'ASC',
        };
        updateURLParams(urlParams, currentPathType);
        // if (window.location.pathname.includes('/statements')) {
        //     handleFilter({
        //         title: '',
        //         timeRange: { start: 2015, end: 2025 },
        //         page: currentPage,
        //         per_page: pageSize,
        //         authors: [],
        //         scientific_venues: [],
        //         research_fields: [],
        //         concepts: []
        //     });
        //     router.push(`/statements`);
        // } else {
        //     handleFilter({
        //         title: '',
        //         timeRange: { start: 2015, end: 2025 },
        //         page: currentPage,
        //         per_page: pageSize,
        //         authors: [],
        //         scientific_venues: [],
        //         research_fields: [],
        //         concepts: []
        //     });
        //     router.push('/statements');
        //     // router.refresh();
        // }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const filterData = {
            title: titleSearch || undefined,
            start_year: startYear,
            end_year: endYear,
            page: currentPage,
            per_page: pageSize,
            authors: selectedAuthors.map(author => author.id),
            scientific_venues: selectedScientificVenues.map(journal => journal.id),
            research_fields: selectedResearchFields.map(field => field.id),
            concepts: selectedConcepts.map(concept => concept.id),
            resource_type: resourceType,
            search_type: searchType,
            sort_by: sortBy,
            sort_order: sortOrder,
        };

        const urlParams = {
            title: titleSearch || undefined,
            start_year: startYear,
            end_year: endYear,
            authors: selectedAuthors.map(author => author.id),
            scientific_venues: selectedScientificVenues.map(journal => journal.id),
            research_fields: selectedResearchFields.map(field => field.id),
            concepts: selectedConcepts.map(concept => concept.id),
            page: currentPage,
            per_page: pageSize,
            resource_type: resourceType,
            search_type: searchType,
            sort_by: sortBy,
            sort_order: sortOrder,
        };
        updateURLParams(urlParams, resourceType);
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

    const updateURLParams = (params: Record<string, any>, resource: ResourceType) => {
        const searchParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach(v => {
                    if (v) searchParams.append(key, v);
                });
            } else if (value !== undefined && value !== null && value !== '') {
                searchParams.set(key, String(value));
            }
        });

        const basePath = resource === 'article' ? '/' : '/';
        const newUrl = `${'/'}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
        window.location.href = newUrl;
        router.push(newUrl);
        router.refresh();
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="bg-white text-[#353839] border-[#ECA400] border-t-[5px] rounded-tl-[10px] rounded-tr-[10px] rounded-[10px] shadow-[0_0_8px_0_rgba(0,0,0,0.13)]">
                <div className="bg-[#FDF6EC] p-2 pl-4 font-[700] text-sm">
                    Search
                </div>

                <div className="space-y-4 px-4 pb-4 mt-4">

                    <AutocompleteField
                        label="Research Fields"
                        value={researchFieldSearch}
                        inputRef={researchFieldsRef}
                        onChange={handleSearchChange}
                        suggestions={researchFields || []}
                        selected={selectedResearchFields}
                        onRemove={(id) => removeItem(id, 'research_field')}
                        type="research_field"
                        placeholder="Subject Areas"
                    />

                    <div>
                        {/* <label className="block mb-2">Title or DOI</label> */}
                        <input
                            type="text"
                            value={titleSearch}
                            onChange={(e) => setTitleSearch(e.target.value)}
                            placeholder="Keywords"
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-[#353839]"
                        />
                    </div>

                    {showMore && (
                        <>
                            <AutocompleteField
                                label=""
                                value={conceptSearch}
                                inputRef={conceptRef}
                                onChange={handleConcepsChange}
                                suggestions={concepts || []}
                                selected={selectedConcepts}
                                onRemove={(id) => removeItem(id, 'concept')}
                                type="concept"
                                placeholder="Concepts"
                            />

                            <AutocompleteField
                                label="Authors"
                                value={authorSearch}
                                inputRef={authorsRef}
                                onChange={handleAuthorsChange}
                                suggestions={authors || []}
                                selected={selectedAuthors}
                                onRemove={(id) => removeItem(id, 'author')}
                                type="author"
                                placeholder="Authors"
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
                                placeholder="Journals or Conferences"
                            />

                            <div className='flex gap-2'>
                                <input
                                    type="text"
                                    value={startYear}
                                    onChange={(e) => setStartYear(e.target.value)}
                                    placeholder="Year start"
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-[#353839]"
                                />
                                <input
                                    type="text"
                                    value={endYear}
                                    onChange={(e) => setEndYear(e.target.value)}
                                    placeholder="Year end"
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-[#353839]"
                                />
                            </div>

                            <div>
                                <select
                                    value={resourceType}
                                    onChange={(e) => setResourceType(e.target.value as ResourceType)}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                >
                                    <option value="all" className="py-2 text-[#353839]">
                                        {resourceType === "all" ?
                                            "All" :
                                            "All"}
                                    </option>
                                    <option value="chapter" className="py-2 text-[#353839]">
                                        {resourceType === "chapter" ?
                                            "Chapters" :
                                            "Chapters"}
                                    </option>
                                    <option value="article" className="py-2 text-[#353839]">
                                        {resourceType === "article" ?
                                            "Articles" :
                                            "Articles"}
                                    </option>
                                    <option value="dataset" className="py-2 text-[#353839]">
                                        {resourceType === "dataset" ?
                                            "Datasets" :
                                            "Datasets"}
                                    </option>
                                </select>
                            </div>

                            <div>
                                <select
                                    value={searchType}
                                    onChange={(e) => setSearchType(e.target.value as SearchType)}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                >
                                    <option value="keyword" className="py-2 text-[#353839]">
                                        {searchType === "keyword" ?
                                            "Keyword search" :
                                            "Keyword search"}
                                    </option>
                                    <option value="semantic" className="py-2 text-[#353839]">
                                        {searchType === "semantic" ?
                                            "Semantic search" :
                                            "Semantic search"}
                                    </option>
                                    <option value="hybrid" className="py-2 text-[#353839]">
                                        {searchType === "hybrid" ?
                                            "Hybrid search" :
                                            "Hybrid search"}
                                    </option>
                                </select>
                            </div>

                            <div className='flex gap-2'>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                >
                                    <option value="alphabet" className="py-2 text-[#353839]">
                                        {sortBy === "alphabet" ?
                                            "Alphabetical" :
                                            "Alphabetical"}
                                    </option>
                                    <option value="time" className="py-2 text-[#353839]">
                                        {sortBy === "time" ?
                                            "Chronological" :
                                            "Chronological"}
                                    </option>
                                </select>
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                >
                                    <option value="ASC" className="py-2 text-[#353839]">
                                        {sortOrder === "ASC" ?
                                            "Ascending" :
                                            "Ascending"}
                                    </option>
                                    <option value="DESC" className="py-2 text-[#353839]">
                                        {sortOrder === "DESC" ?
                                            "Descending" :
                                            "Descending"}
                                    </option>
                                </select>
                            </div>
                        </>
                    )}

                    <button
                        type="button"
                        onClick={() => setShowMore((v) => !v)}
                        aria-expanded={showMore}
                        className="m-1 inline-flex items-center gap-2 text-[#1e3a5f] underline"
                    >
                        {showMore ? "Show less" : "Show more"}
                    </button>

                    {submitError && (
                        <div className="p-3 mb-4 text-red-700 bg-red-100 rounded-md">
                            {submitError}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-white bg-[#eca400] rounded-md disabled:opacity-50"
                        >
                            {isSubmitting ? 'Filtering...' : 'Filter'}
                        </button>

                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-gray-700 bg-[#FDF6EC] rounded-md hover:bg-gray-300 disabled:opacity-50"
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