/**
 * Objection entity — detected objections in conversations.
 */
export interface Objection {
  id: string;
  tenantId: string;
  leadId: string;
  conversationId: string | null;
  category: string;
  originalText: string;
  detectedAt: string;
  wasOvercome: boolean;
  overcomeAt: string | null;
  metadata: Record<string, unknown>;
}

export interface ObjectionWithLead extends Objection {
  leadName: string | null;
}

export interface ObjectionCategory {
  id: string;
  tenantId: string;
  slug: string;
  name: string;
  description: string | null;
  keywords: string[] | null;
  suggestedResponse: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
}

export interface ObjectionCategorySummary {
  slug: string;
  name: string;
  total: number;
  overcome: number;
  overcomeRate: number;
}
