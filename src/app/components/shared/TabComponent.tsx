import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight, Dot } from 'lucide-react';
import { debounce } from 'lodash';
import Link from 'next/link';
import { REBORN_API_URL } from '@/app/lib/config/constants';
import { helper } from '@/app/utils/helper';
import { nanoid } from 'nanoid';
import { InitialParams } from '../json/types';

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
    initialParams: InitialParams;
    ranking: string;
}

const TabComponent: React.FC<TabComponentProps> = ({
    selectedResearchFields,
    ranking = 'a-z',
    initialParams
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
            const params = new URLSearchParams(
                Object.entries(initialParams)
                    .flatMap(([k, v]) =>
                        v == null
                            ? []
                            : Array.isArray(v)
                                ? v.map(x => [k, String(x)] as [string, string])
                                : [[k, String(v)] as [string, string]]
                    )
            );
            const queryParams = buildQueryParams();
            let url = ''
            if (activeTab == 'articles')
                url = `${REBORN_API_URL}/articles/get_articles/?${params.toString()}`
            else if (activeTab == 'statements')
                url = `${REBORN_API_URL}/articles/get_statements/?${queryParams}`
            else if (activeTab == 'authors')
                url = `${REBORN_API_URL}/articles/get_authors/?${queryParams}`
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
                const response = await fetch(`${REBORN_API_URL}/articles/get_${activeTab}?${queryParams}`);
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
        <div className="w-full mx-auto bg-white ml-4 border-[#1e3a5f] border-t-[5px] mb-5 rounded-tl-[10px] rounded-tr-[10px] rounded-[10px] shadow-[0_0_8px_0_rgba(0,0,0,0.13)]">
            <div className="bg-[#f7fafc] p-2 text-[#353839] font-[700] text-sm">
                Loom Records
            </div>
            <div className="space-y-2">
                {isLoading ? (
                    <div key={nanoid()} className="text-center py-4 text-gray-500">Loading...</div>
                ) : tabContents[activeTab]?.length === 0 ? (
                    <div key={nanoid()} className="text-center py-4 text-gray-500">Nothing found</div>
                ) : (
                    tabContents[activeTab].map((item: any, index) => (
                        <div key={nanoid()} className="col-span-12 px-4 py-2 my-4">
                            <div className="block">
                                <Link
                                    href={`/article/${item.article_id}`}
                                    className="text-[#000] cursor-pointer hover:text-[#555] block"
                                >
                                    <h4 className="font-inter font-[700]">{item.name}</h4>
                                </Link>
                            </div>
                            <div className="block">
                                <span className="font-inter font-[400] text-sm">{item.author} et al.</span>
                                <span className="font-inter font-[500]">
                                    <Dot className="me-1 inline font-bold" />
                                </span>
                                <span className="font-inter font-[400] text-sm">{item.date_published}</span>
                            </div>
                            <div className="block">
                                <span className="font-inter font-[400] text-xs italic">
                                    <span className="mr-1">
                                        Source {item.basises[0].publication_issue.type}:
                                    </span>
                                    {item.basises[0].authors[0].family_name} et al. (
                                    {item.basises[0].publication_issue.date_published}).{" "}
                                    {item.basises[0].name}.
                                    {item.basises[0].publication_issue.periodical && (
                                        <> {item.basises[0].publication_issue.periodical}</>
                                    )}.
                                </span>
                            </div>
                        </div>
                    )
                    )
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