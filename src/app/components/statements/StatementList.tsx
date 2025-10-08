'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import JsonTreeViewer from '../json/JsonTreeViewer';
import PaperInfo from '../paper/PaperInfo';
import { helper } from '@/app/utils/helper';
import { BookText, Calendar, CopyIcon, Dot, MousePointer2, User } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation'
import { REBORN_API_URL } from '@/app/lib/config/constants';
import { nanoid } from 'nanoid';
import { useToast } from '@/components/ui/use-toast'
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(isOpenSideSearch);
    const [articles, setArticles] = useState(Array.isArray(data) ? data : [data]);
    const [isLoading, setIsLoading] = useState(false);
    const [statementDetails, setStatementDetails] = useState<any>(null);


    const [headerHeight, setHeaderHeight] = useState(0);
    const [activeHeader, setActiveHeader] = useState(null);
    const headerRefs = useRef<(HTMLDivElement | null)[]>([]);

    const sideSearchFormRef = useRef<any>(null);


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
            const matchingStatement = statements.find((s: any) => s.statement_id === statementId);
            if (matchingStatement) {
                setOpenStatementId(statementId);
                setStatementDetails(matchingStatement);
            }
        }
    }, [statementId, statements]);

    useEffect(() => {
        if (headerRefs.current[0]) {
            setHeaderHeight(headerRefs.current[0].offsetHeight);
        }
    }, []);

    useEffect(() => {
        if (statementId) return; // URL controls the open one

        // find the first statement across your articles list
        const firstWithStatements = articles.find((a: any) => Array.isArray(a?.statements) && a.statements.length > 0);
        const first = firstWithStatements?.statements?.[0];

        if (!first) return;

        setOpenStatementId(first.statement_id);

        // prefetch its details
        (async () => {
            try {
                const res = await fetch(`${REBORN_API_URL}/articles/get_statement_by_id/?id=${first.statement_id}`);
                if (res.ok) setStatementDetails(await res.json());
            } catch (e) {
                console.error(e);
            }
        })();

        // scroll to it (refs are set after render)
        const el = statementRefs.current[first.statement_id];
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [articles, statementId]);


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

    const [openStatementId, setOpenStatementId] = useState<string | null>(statementId ?? null);
    const router = useRouter();
    const handleTreeViewerClick = async (itemId: string) => {
        if (openStatementId === itemId) return true;

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
        if (statementId) {
            if (itemId !== openStatementId) {
                setOpenStatementId(itemId);
                router.push(`/statement/${itemId}`);
            }
        }
    };
    return (
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <Card className='md:col-span-3 rounded-[10px] shadow-[0_0_8px_0_rgba(0,0,0,0.13)] overflow-hidden'>
                <CardContent className="relative p-0 space-y-4">
                    {articles.length === 0 ? (
                        <p className="text-gray-500 text-center">No results found</p>
                    ) : (
                        <>
                            {articles.map((item: any) => {
                                const article = item.article
                                return (
                                    <div className="bg-white p-0 rounded-[10px]" key={`article-${nanoid()}`}>
                                        <PaperInfo
                                            paper={article}
                                            key={`article-info-${nanoid()}`}
                                            onAuthorSelect={handleSelect('author')}
                                            onJournalSelect={handleSelect('journal')}
                                            onResearchFieldSelect={handleSelect('field')} />
                                        {item.statements && item.statements.map((statement: any, index: any) => {
                                            return (
                                                <div
                                                    key={`list-${index}`}
                                                    className='m-5'
                                                    ref={(el: HTMLDivElement | null) => {
                                                        if (statement['statement_id'] === statementId) {
                                                            statementRefs.current[statement['statement_id']] = el;
                                                        }
                                                    }}
                                                >
                                                    <JsonTreeViewer
                                                        handleTreeViewerClick={() => handleTreeViewerClick(statement.statement_id)}
                                                        // parentOpen={statement.statement_id === openStatementId && statement.data_type.length > 0}
                                                        parentOpen={statement.statement_id === openStatementId}
                                                        // parentOpen={statement.statement_id === statementId && statement.data_type.length > 0}
                                                        onAuthorSelect={handleSelect('author')}
                                                        onConceptSelect={handleSelect('concept')}
                                                        jsonData={statement}
                                                        article={article}
                                                        single={true}
                                                        statement={statement}
                                                        statementDetails={statement.statement_id === openStatementId ? statementDetails : null}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                )
                            })}
                        </>
                    )}
                </CardContent>
            </Card>
            {data.basises.length > 0 && (
                <div className={`max-h-[calc(100vh-2rem)] overflow-y-visible md:col-span-1 sticky top-5 sticky ${activeHeader !== null ? 'top-[calc(9rem)]' : 'top-[calc(5rem)]'} transition-[top] duration-300 ease-in-out ${isSidebarOpen ? '' : ''}`}>
                    <div className={`p-0 max-h-[85vh] text-[#353839] border-t-[5px] rounded-[10px] shadow-[0_0_8px_0_rgba(0,0,0,0.13)] overflow-hidden ${data.basises[0].publication_issue.type === "Article"
                        ? "border-[#087CA7]"
                        : (data.basises[0].publication_issue.type === "Chapter"
                            ? "border-[#FFB703]"
                            : "border-[#FF7538]")
                        }`} key={`article-${nanoid()}`}>
                        <div className='bg-[#FDF6EB] p-2 pl-4 text-[#353839] font-[700] text-sm'>
                            Source {data.basises[0].publication_issue.type}
                        </div>
                        {data.basises.map((item: any) => {
                            return (
                                <div key={`basis-${nanoid()}`} className='p-4 pt-2'>
                                    <div className="grid grid-cols-1">
                                        <h6 className="leading-tight mb-2 font-medium">
                                            {item.name}
                                        </h6>
                                        <h6 className="leading-tight mb-2 font-medium">
                                            <Calendar className="me-1 inline underline" size={16} />
                                            <span className='text-xs mr-2'>{item.publication_issue.date_published}</span>
                                            <User className="me-1 inline" size={16} />
                                            {item.authors.map((author: any, index: any) => (
                                                <span key={`author-${nanoid()}`} className={`badge overlay-trigger text-xs ${(item.authors.length == index + 1) && 'mr-2'}`}>
                                                    {`${author.name}`}{(item.authors.length != index + 1) && <Dot size={16} className='inline mx-0' />} {` `}
                                                </span>
                                            ))}
                                            {item && (
                                                <span className="badge cursor-pointer overlay-trigger underline mr-2 text-xs inline-block">
                                                    <BookText className="me-1 inline" size={16} />
                                                    <a href={item.publication_issue.periodical_url} target="_blank" rel="noopener noreferrer" className="underline text-xs inline mr-1">
                                                        {item.publication_issue.periodical}
                                                    </a>
                                                    {item.publication_issue.periodical_url && item.publication_issue.publisher_name && (
                                                        <Dot size={16} className='inline mx-0' />
                                                    )}
                                                    <a href={item.publication_issue.publisher_url} target="_blank" rel="noopener noreferrer" className="underline text-xs inline mr-1">
                                                        {item.publication_issue.publisher_name}
                                                    </a>
                                                </span>
                                            )}
                                            {helper.validURL(item.id) && (
                                                <>
                                                    <MousePointer2 size={16} className='inline mr-1 transform scale-x-[-1]' />
                                                    <a href={item.id} className={`text-shadow-custom text-blue-500 underline text-xs inline`}>{item.id}</a>
                                                    <span className={`text-shadow-custom px-1.5 py-1 inline`}>
                                                        <CopyIcon
                                                            size={16}
                                                            onClick={() => copyToClipboard(item.id)}
                                                            className="h-4 w-4 cursor-pointer text-xs inline"
                                                        />
                                                    </span>
                                                </>
                                            )}
                                        </h6>
                                    </div>

                                    <div className='my-4 max-h-[55vh] overflow-y-auto text-sm text-justify pr-2 pb-[30px] mb-[30px]'>
                                        {item && <TruncatedAbstract text={item.abstract} />}
                                    </div>

                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
