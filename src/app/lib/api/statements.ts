import useSWR from 'swr';
import { REBORN_API_URL } from '../config/constants';
import { ORKGResponse } from '../types/statements';
import { ORKGResponseDTO } from '../dto/statements';

interface FetchStatementsParams {
    currentPage: number;
    pageSize: number;
}

interface FilterParams {
    page?: number;
    per_page?: number;
    startYear?: string | null;
    endYear?: string | null;
    title?: string | null;
    concepts?: string[];
    scientific_venues?: string[];
    research_fields?: string[];
    authors?: string[];
}

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error('Failed to fetch data');
    }
    const data = await res.json();
    return data;
};

export function useStatementsData(params: {
    hasFilters: boolean;
    filterParams?: FilterParams;
    defaultParams?: FetchStatementsParams;
}) {
    const { hasFilters, filterParams, defaultParams = { currentPage: 1, pageSize: 10 } } = params;

    // Always define the same hooks in the same order
    // const statementsResult = useSWR<ORKGResponse>(
    //     !hasFilters ? `${REBORN_API_URL}/query-data?currentPage=${defaultParams.currentPage}&pageSize=${defaultParams.pageSize}` : null,
    //     fetcher
    // );
    const statementsResult = {
        results: [],
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: 0,
    }

    const filterResult = useSWR<ORKGResponse>(
        hasFilters ? [`${REBORN_API_URL}/articles/advanced_search/`, filterParams] : null,
        async ([url, params]) => {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...filterParams,
                    timeRange: {
                        start: filterParams?.startYear,
                        end: filterParams?.endYear
                    }
                }),
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            return response.json();
        }
    );

    // Return the appropriate result based on which hook was actually used
    return {
        data: hasFilters ? filterResult.data : statementsResult,
        isLoading: hasFilters ? filterResult.isLoading : statementsResult,
        isError: hasFilters ? filterResult.error : statementsResult
    };
}

export function useStatements({ currentPage = 1, pageSize = 10 }: FetchStatementsParams) {
    const { data, error, isLoading } = useSWR<ORKGResponse>(
        `${REBORN_API_URL}/query-data?currentPage=${currentPage}&pageSize=${pageSize}`,
        fetcher
    );

    return {
        data,
        isLoading,
        isError: error
    };
}

export function useFilter({ page = 1, per_page = 10, startYear, endYear, title, concepts, scientific_venues, research_fields, authors }: any) {
    const { data, error, isLoading } = useSWR<ORKGResponse>(
        [`${REBORN_API_URL}/filter-statement`, {
            page,
            per_page,
            title,
            concepts,
            scientific_venues,
            research_fields,
            authors,
            timeRange: {
                start: startYear,
                end: endYear
            }
        }],
        async ([url, params]) => {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            return response.json();
        }
    );

    return {
        data,
        isLoading,
        isError: error
    };
}

interface Concept {
    id: number;
    name: number;
}
export function getConcepts() {
    const { data, error, isLoading } = useSWR<Concept[]>(
        `${REBORN_API_URL}/latest-concepts`,
        fetcher
    );
    return {
        data,
        isLoading,
        isError: error
    };
}

export function getStatements() {
    const { data, error, isLoading } = useSWR<ORKGResponse[]>(
        `${REBORN_API_URL}/statements`,
        fetcher
    );

    return {
        data,
        isLoading,
        isError: error
    };
}

export function getStatement(id: any) {
    const { data, error, isLoading } = useSWR<any>(
        // `${REBORN_API_URL}/articles/get_statement_by_id/?id=${id}`,
        `${REBORN_API_URL}/articles/get_article_statement/?id=${id}`,
        fetcher
    );

    return {
        data,
        isLoading,
        isError: error
    };
}

export function getPaper(id: any) {
    const { data, error, isLoading } = useSWR<any>(
        `${REBORN_API_URL}/articles/get_article/?id=${id}`,
        fetcher
    );

    return {
        data,
        isLoading,
        isError: error
    };
}