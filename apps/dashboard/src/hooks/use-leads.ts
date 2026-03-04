/**
 * Custom hook for leads data fetching.
 * TODO: Implement with TanStack Query — useQuery + useMutation.
 */

// import { useQuery } from '@tanstack/react-query';
// import { dashboardApi } from '@/services/api';

export function useLeads(_filters?: unknown) {
  // TODO: return useQuery({ queryKey: ['leads', filters], queryFn: ... })
  return { data: [], isLoading: false };
}
