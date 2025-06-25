'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import SideSearchForm from '../search/SideSearchForm';
import JsonTreeViewer from '../json/JsonTreeViewer';
import PaperInfo from '../paper/PaperInfo';
import { helper } from '@/app/utils/helper';
import PaperShortInfo from '../paper/PaperShortInfo';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, X } from 'lucide-react';
import { useQueryData } from '@/app/hooks/useQueryData';
import { useRouter, useSearchParams } from 'next/navigation'
import { REBORN_API_URL } from '@/app/lib/config/constants';
import { nanoid } from 'nanoid';

interface Statement {
    _id: string;
    article: {
        abstract: string;
        name: string;
        authors?: Array<{
            id: string;
            identifier: string;
            label: string;
        }>;
    };
    content: any;
    [x: string]: any;
}
interface ListStatementsProps {
    data: Statement[] | Record<string, Statement[]> | any;
    statements: Record<string, Statement[]> | any;
    isOpenSideSearch?: boolean;
    statementId?: any;
}

interface TimeRange {
    start: number;
    end: number;
}

interface QueryParams {
    timeRange?: TimeRange;
    authors?: string[];
    scientific_venues?: string[];
    concepts?: string[];
}

export default function ListStatements({ data, statements, statementId = null, isOpenSideSearch = true }: ListStatementsProps) {
    const statementRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    const [currentPage, setCurrentPage] = useState(1);
    const [isSidebarOpen, setIsSidebarOpen] = useState(isOpenSideSearch);
    const [queryData, setQueryData] = useState();
    const [articles, setArticles] = useState(Array.isArray(data) ? data : [data]);
    const [isLoading, setIsLoading] = useState(false);
    const [statementDetails, setStatementDetails] = useState<any>(null);
    const [filterParams, setFilterParams] = useState<QueryParams>({
        timeRange: {
            start: 2000,
            end: 2025
        },
        authors: [],
        scientific_venues: [],
        concepts: []
    });
    // const { data: filteredStatements, isLoading: isQueryLoading, error } = useQueryData(filterParams);
    // useEffect(() => {
    //     if (filteredStatements) {
    //         console.log(filteredStatements)
    //         setArticles([filteredStatements.results]);
    //     }
    // }, [filteredStatements]);

    const handleFilter = (formData: QueryParams) => {
        setFilterParams(formData);
    };

    const [pageSize, setPageSize] = useState(10);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [processedStatements, setProcessedStatements] = useState<any>([]);

    const [headerHeight, setHeaderHeight] = useState(0);
    const [activeHeader, setActiveHeader] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const [showMore, setShowMore] = useState(false);
    const prevActiveHeader = useRef(null);
    const headerRefs = useRef<(HTMLDivElement | null)[]>([]);

    const sideSearchFormRef = useRef<any>(null);
    const pageSizeOptions = [5, 10, 20, 50];

    useEffect(() => {
        if (statementId) {
            const element = statementRefs.current[statementId];
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 100);
            }
        }
    }, [statementId]);
    useEffect(() => {
        if (statementId && statements) {
            const matchingStatement = statements.find((statement: any) => statement.statement_id === statementId);
            if (matchingStatement) {
                setOpenStatementId(statementId);
                setStatementDetails(matchingStatement);
            }
        }
    }, [statementId, statements]);
    // useEffect(() => {
    //     const handleScroll = () => {
    //         const scrollPosition = window.scrollY;
    //         let currentActiveHeader = null;

    //         Object.entries(headerRefs.current).forEach(([index, headerRef]) => {
    //             if (headerRef) {
    //                 const headerRect = headerRef.getBoundingClientRect();
    //                 const headerPosition = headerRect.top + scrollPosition;

    //                 if (headerPosition <= scrollPosition + headerHeight) {
    //                     currentActiveHeader = parseInt(index);
    //                 }
    //             }
    //         });
    //         if (scrollPosition < 20) {
    //             currentActiveHeader = null;
    //         }
    //         if (currentActiveHeader !== activeHeader) {
    //             if (!isHeaderVisible) {
    //                 setIsHeaderVisible(true);
    //             }
    //             prevActiveHeader.current = activeHeader;
    //             setIsTransitioning(true);
    //             setTimeout(() => setIsTransitioning(false), 300);
    //         }

    //         setActiveHeader(currentActiveHeader);
    //     };

    //     window.addEventListener('scroll', handleScroll);
    //     return () => window.removeEventListener('scroll', handleScroll);
    // }, [headerHeight, activeHeader]);

    useEffect(() => {
        if (headerRefs.current[0]) {
            setHeaderHeight(headerRefs.current[0].offsetHeight);
        }
    }, []);

    const totalPages = Math.ceil(processedStatements.length / pageSize);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const renderPagination = () => {
        const pages = [];
        const leftBound = Math.max(1, currentPage - 2);
        const rightBound = Math.min(totalPages, currentPage + 2);

        if (leftBound > 1) {
            pages.push(
                <button
                    key={1}
                    onClick={() => handlePageChange(1)}
                    className="px-3 py-1 mx-1 rounded border bg-gray-100 hover:bg-gray-200"
                >
                    1
                </button>
            );
            if (leftBound > 2) pages.push(<span key="leftDots">...</span>);
        }

        for (let i = leftBound; i <= rightBound; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-1 mx-1 rounded border ${currentPage === i ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                >
                    {i}
                </button>
            );
        }

        if (rightBound < totalPages) {
            if (rightBound < totalPages - 1) pages.push(<span key="rightDots">...</span>);
            pages.push(
                <button
                    key={totalPages}
                    onClick={() => handlePageChange(totalPages)}
                    className="px-3 py-1 mx-1 rounded border bg-gray-100 hover:bg-gray-200"
                >
                    {totalPages}
                </button>
            );
        }

        return pages;
    };

    const handleSelect = (type: 'concept' | 'author' | 'journal' | 'field') =>
        (item: any) => {
            if (!sideSearchFormRef.current) return;
            const formatMap = {
                concept: { id: item.concept_id, name: item.label },
                author: { id: item.id ? item.id : item.author_id, name: item.label },
                journal: { id: item.id, name: item.label },
                field: { id: item.research_field_id ? item.research_field_id : item.id, name: item.label }
            };

            const setterMap = {
                concept: 'setSelectedConcepts',
                author: 'setSelectedAuthors',
                journal: 'setSelectedScientificVenues',
                field: 'setSelectedResearchFields'
            };

            sideSearchFormRef.current[setterMap[type]]([formatMap[type]]);

            setTimeout(() => {
                const fakeEvent = new Event('submit', { cancelable: true });
                sideSearchFormRef.current?.handleSubmit(fakeEvent);
            }, 100);
        };

    const handleClose = () => {
        setIsHeaderVisible(false);
        setActiveHeader(null);
    };

    const handleShowMore = () => {
        setShowMore(!showMore);
    };

    const getTransitionStyles = () => {
        if (!isTransitioning) {
            return "opacity-100 transform translate-y-0";
        }

        if (prevActiveHeader.current === null || activeHeader === null) {
            return "opacity-0 transform -translate-y-4";
        }

        if (prevActiveHeader.current < activeHeader) {
            return "opacity-0 transform translate-y-4";
        }

        return "opacity-0 transform -translate-y-4";
    };

    const searchParams = useSearchParams();
    const conceptParam = searchParams.get('concept');
    const titleParam = searchParams.get('title');

    const [openStatementId, setOpenStatementId] = useState<string | null>(statementId);
    const router = useRouter();
    const handleTreeViewerClick = async (itemId: string) => {
        if (statementId === itemId) {
            return true
        }
        try {
            const response = await fetch(`${REBORN_API_URL}/articles/get_statement/?id=${itemId}`);
            if (!response.ok) {
                throw new Error(`Error fetching statement: ${response.status}`);
            }
            const data = await response.json();
            setOpenStatementId(itemId);
            setStatementDetails(data);
        } catch (error) {
            console.error("Error fetching statement details:", error);
        } finally {
            setIsLoading(false);
        }
        // if (statementId) {
        //     if (itemId === openStatementId) {
        //         // setOpenStatementId(null);
        //     } else {
        //         setIsLoading(true);
        //     }
        // }
        if (statementId) {
            if (itemId === openStatementId) {
                // setOpenStatementId(null);
            } else {
                setOpenStatementId(itemId);
                router.push(`/statement/${itemId}`);
            }
        }
    };
    return (
        <div className={`relative gap-4 mt-8 ${isSidebarOpen ? 'grid grid-cols-1 md:grid-cols-12' : 'flex'}`}>
            <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'col-span-1 md:col-span-3 relative' : 'w-1/24 sticky top-5'}`}>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className={`${isSidebarOpen ? 'hidden' : `sticky ${activeHeader !== null ? 'top-[calc(9rem)]' : 'top-[calc(5rem)]'} -right-2`} flex h-8 w-6 items-center justify-center rounded-r bg-blue-500 text-white shadow-md transition-[top] duration-300 ease-in-out`}
                >
                    {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </button>
                <div className={`sticky ${activeHeader !== null ? 'top-[calc(9rem)]' : 'top-[calc(5rem)]'} transition-[top] duration-300 ease-in-out ${isSidebarOpen ? '' : 'hidden'}`}>
                    <div className="max-h-[calc(100vh-2rem)] overflow-y-visible">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className={`absolute ${isSidebarOpen ? '-right-2' : '-right-3'} z-10 flex h-8 w-6 items-center justify-center rounded-r bg-blue-500 text-white shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400`}
                        >
                            {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                        </button>
                        <SideSearchForm
                            ref={sideSearchFormRef}
                            handleFilter={handleFilter}
                            currentPage={currentPage}
                            pageSize={pageSize}
                            isSubmitting={isSubmitting}
                            submitError={submitError}
                            conceptParam={conceptParam}
                            titleParam={titleParam}
                        />
                    </div>
                </div>
            </div>

            <div className={`transition-all duration-300 ease-in-out overflow-x-auto ${isSidebarOpen ? 'col-span-1 md:col-span-9' : 'max-w-23/24 w-[100%]'}`}>
                <Card className="bg-white shadow-lg">
                    <CardContent className="p-6">
                        {articles.length === 0 ? (
                            <p className="text-gray-500 text-center">No results found</p>
                        ) : (
                            <>
                                <div className="relative">
                                    {/* {activeHeader !== null && isHeaderVisible && (
                                        statements[Object.keys(statements)[activeHeader]] && (
                                            <div className={`fixed top-[3.8rem] left-0 right-0 z-10 shadow-md transition-all duration-300 ease-in-out bg-[#fff] ${getTransitionStyles()}`}>
                                                <div className="m-2 overflow-hidden">
                                                    <div className="bg-light relative" >
                                                        <div className="absolute inset-0 bg-blue-50 opacity-0 transition-opacity duration-300"
                                                            style={{ opacity: isTransitioning ? 0.5 : 0 }} />
                                                        <div className="relative z-10">
                                                            <button
                                                                onClick={handleClose}
                                                                className="absolute top-0 right-0 rounded-full transition-colors"
                                                                aria-label="Close sticky header"
                                                            >
                                                                <X className="h-5 w-5" />
                                                            </button>
                                                            <button
                                                                onClick={handleShowMore}
                                                                className="absolute top-[2rem] right-0 rounded-full transition-colors"
                                                                aria-label="Close sticky header"
                                                            >
                                                                {showMore ? (<ChevronUp className="h-5 w-5" />) : (<ChevronDown className="h-5 w-5" />)}
                                                            </button>
                                                            <PaperShortInfo
                                                                onJournalSelect={handleSelect('journal')}
                                                                onAuthorSelect={handleSelect('author')}
                                                                onResearchFieldSelect={handleSelect('field')}
                                                                showMore={showMore}
                                                                paper={article}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )} */}
                                    <div className="space-y-4">
                                        {articles.map((item: any, index: any) => {
                                            const article = item.article
                                            return (
                                                <div className="border rounded p-0" key={`article-${nanoid()}`}>
                                                    <PaperInfo
                                                        paper={article}
                                                        key={`article-info-${nanoid()}`}
                                                        onAuthorSelect={handleSelect('author')}
                                                        onJournalSelect={handleSelect('journal')}
                                                        onResearchFieldSelect={handleSelect('field')} />
                                                    {item.statements && item.statements.map((statement: any, index: any) => {
                                                        return (
                                                            <div key={index} ref={(el: HTMLDivElement | null): void => { headerRefs.current[index] = el; }}>
                                                                <div
                                                                    key={`list-${index}`}
                                                                    ref={(el: HTMLDivElement | null) => {
                                                                        if (statement['statement_id'] === statementId) {
                                                                            statementRefs.current[statement['statement_id']] = el;
                                                                        }
                                                                    }}
                                                                >
                                                                    <JsonTreeViewer
                                                                        handleTreeViewerClick={() => handleTreeViewerClick(statement.statement_id)}
                                                                        parentOpen={statement.statement_id === statementId && statement.data_type.length > 0}
                                                                        onAuthorSelect={handleSelect('author')}
                                                                        onConceptSelect={handleSelect('concept')}
                                                                        jsonData={statement}
                                                                        article={article}
                                                                        single={true}
                                                                        statement={statement}
                                                                        statementDetails={statement.statement_id === openStatementId ? statementDetails : null}
                                                                    />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
