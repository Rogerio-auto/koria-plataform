/**
 * Dashboard overview metrics.
 */
export interface DashboardOverview {
  totalLeads: number;
  activeLeads: number;
  totalWorkOrders: number;
  activeWorkOrders: number;
  totalRevenue: number;
  pendingPayments: number;
  totalAiCost: number;
  totalErrors: number;
}

/**
 * Lead funnel data for chart visualization.
 */
export interface FunnelStageData {
  stageCode: string;
  stageName: string;
  count: number;
  position: number;
}

/**
 * Revenue data point for time-series charts.
 */
export interface RevenueDataPoint {
  date: string;
  amount: number;
  currency: string;
  count: number;
}

/**
 * AI cost data point for monitoring.
 */
export interface AiCostDataPoint {
  date: string;
  agent: string;
  totalCost: number;
  totalRuns: number;
  totalTokens: number;
}

/**
 * Paginated response wrapper.
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Common filter params for analytics queries.
 */
export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  pipelineId?: string;
  stageCode?: string;
  status?: string;
}
