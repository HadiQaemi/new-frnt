import useSWR from 'swr';
import { REBORN_API_URL } from '../config/constants';
import { ORKGResponse } from '../types/statements';
import { ORKGResponseDTO } from '../dto/statements';

interface FetchStatementsParams {
    currentPage: number;
    pageSize: number;
}

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error('Failed to fetch data');
    }
    const data = await res.json();
    return data;
    return ORKGResponseDTO.parse(data);
};

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

export function useFilter({ page = 1, per_page = 10, startYear, endYear, title, concepts, journals, research_fields, authors }: any) {
    const { data, error, isLoading } = useSWR<ORKGResponse>(
        [`${REBORN_API_URL}/filter-statement`, {
            page,
            per_page,
            title,
            concepts,
            journals,
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