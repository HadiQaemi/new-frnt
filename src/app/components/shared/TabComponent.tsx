import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight, Dot } from 'lucide-react';
import { debounce } from 'lodash';
import Link from 'next/link';
import { REBORN_API_URL } from '@/app/lib/config/constants';
import { helper } from '@/app/utils/helper';

type TabId = 'articles' | 'statements' | 'keywords' | 'authors' | 'journals';

type PaginationState = {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
};

type TabContents = {
    [K in TabId]: string[];
};

interface TabComponentProps {
    selectedResearchFields: any[];
    ranking: string;
}

const TabComponent: React.FC<TabComponentProps> = ({
    selectedResearchFields,
    ranking = 'a-z',
}) => {
    const [activeTab, setActiveTab] = useState<TabId>('articles');
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('keyword');

    const searchInputRef = useRef<HTMLInputElement>(null);

    const [tabContents, setTabContents] = useState<TabContents>({
        articles: [],
        statements: [],
        keywords: [],
        authors: [],
        journals: []
    });

    const [pagination, setPagination] = useState<PaginationState>({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    });

    const buildQueryParams = () => {
        const params = new URLSearchParams({
            page: pagination.currentPage.toString(),
            limit: pagination.itemsPerPage.toString(),
            sort: ranking
        });

        if (searchTerm) {
            params.append('search', searchTerm);
        }

        if (searchType) {
            params.append('search_type', searchType);
        } else {
            params.append('search_type', 'keyword');
        }

        selectedResearchFields.forEach(field => {

            params.append('research_fields[]', field.research_field_id);
        });

        return params.toString();
    };

    const debouncedSearch = useCallback(
        debounce((term: string) => {
            setPagination(prev => ({ ...prev, currentPage: 1 }));
            setSearchTerm(term);
        }, 300),
        []
    );

    useEffect(() => {
        setSearchTerm('');
        if (searchInputRef.current) {
            searchInputRef.current.value = '';
        }
    }, [activeTab, selectedResearchFields]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const queryParams = buildQueryParams();
            let url = ''
            if (activeTab == 'articles')
                url = `${REBORN_API_URL}/articles/get_latest_articles/?${queryParams}`
            else if (activeTab == 'statements')
                url = `${REBORN_API_URL}/articles/get_latest_statements/?${queryParams}`
            else if (activeTab == 'authors')
                url = `${REBORN_API_URL}/articles/get_latest_authors/?${queryParams}`
            else if (activeTab == 'journals')
                url = `${REBORN_API_URL}/articles/get_journals/?${queryParams}`

            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setTabContents(prev => ({
                ...prev,
                [activeTab]: data.items
            }));
            setPagination(prev => ({
                ...prev,
                totalPages: Math.ceil(data.total / pagination.itemsPerPage),
                totalItems: data.total
            }));
            if (activeTab !== 'statements' && activeTab !== 'articles') {
                let tempTab = `${activeTab}`
                if (activeTab === 'keywords') {
                    tempTab = 'concepts'
                }

                const storedData = localStorage.getItem(tempTab);
                let existingData = []
                if (storedData) {
                    existingData = JSON.parse(storedData);
                }
                data.items?.forEach((item: any) => {
                    if (activeTab === 'journals') {
                        const temp_journal = existingData.find((_journal: any) => _journal.id === item.journal_id)
                        if (typeof temp_journal === 'undefined') {
                            existingData[existingData.length] = {
                                id: item.journal_id,
                                name: item.name,
                            };
                        }
                    } else if (activeTab === 'authors') {
                        const temp_author = existingData.find((_author: any) => _author.id === item.author_id)
                        if (typeof temp_author === 'undefined') {
                            existingData[existingData.length] = {
                                id: item.author_id,
                                name: item.name,
                            };
                        }
                    }

                });
                localStorage.setItem(tempTab, JSON.stringify(existingData));
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!(activeTab === 'statements' || activeTab === 'articles') || !searchTerm.length) {
            fetchData();
        }
    }, [activeTab, pagination.currentPage, pagination.itemsPerPage, selectedResearchFields, ranking, searchTerm]);

    const handleSemanticSearch = async () => {
        setPagination({
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: 10
        });
        setIsLoading(true);
        try {
            const queryParams = buildQueryParams();
            if (searchType === 'keyword') {
                fetchData();
            } else {
                const response = await fetch(`${REBORN_API_URL}/articles/get_latest_${activeTab}?${queryParams}`);
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();

                setTabContents(prev => ({
                    ...prev,
                    [activeTab]: data.items
                }));

                setPagination(prev => ({
                    ...prev,
                    totalPages: Math.ceil(data.total / pagination.itemsPerPage),
                    totalItems: data.total
                }));
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        debouncedSearch(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            debouncedSearch.cancel();
            setPagination(prev => ({ ...prev, currentPage: 1 }));
            setSearchTerm(e.currentTarget.value);
            if (activeTab === 'statements' || activeTab === 'articles') {
                handleSemanticSearch();
            }
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({
                ...prev,
                currentPage: newPage
            }));
        }
    };

    const tabs: Array<{ id: TabId; label: string }> = [
        { id: 'articles', label: 'Articles' },
        { id: 'statements', label: 'Statements' },
        { id: 'authors', label: 'Authors' },
        { id: 'journals', label: 'Journals' }
    ];

    const renderPaginationNumbers = () => {
        const pages = [];
        for (let i = Math.max(1, pagination.currentPage - 2);
            i <= Math.min(pagination.totalPages, pagination.currentPage + 2);
            i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-1 mx-1 rounded-md ${pagination.currentPage === i
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                >
                    {i}
                </button>
            );
        }
        return pages;
    };
    const handleSearchTypeChange = (e: any) => {
        setSearchType(e.target.value);
    };
    return (
        <div className="w-full mx-auto p-4 bg-white">
            <div className="flex sm:border-b overflow-auto scrollbar-custom">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id);
                            setPagination(prev => ({ ...prev, currentPage: 1 }));
                            setSearchTerm('');
                        }}
                        className={`px-4 py-2 mr-2 font-medium transition-colors duration-150
                            ${activeTab === tab.id
                                ? 'text-red-500 border-b-2 border-red-500'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        <h1 className="font-inter font-bold">{tab.label}</h1>
                    </button>
                ))}
            </div>

            <div className="mt-4 mb-2">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <input
                            ref={searchInputRef}
                            type="text"
                            onChange={handleSearch}
                            onKeyDown={handleKeyDown}
                            placeholder={`Search ${activeTab}...`}
                            className={`w-full px-4 py-2 ${!(activeTab === 'statements' || activeTab === 'articles') ? `pl-10` : ''} border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500`}
                        />
                        {!(activeTab === 'statements' || activeTab === 'articles') && (
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        )}
                    </div>
                    {(activeTab === 'statements' || activeTab === 'articles') && (
                        <span>
                            <select
                                value={searchType}
                                onChange={handleSearchTypeChange}
                                className="px-3 py-2 pr-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                <option value="">--Type of Search--</option>
                                <option value="keyword" className="py-2">
                                    {searchType === "keyword" ?
                                        "Keyword based ✓" :
                                        (searchType === "" ?
                                            "Keyword based ✓" :
                                            "Keyword based")}
                                </option>
                                <option value="semantic" className="py-2">
                                    {searchType === "semantic" ?
                                        "Semantic search ✓" :
                                        "Semantic search"}
                                </option>
                                <option value="hybrid" className="py-2">
                                    {searchType === "hybrid" ?
                                        "Hybrid ✓" :
                                        "Hybrid"}
                                </option>
                            </select>
                            <button
                                className="p-2 text-gray-400"
                                onClick={handleSemanticSearch}
                                title="Semantic Search"
                            >
                                <Search className="h-5 w-5" />
                            </button>
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                {isLoading ? (
                    <div className="text-center py-4 text-gray-500">Loading...</div>
                ) : (
                    tabContents[activeTab].map((item: any, index) => (
                        <div key={index} className="p-2 rounded-lg transition-colors duration-200 border border-gray-100 shadow-sm">
                            {activeTab === 'statements' ? (
                                <span key={`statements-${item.id}`}>
                                    <Link
                                        href={`/statement/${item.statement_id}`}
                                        className="text-[#000] cursor-pointer hover:text-[#555] block"
                                    >
                                        <h4 className="font-inter font-[700]">{item.name}</h4>
                                    </Link>
                                    <div className="block my-1 pt-1">
                                        <span className="font-inter font-[400] text-sm">{item.author} et al.</span>
                                        <span className="font-inter font-[500]"><Dot className="me-1 inline font-bold" /></span>
                                        <span className="font-inter font-[400] text-sm">{item.date_published}</span>
                                        <span className="font-inter font-[500]"><Dot className="me-1 inline font-bold" /></span>
                                        <span className="font-inter font-[400] text-sm">{item.article}</span>
                                        <span className="font-inter font-[500]"><Dot className="me-1 inline font-bold" /></span>
                                        <span className="font-inter font-[400] text-sm">{item.scientific_venue}</span>
                                    </div>
                                </span>
                            ) : (
                                activeTab === 'articles' ? (
                                    <span key={`articles-${index}`}>
                                        <Link
                                            href={`/article/${item.article_id}`}
                                            className="text-[#000] cursor-pointer hover:text-[#555] block"
                                        >
                                            <h4 className="font-inter font-[700]">{item.name}</h4>
                                        </Link>
                                        <div className="block my-1 pt-1">
                                            <span className="font-inter font-[400] text-sm">{item.author} et al.</span>
                                            <span className="font-inter font-[500]"><Dot className="me-1 inline font-bold" /></span>
                                            <span className="font-inter font-[400] text-sm">{item.date_published}</span>
                                            <span className="font-inter font-[500]"><Dot className="me-1 inline font-bold" /></span>
                                            <span className="font-inter font-[400] text-sm">{item.scientific_venue.label}</span>
                                        </div>
                                    </span>
                                ) : (
                                    activeTab === 'keywords' ? (
                                        <span key={`keywords-${index}`}>
                                            <Link
                                                href={`/statements?start_year=2015&end_year=2025&concepts=${item.id}&page=1&per_page=10`}
                                                className="text-[#e86161] cursor-pointer hover:text-[#555] block"
                                            >
                                                <h4 className="font-inter font-[500]">{item.name}</h4>
                                            </Link>
                                            <div className="block my-1 pt-1">
                                                <span className="font-inter font-[400] text-sm">{item.author} et al.</span>
                                                <span className="font-inter font-[500]"><Dot className="me-1 inline font-bold" /></span>
                                                <span className="font-inter font-[400] text-sm">{item.date}</span>
                                                <span className="font-inter font-[500]"><Dot className="me-1 inline font-bold" /></span>
                                                <span className="font-inter font-[400] text-sm">{item.scientific_venue}</span>
                                            </div>
                                        </span>
                                    ) : (
                                        activeTab === 'authors' ? (
                                            <span key={`authors-${index}`}>
                                                <Link
                                                    href={`/statements?start_year=2015&end_year=2025&authors=${item.author_id}&page=1&per_page=10`}
                                                    className="text-[#000] cursor-pointer hover:text-[#555]"
                                                >
                                                    <h4 className="font-inter font-[700] inline">{item.name}</h4>
                                                </Link>
                                                {helper.validURL(item.orcid) && (
                                                    <span>
                                                        <span className="font-inter font-[500]"><Dot className="me-1 inline font-bold underline text-[10px]" /></span>
                                                        <span className="font-inter font-[400] text-sm"><a href={item.orcid} className='underline' target="_blank">{item.orcid}</a></span>
                                                    </span>
                                                )}
                                            </span>
                                        ) : (
                                            activeTab === 'journals' ? (
                                                <span key={`journals-${index}`}>
                                                    <Link
                                                        href={`/statements?start_year=2015&end_year=2025&scientific_venues=${item.journal_id}&page=1&per_page=10`}
                                                        className="text-[#000] cursor-pointer hover:text-[#555]"
                                                    >
                                                        <h4 className="font-inter font-[700] inline">{item.name}</h4>
                                                    </Link>
                                                    <span>
                                                        <span className="font-inter font-[500]"><Dot className="me-1 inline font-bold underline text-[10px]" /></span>
                                                        <span className="font-inter font-[400] text-sm">{item.publisher}</span>
                                                    </span>
                                                </span>
                                            ) : ''
                                        )
                                    )
                                )
                            )}
                        </div>
                    ))
                )}
            </div>

            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center mt-6 gap-2">
                    <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    {renderPaginationNumbers()}

                    <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>

                    <span className="ml-4 text-sm text-gray-500">
                        {pagination.totalItems} items
                    </span>
                </div>
            )}
        </div>
    );
};

export default TabComponent;