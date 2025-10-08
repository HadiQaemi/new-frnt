import { useState, useRef, useEffect } from 'react';
import { Fullscreen, Minimize } from 'lucide-react';
import { utils, writeFile } from 'xlsx-js-style';
import CustomPopover from '../shared/CustomPopover'
import { usePopoverManager } from '@/app/hooks/usePopoverManager'
import { helper } from '@/app/utils/helper';

interface Column {
    '@id': string;
    col_titles: string;
    number: number;
}

type Cell = {
    "@type": string;
    "@id": string;
    value: string;
    column: string;
}

interface Row {
    id?: string;
    number?: number;
    cells: Cell[];
    "@type"?: string;
    row_number?: number;
    row_titles?: string;
    "@id"?: string;
}

interface TableData {
    columns: Column[];
    rows: Row[];
}

interface JsonTableProps {
    data: TableData;
    styles?: React.CSSProperties;
    button?: string;
    color?: string;
    Components?: any;
}

const JsonTable: React.FC<JsonTableProps> = ({ data, styles, button, color, Components }) => {
    const columns = data?.columns?.sort((a, b) => a.number - b.number) || [];
    const rows = data?.rows?.sort((a, b) => {
        if (!a.number && !b.number) return 0;
        if (!a.number) return 1;
        if (!b.number) return -1;
        return a.number - b.number;
    }) || [];
    const rowTitles: any[] = rows.map(row => row.row_titles || '').filter(title => title.replace(/\d+/g, '').length > 0);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const tableContainerRef = useRef<HTMLDivElement>(null);

    const indexOfLastRow = currentPage * pageSize;
    const indexOfFirstRow = indexOfLastRow - pageSize;
    const currentRows = rows.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(rows.length / pageSize);
    const pageSizes = [5, 10, 20, 50];

    const handlePageChange = (pageNumber: number) => setCurrentPage(pageNumber);

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPageSize(Number(e.target.value));
        setCurrentPage(1);
    };

    const exportToExcel = () => {
        const wsData = rows.map((row: { cells: any[]; }) =>
            columns.reduce((acc: any, col: { [x: string]: any; col_titles: any; }) => {
                const cell = row.cells.find(c => c.column === col['@id']);
                return { ...acc, [col.col_titles]: cell?.value || '' };
            }, {})
        );
        const ws = utils.json_to_sheet(wsData);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Data");
        writeFile(wb, "table_data.xlsx");
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            tableContainerRef.current?.requestFullscreen();
        } else {
            document.exitFullscreen?.();
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const renderPaginationItems = () => {
        const items = [];

        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= currentPage - 2 && i <= currentPage + 2)
            ) {
                items.push(
                    <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`px-3 py-1 mx-1 rounded ${i === currentPage
                            ? 'bg-[#8fbbe3] text-white'
                            : 'bg-white text-[#8fbbe3] border border-[#8fbbe3] hover:bg-[#eef4ff]'
                            }`}
                    >
                        {i}
                    </button>
                );
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                items.push(
                    <span key={i} className="px-2">
                        ...
                    </span>
                );
            }
        }

        return items;
    };

    const { activePopover, containerRef, handlePopoverToggle } = usePopoverManager()

    return (
        <div
            ref={tableContainerRef}
            className={`w-full ${isFullscreen
                ? 'fixed inset-0 z-50 bg-white p-4'
                : 'pt-2'
                }`}
            style={styles}
        >
            {button && (
                <div className="text-right">
                    <span className="rounded" style={{ backgroundColor: color }}>
                        {button}
                    </span>
                </div>
            )}

            <div className="flex justify-between items-center mb-4">
                <select
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    className="p-2 border rounded"
                >
                    {pageSizes.map(size => (
                        <option key={size} value={size}>
                            Show {size}
                        </option>
                    ))}
                </select>

                <div className="space-x-2">
                    {/* <button
                        onClick={exportToExcel}
                        className="px-4 py-2 bg-red-400 text-white rounded hover:bg-red-500"
                    >
                        Export to Excel
                    </button> */}
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 border rounded hover:bg-gray-100"
                    >
                        {isFullscreen ? <Minimize size={16} /> : <Fullscreen size={16} />}
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[#353839] text-sm font-thin">
                    <thead>
                        <tr className="bg-gray-50">
                            {rowTitles?.length > 0 ? (
                                <th className="p-3 border text-left"></th>
                            ) : ''}
                            {columns.map((column: any) => (
                                <th key={column['@id']} className="p-3 border text-left">
                                    {helper.filterByStringMatch(Components, column.col_titles).length === 0 ? (
                                        column.col_titles
                                    ) : (
                                        <CustomPopover
                                            id={`popover-${column.col_titles}`}
                                            subTitle=""
                                            title={column.col_titles}
                                            show={activePopover === column.col_titles}
                                            onToggle={(show) => handlePopoverToggle(column.col_titles, show)}
                                            trigger={
                                                <span
                                                    className="cursor-pointer overlay-trigger mb-2 text-sm font-thin underline"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handlePopoverToggle(column.col_titles, activePopover !== column.col_titles)
                                                    }}
                                                >
                                                    {column.col_titles}
                                                </span>
                                            }
                                        >
                                            <div className="inline-block" dangerouslySetInnerHTML={{ __html: `<span class='block'>` + helper.renderIdentifiersComponentList(helper.filterByStringMatch(Components, column.col_titles)) + `</span>` }} />
                                        </CustomPopover>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {currentRows.map((row, rowIndex) => (
                            <tr
                                key={row.id || row.number || rowIndex}
                                className="hover:bg-gray-50"
                            >
                                {rowTitles?.length > 0 ? (
                                    <th className="p-3 border text-left">
                                        {helper.filterByStringMatch(Components, rowTitles[(currentPage - 1) * pageSize + rowIndex]).length === 0 ? (
                                            rowTitles[(currentPage - 1) * pageSize + rowIndex]
                                        ) : (
                                            <CustomPopover
                                                id={`popover-${rowTitles[(currentPage - 1) * pageSize + rowIndex]}`}
                                                subTitle=""
                                                title={rowTitles[(currentPage - 1) * pageSize + rowIndex]}
                                                show={activePopover === rowTitles[(currentPage - 1) * pageSize + rowIndex]}
                                                onToggle={(show) => handlePopoverToggle(rowTitles[(currentPage - 1) * pageSize + rowIndex], show)}
                                                trigger={
                                                    <span
                                                        className="cursor-pointer overlay-trigger mb-2 text-sm font-thin underline"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handlePopoverToggle(rowTitles[(currentPage - 1) * pageSize + rowIndex], activePopover !== rowTitles[(currentPage - 1) * pageSize + rowIndex])
                                                        }}
                                                    >
                                                        {rowTitles[(currentPage - 1) * pageSize + rowIndex]}
                                                    </span>
                                                }
                                            >
                                                <div className="inline-block" dangerouslySetInnerHTML={{ __html: `<span class='block'>` + helper.renderIdentifiersComponentList(helper.filterByStringMatch(Components, rowTitles[(currentPage - 1) * pageSize + rowIndex])) + `</span>` }} />
                                            </CustomPopover>
                                        )}
                                    </th>
                                ) : ''}
                                {columns.map((column) => {
                                    const cell = row.cells.find(
                                        (cell) => cell.column === column['@id']
                                    );
                                    return (
                                        <td
                                            key={`${row.id || row.number || rowIndex}-${column['@id']}`}
                                            className="p-3 border"
                                        >
                                            {cell?.value || ''}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-center items-center mt-4 space-x-2">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded border disabled:opacity-50"
                >
                    Previous
                </button>
                {renderPaginationItems()}
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded border disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div >
    );
};

export default JsonTable;
