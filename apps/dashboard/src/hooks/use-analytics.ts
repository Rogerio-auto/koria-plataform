import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/api';

export function useAnalytics(startDate?: string, endDate?: string) {
  const overview = useQuery({
    queryKey: ['analytics', 'overview', startDate, endDate],
    queryFn: () => dashboardApi.getOverview(startDate, endDate),
  });

  const funnel = useQuery({
    queryKey: ['analytics', 'funnel'],
    queryFn: () => dashboardApi.getFunnel(),
  });

  const leadsByPeriod = useQuery({
    queryKey: ['analytics', 'leads-by-period', startDate, endDate],
    queryFn: () => dashboardApi.getLeadsByPeriod(startDate, endDate),
  });

  const revenue = useQuery({
    queryKey: ['analytics', 'revenue', startDate, endDate],
    queryFn: () => dashboardApi.getRevenue(startDate, endDate),
  });

  return { overview, funnel, leadsByPeriod, revenue };
}
