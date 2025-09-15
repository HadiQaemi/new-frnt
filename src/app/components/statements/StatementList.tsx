'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import SideSearchForm from '../search/SideSearchForm';
import JsonTreeViewer from '../json/JsonTreeViewer';
import PaperInfo from '../paper/PaperInfo';
import { helper } from '@/app/utils/helper';
import PaperShortInfo from '../paper/PaperShortInfo';
import { BookOpenText, BookText, Calendar, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, CopyIcon, Dot, MousePointer2, User, X } from 'lucide-react';
import { useQueryData } from '@/app/hooks/useQueryData';
import { useRouter, useSearchParams } from 'next/navigation'
import { REBORN_API_URL } from '@/app/lib/config/constants';
import { nanoid } from 'nanoid';
import { useToast } from '@/components/ui/use-toast'
import CustomPopover from '../shared/CustomPopover';
import TruncatedAbstract from '../paper/TruncatedAbstract';

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
    const { toast } = useToast();
    const copyToClipboard = (rawText: any) => {
        const formattedText = rawText;

        navigator.clipboard.writeText(formattedText)
            .then(() =>
                toast({
                    title: "Success!",
                    description: "Address copied to clipboard!",
                    className: "bg-green-100",
                })
            )
            .catch(() =>
                toast({
                    title: "Error!",
                    description: "Failed to copy",
                    className: "bg-red-100",
                })
            );
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
            const response = await fetch(`${REBORN_API_URL}/articles/get_statement_by_id/?id=${itemId}`);
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
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-4`}>
            {/* <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'col-span-1 md:col-span-3 relative' : 'w-1/24 sticky top-5'}`}>
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
            </div> */}

            {/* <div className={`transition-all duration-300 ease-in-out overflow-x-auto ${isSidebarOpen ? 'col-span-1 md:col-span-9' : 'w-14/24'}`}> */}
            <div className={`md:col-span-3`}>
                <Card>
                    <CardContent className="p-0">
                        {articles.length === 0 ? (
                            <p className="text-gray-500 text-center">No results found</p>
                        ) : (
                            <>
                                <div className="relative">
                                    <div className="space-y-4">
                                        {articles.map((item: any, index: any) => {
                                            const article = item.article
                                            return (
                                                <div className="border rounded bg-white p-0" key={`article-${nanoid()}`}>
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
            <div className={`md:col-span-1 sticky top-5`}>
                <div className={`sticky ${activeHeader !== null ? 'top-[calc(9rem)]' : 'top-[calc(5rem)]'} transition-[top] duration-300 ease-in-out ${isSidebarOpen ? '' : ''}`}>
                    <div className="max-h-[calc(100vh-2rem)] overflow-y-visible">
                        <Card className="p-0">
                            <CardContent className="p-0">
                                <div className="relative">
                                    <div>
                                        <div className="border rounded p-0" key={`article-${nanoid()}`}>
                                            <div className="bg-[#00b0505e] p-2 text-gray-700 font-[700] text-sm">
                                                Article
                                            </div>
                                            {data.basises.map((item: any, index: any) => {
                                                return (
                                                    <div key={`basis-${nanoid()}`}>
                                                        <div className='bg-white p-4 pt-2'>
                                                            <div className="grid grid-cols-1">
                                                                <h6 className="text-black leading-tight mb-2 font-medium">
                                                                    {item.name}
                                                                </h6>
                                                                <h6 className="text-black leading-tight mb-2 font-medium">
                                                                    <Calendar className="me-1 inline underline text-gray-500" size={16} />
                                                                    <span className='text-xs mr-2'>{item.publication_issue.date_published}</span>
                                                                    <User className="me-1 inline text-gray-500" size={16} />
                                                                    {item.authors.map((author: any, index: any) => (
                                                                        <span key={`author-${nanoid()}`} className={`badge overlay-trigger text-xs ${(item.authors.length == index + 1) && 'mr-2'}`}>
                                                                            {`${author.name}`}{(item.authors.length != index + 1) && <Dot size={16} className='inline text-gray-500 mx-0' />} {` `}
                                                                        </span>
                                                                    ))}
                                                                    {item && (
                                                                        <span className="badge cursor-pointer overlay-trigger underline mr-2 text-xs inline-block">
                                                                            <BookText className="me-1 inline text-gray-500" size={16} />
                                                                            <a href={item.publication_issue.periodical_url} target="_blank" rel="noopener noreferrer" className="underline text-xs inline mr-1">
                                                                                {item.publication_issue.periodical}
                                                                            </a>
                                                                            <Dot size={16} className='inline text-gray-500 mx-0' />
                                                                            <a href={item.publication_issue.publisher_url} target="_blank" rel="noopener noreferrer" className="underline text-xs inline mr-1">
                                                                                {item.publication_issue.publisher_name}
                                                                            </a>
                                                                        </span>
                                                                    )}
                                                                    <MousePointer2 size={16} className='inline mr-1 text-gray-500 transform scale-x-[-1]' />
                                                                    <a href={item.id} className={`text-shadow-custom text-blue-500 underline text-xs inline`}>{item.id}</a>
                                                                    <span className={`text-shadow-custom px-1.5 py-1 inline`}>
                                                                        <CopyIcon
                                                                            size={16}
                                                                            onClick={() => copyToClipboard(item.id)}
                                                                            className="h-4 w-4 cursor-pointer text-xs inline text-gray-500"
                                                                        />
                                                                    </span>
                                                                </h6>
                                                            </div>

                                                            {/* <div className="grid grid-cols-12">
                                                                <div className="col-span-12">
                                                                    <span className="badge me-2 text-xs">
                                                                        <Calendar className="me-1 inline underline text-xs" size={16} />
                                                                        {item.publication_issue.date_published}
                                                                    </span>
                                                                    {item.authors.map((author: any, index: any) => (
                                                                        <span key={`author-${nanoid()}`} className={`badge cursor-pointer overlay-trigger me-2 mb-2 underline text-xs`}>
                                                                            <User className="me-1 inline" size={16} />
                                                                            {`${author.name}`}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div> */}
                                                            <div className='my-4 text-sm'>
                                                                {item && <TruncatedAbstract text={item.abstract} />}
                                                            </div>
                                                            {/* <div className="grid grid-cols-12">
                                                                <div className="col-span-12">
                                                                    {item && (
                                                                        <span className="badge cursor-pointer overlay-trigger underline mr-2 text-xs">
                                                                            <BookOpenText className="me-1 inline text-gray-500" size={16} />
                                                                            {item.publication_issue.periodical}, {item.publication_issue.publisher_name}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div> */}
                                                        </div>
                                                    </div >
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
