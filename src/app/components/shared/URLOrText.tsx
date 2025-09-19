import React, { useState } from 'react';
import { helper } from '@/app/utils/helper';
import { URLOrTextProps } from './types';
import { Search, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { REBORN_API_URL } from '@/app/lib/config/constants';

interface ApiResponse {
    data: Array<Record<string, any>>;
    columns: string[];
    row_count: number;
}

const URLOrText: React.FC<URLOrTextProps> = ({
    content,
    color,
    button = null,
    type = null,
    source = null,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [tableData, setTableData] = useState<ApiResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [question, setQuestion] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const openModal = async () => {
        setIsModalOpen(true);

        if (source && type === "source_url") {
            await fetchTableData("");
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTableData(null);
        setError(null);
        setQuestion('');
        setCurrentPage(1);
    };

    const handleSearch = async () => {
        setCurrentPage(1);
        await fetchTableData(question);
    };

    const fetchTableData = async (queryQuestion: string) => {
        if (!source) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${REBORN_API_URL}/nlsql/query-data/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    source: source,
                    question: queryQuestion
                }),
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const result: ApiResponse = await response.json();

            if (result.data && result.columns) {
                setTableData(result);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const renderTable = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading table data...</span>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex items-center justify-center py-8 text-red-600">
                    <AlertCircle className="h-6 w-6 mr-2" />
                    <span>Error: {error}</span>
                </div>
            );
        }

        if (!tableData || !tableData.data || !tableData.columns) {
            return (
                <div className="text-center py-8 text-gray-500">
                    No data available
                </div>
            );
        }

        // Pagination calculations
        const totalItems = tableData.data.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentData = tableData.data.slice(startIndex, endIndex);

        const goToPage = (page: number) => {
            setCurrentPage(page);
        };

        const goToPreviousPage = () => {
            if (currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
        };

        const goToNextPage = () => {
            if (currentPage < totalPages) {
                setCurrentPage(currentPage + 1);
            }
        };

        // Generate page numbers for pagination
        const getPageNumbers = () => {
            const pages = [];
            const maxVisiblePages = 5;

            let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

            if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            return pages;
        };

        return (
            <div className="flex flex-col h-full">
                <div className="flex-1 border border-gray-300 overflow-hidden bg-white">
                    <div className="overflow-auto max-h-96">
                        <table className="min-w-full border-collapse">
                            <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
                                <tr>
                                    {tableData.columns.map((column, index) => (
                                        <th
                                            key={index}
                                            className="border-b border-r border-gray-300 px-3 py-3 text-left font-semibold text-gray-900 text-sm bg-gray-50 min-w-[120px]"
                                        >
                                            <div className="truncate" title={column}>
                                                {column}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {currentData.map((row, rowIndex) => (
                                    <tr key={startIndex + rowIndex} className="hover:bg-gray-50 transition-colors">
                                        {tableData.columns.map((column, colIndex) => (
                                            <td
                                                key={`${startIndex + rowIndex}-${colIndex}`}
                                                className="border-b border-r border-gray-200 px-3 py-2 text-sm text-gray-700 align-top min-w-[120px] max-w-[200px]"
                                            >
                                                <div className="whitespace-pre-wrap break-words">
                                                    {row[column] !== null && row[column] !== undefined ?
                                                        String(row[column]) : ''
                                                    }
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {totalPages > 1 && (
                    <div className="mt-6 bg-white p-4">
                        <div className="flex items-center justify-center">
                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={goToPreviousPage}
                                    disabled={currentPage === 1}
                                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors mr-2"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </button>

                                {getPageNumbers().map((pageNumber) => (
                                    <button
                                        key={pageNumber}
                                        onClick={() => goToPage(pageNumber)}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${currentPage === pageNumber
                                            ? 'bg-red-400 text-white shadow-sm'
                                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {pageNumber}
                                    </button>
                                ))}

                                {totalPages > 5 && !getPageNumbers().includes(totalPages) && (
                                    <>
                                        <span className="px-2 text-gray-500">...</span>
                                        <button
                                            onClick={() => goToPage(totalPages)}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            {totalPages}
                                        </button>
                                    </>
                                )}

                                <button
                                    onClick={goToNextPage}
                                    disabled={currentPage === totalPages}
                                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors ml-2"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            {helper.validURL(content) ? (
                <div className="flex mb-2 w-full">
                    <div className="flex-grow text-left w-[85%]">
                        <a href={content} className="text-blue-600 hover:text-blue-800 inline-block" target="_blank" rel="noopener noreferrer">
                            {content}
                        </a>
                    </div>
                    {type === "source_url" && (
                        <div className="w-[15%] flex justify-end">
                            <button
                                onClick={openModal}
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                            >
                                <Search />
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex mb-2 w-full">
                    <div className="flex-grow text-left w-[85%] font-bold">
                        <div className="inline-block" dangerouslySetInnerHTML={{ __html: content.replace(/[\[\]']+/g, '') }} />
                        {type === "source_url" && (
                            <div className="inline">
                                <button
                                    onClick={openModal}
                                    className="px-3 py-1 text-gray-700 rounded text-sm"
                                >
                                    <Search size={16}/>
                                </button>
                            </div>
                        )}
                    </div>
                    {/* {type === "source_url" && (
                        <div className="w-[15%] flex justify-end">
                            <button
                                onClick={openModal}
                                className="px-3 py-1 text-gray-700 rounded text-sm"
                            >
                                <Search />
                            </button>
                        </div>
                    )} */}
                </div>
            )}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Ask your questions</h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-500 hover:text-gray-700 text-xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="mb-4">
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="Ask a question about the data..."
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={handleSearch}
                                    className="px-4 py-2 text-gray-700 flex items-center gap-2"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Search className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden">
                            {renderTable()}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default URLOrText;