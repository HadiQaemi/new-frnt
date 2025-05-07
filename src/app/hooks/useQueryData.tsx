import { useQuery } from '@tanstack/react-query';
import { REBORN_API_URL } from '../lib/config/constants';

interface TimeRange {
  start: number;
  end: number;
}

interface QueryParams {
  timeRange?: TimeRange;
  authors?: string[];
  journals?: string[];
  concepts?: string[];
}

const defaultParams: QueryParams = {
  timeRange: {
    start: 2000,
    end: 2025
  },
  authors: [],
  journals: [],
  concepts: []
};

const hasValues = (params?: QueryParams): any => {
  if (!params) return false;

  const hasAuthors = (params.authors?.length ?? 0) > 0;
  const hasJournals = (params.journals?.length ?? 0) > 0;
  const hasConcepts = (params.concepts?.length ?? 0) > 0;
  const hasCustomTimeRange = params.timeRange && (
    params.timeRange.start !== defaultParams.timeRange?.start ||
    params.timeRange.end !== defaultParams.timeRange?.end
  );

  return hasAuthors || hasJournals || hasConcepts || hasCustomTimeRange;
};

export const useQueryData = (queryParams?: QueryParams) => {
  const hasQueryValues = hasValues(queryParams);

  return useQuery({
    queryKey: ['filtered-statements', queryParams],
    queryFn: async () => {
      const response = await fetch(`${REBORN_API_URL}/filter-statement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(queryParams || defaultParams),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch filtered statements');
      }
      return response.json();
    },
    enabled: hasQueryValues,
    staleTime: 5 * 60 * 1000,
  });
};