import { useQuery } from '@tanstack/react-query';
import { REBORN_API_URL } from '../lib/config/constants';

export const useResearchFields = (searchTerm: string) => {
  return useQuery({
    queryKey: ['research field', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 1) return [];
      const response = await fetch(`${REBORN_API_URL}/research_fields?label=${searchTerm}`);
      if (!response.ok) throw new Error('Failed to fetch research fields');
      return response.json();
    },
    enabled: searchTerm.length >= 1,
    staleTime: 5 * 60 * 1000,
  });
};