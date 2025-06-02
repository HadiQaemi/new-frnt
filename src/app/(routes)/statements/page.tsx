'use client';
import { useEffect, useState } from 'react';
import ErrorState from '@/app/components/shared/Loading/ErrorState';
import LoadingState from '@/app/components/shared/Loading/LoadingState';
import StatementList from '@/app/components/statements/StatementList';
import { useFilter, useStatements } from '@/app/lib/api/statements';
import { helper } from '@/app/utils/helper';

interface QueryParams {
  startYear: string | null;
  endYear: string | null;
  title: string | null;
  authors: string[];
  journals: string[];
  research_fields: string[];
  concepts: string[];
}

export default function StatementsPage() {
  const [queryParams, setQueryParams] = useState<QueryParams>({
    startYear: null,
    endYear: null,
    title: null,
    authors: [],
    journals: [],
    research_fields: [],
    concepts: []
  });
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setQueryParams({
      startYear: searchParams.get('start_year'),
      endYear: searchParams.get('end_year'),
      title: searchParams.get('title'),
      authors: helper.getArrayFromURL('authors'),
      journals: helper.getArrayFromURL('journals'),
      research_fields: helper.getArrayFromURL('research_fields'),
      concepts: helper.getArrayFromURL('concepts')
    });
  }, []);

  const hasFilters = Boolean(
    queryParams.title ||
    queryParams.startYear ||
    queryParams.endYear ||
    queryParams.concepts?.length ||
    queryParams.journals?.length ||
    queryParams.research_fields?.length ||
    queryParams.authors?.length
  );

  const {
    data,
    isLoading,
    isError
  } = hasFilters
      ? useFilter({
        page: 1,
        per_page: 10,
        startYear: queryParams.startYear,
        endYear: queryParams.endYear,
        title: queryParams.title,
        concepts: queryParams.concepts,
        journals: queryParams.journals,
        research_fields: queryParams.research_fields,
        authors: queryParams.authors,
      })
      : useStatements({
        currentPage: 1,
        pageSize: 10,
      });

  return (
    <main className="w-full mx-auto p-4 bg-[#e9ebf2] pb-[50px] min-h-[calc(100vh-18.9rem)]">
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState />
      ) : !data ? (
        <div className="text-center py-8 text-gray-600">No statements found</div>
      ) : (
        <StatementList data={data.content} statements={undefined} />
      )}
    </main>
  );
}