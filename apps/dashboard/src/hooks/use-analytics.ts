/**
 * Custom hook for analytics data.
 * TODO: Implement with TanStack Query.
 */
export function useAnalytics() {
  // TODO: Fetch overview, funnel, revenue, ai-costs
  return {
    overview: null,
    funnel: null,
    revenue: null,
    aiCosts: null,
    isLoading: false,
  };
}
