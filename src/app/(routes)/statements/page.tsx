'use client';
import { useEffect, useState } from 'react';
import ErrorState from '@/app/components/shared/Loading/ErrorState';
import LoadingState from '@/app/components/shared/Loading/LoadingState';
import StatementList from '@/app/components/statements/StatementList';
import { useFilter, useStatements, useStatementsData } from '@/app/lib/api/statements';
import { helper } from '@/app/utils/helper';

interface QueryParams {
  startYear: string | null;
  endYear: string | null;
  title: string | null;
  authors: string[];
  scientific_venues: string[];
  research_fields: string[];
  concepts: string[];
}

export default function StatementsPage() {
  const [queryParams, setQueryParams] = useState<QueryParams>({
    startYear: null,
    endYear: null,
    title: null,
    authors: [],
    scientific_venues: [],
    research_fields: [],
    concepts: []
  });

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setQueryParams({
      startYear: searchParams.get('start_year'),
      endYear: searchParams.get('end_year'),
      title: searchParams.get('title'),
      authors: helper.getArrayFromURL('authors'),
      scientific_venues: helper.getArrayFromURL('scientific_venues'),
      research_fields: helper.getArrayFromURL('research_fields'),
      concepts: helper.getArrayFromURL('concepts')
    });
    setIsInitialized(true);
  }, []);

  const hasFilters = Boolean(
    queryParams.title ||
    queryParams.startYear ||
    queryParams.endYear ||
    queryParams.concepts?.length ||
    queryParams.scientific_venues?.length ||
    queryParams.research_fields?.length ||
    queryParams.authors?.length
  );
  const {
    data,
    isLoading,
    isError
  } = useStatementsData({
    hasFilters,
    filterParams: {
      page: 1,
      per_page: 10,
      startYear: queryParams.startYear,
      endYear: queryParams.endYear,
      title: queryParams.title || '',
      concepts: queryParams.concepts,
      scientific_venues: queryParams.scientific_venues,
      research_fields: queryParams.research_fields,
      authors: queryParams.authors,
    },
    defaultParams: {
      currentPage: 1,
      pageSize: 10,
    }
  });

  if (!isInitialized) {
    return (
      <main className="w-full mx-auto p-4 pb-[50px] min-h-[calc(100vh-18.9rem)] lg:px-12 xl:max-w-screen-xl 2xl:max-w-screen-2xl">
        <LoadingState />
      </main>
    );
  }

  return (
    <main className="w-full mx-auto p-4 pb-[50px] min-h-[calc(100vh-18.9rem)] lg:px-12 xl:max-w-screen-xl 2xl:max-w-screen-2xl">
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState />
      ) : !data ? (
        <div className="text-center py-8 text-gray-600">No statements found</div>
      ) : (
        <StatementList data={data?.results} statements={undefined} />
      )}
    </main>
  );
}