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

  const aiCosts = useQuery({
    queryKey: ['analytics', 'ai-costs', startDate, endDate],
    queryFn: () => dashboardApi.getAiCosts(startDate, endDate),
  });

  const followupRate = useQuery({
    queryKey: ['analytics', 'followup-rate'],
    queryFn: () => dashboardApi.getFollowupRate(),
  });

  const errors = useQuery({
    queryKey: ['analytics', 'errors'],
    queryFn: () => dashboardApi.getErrors(),
  });

  const objectionsOverview = useQuery({
    queryKey: ['analytics', 'objections-overview', startDate, endDate],
    queryFn: () => dashboardApi.getObjectionsOverview(startDate, endDate),
  });

  const conversionRates = useQuery({
    queryKey: ['analytics', 'conversion-rates', startDate, endDate],
    queryFn: () => dashboardApi.getConversionRates(startDate, endDate),
  });

  const averageTicket = useQuery({
    queryKey: ['analytics', 'average-ticket', startDate, endDate],
    queryFn: () => dashboardApi.getAverageTicket(startDate, endDate),
  });

  const funnelByPipeline = useQuery({
    queryKey: ['analytics', 'funnel-by-pipeline'],
    queryFn: () => dashboardApi.getFunnelByPipeline(),
  });

  const leadSources = useQuery({
    queryKey: ['analytics', 'lead-sources', startDate, endDate],
    queryFn: () => dashboardApi.getLeadSources(startDate, endDate),
  });

  const channelsDistribution = useQuery({
    queryKey: ['analytics', 'channels-distribution'],
    queryFn: () => dashboardApi.getChannelsDistribution(),
  });

  const quoteFunnel = useQuery({
    queryKey: ['analytics', 'quote-funnel', startDate, endDate],
    queryFn: () => dashboardApi.getQuoteFunnel(startDate, endDate),
  });

  const workOrderStatus = useQuery({
    queryKey: ['analytics', 'work-order-status'],
    queryFn: () => dashboardApi.getWorkOrderStatus(),
  });

  const briefingCompletion = useQuery({
    queryKey: ['analytics', 'briefing-completion'],
    queryFn: () => dashboardApi.getBriefingCompletion(),
  });

  const recentActivity = useQuery({
    queryKey: ['analytics', 'recent-activity'],
    queryFn: () => dashboardApi.getRecentActivity(20),
  });

  return {
    overview, funnel, leadsByPeriod, revenue,
    aiCosts, followupRate, errors, objectionsOverview,
    conversionRates, averageTicket, funnelByPipeline, leadSources,
    channelsDistribution, quoteFunnel, workOrderStatus, briefingCompletion,
    recentActivity,
  };
}
