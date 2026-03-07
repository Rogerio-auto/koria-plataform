/**
 * Objections DTOs — Analytics queries and responses.
 */
export interface ObjectionsOverview {
  totalObjections: number;
  overcomeRate: number;
  topCategories: Array<{
    slug: string;
    name: string;
    total: number;
    overcome: number;
    overcomeRate: number;
  }>;
}

export interface ObjectionsByPeriod {
  date: string;
  category: string;
  count: number;
}

export interface ObjectionDrilldown {
  category: string;
  categoryName: string;
  total: number;
  overcomeRate: number;
  objections: Array<{
    id: string;
    leadName: string | null;
    originalText: string;
    wasOvercome: boolean;
    detectedAt: string;
    suggestedResponse: string | null;
  }>;
}

export interface ObjectionsFilters {
  startDate?: string;
  endDate?: string;
  category?: string;
}
