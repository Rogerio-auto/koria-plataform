/**
 * API client for the dashboard.
 */
import { useAuthStore } from '@/stores/auth.store';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

async function authFetch<T = unknown>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = useAuthStore.getState().token;
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (res.status === 401) {
    useAuthStore.getState().logout();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `API error: ${res.status}`);
  }

  return res.json();
}

export const dashboardApi = {
  // Auth
  login: (email: string, password: string) =>
    authFetch<{ access_token: string; user: { id: string; email: string; fullName: string; role: string; tenantId: string } }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
    ),
  me: () => authFetch('/auth/me'),
  refresh: () => authFetch<{ access_token: string }>('/auth/refresh', { method: 'POST' }),
  validateInvite: (token: string) => authFetch(`/auth/invite/validate/${encodeURIComponent(token)}`),
  register: (data: { token: string; fullName: string; email?: string; password: string }) =>
    authFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  changePassword: (currentPassword: string, newPassword: string) =>
    authFetch('/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }),

  // Invites (admin/manager)
  createInvite: (data: { email?: string; role: string; expiresInHours?: number }) =>
    authFetch('/auth/invites', { method: 'POST', body: JSON.stringify(data) }),
  getInvites: () => authFetch('/auth/invites'),

  // Users (admin)
  getUsers: () => authFetch('/auth/users'),

  // Leads
  getLeads: (params?: { page?: number; limit?: number; search?: string; status?: string; pipelineId?: string; stageId?: string; sortBy?: string; sortOrder?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.search) qs.set('search', params.search);
    if (params?.status) qs.set('status', params.status);
    if (params?.pipelineId) qs.set('pipelineId', params.pipelineId);
    if (params?.stageId) qs.set('stageId', params.stageId);
    if (params?.sortBy) qs.set('sortBy', params.sortBy);
    if (params?.sortOrder) qs.set('sortOrder', params.sortOrder);
    return authFetch(`/leads?${qs}`);
  },
  getLead: (id: string) => authFetch(`/leads/${id}`),
  createLead: (data: { type?: string; displayName?: string; preferredLanguage?: string; countryCode?: string; contactPoints?: Array<{ channel: string; handle: string; isPrimary?: boolean }> }) =>
    authFetch('/leads', { method: 'POST', body: JSON.stringify(data) }),
  updateLead: (id: string, data: { type?: string; displayName?: string; status?: string; score?: number; vipLevel?: number }) =>
    authFetch(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteLead: (id: string) =>
    authFetch(`/leads/${id}`, { method: 'DELETE' }),
  moveLeadStage: (id: string, data: { pipelineId: string; stageId: string }) =>
    authFetch(`/leads/${id}/stage`, { method: 'POST', body: JSON.stringify(data) }),
  addLeadContact: (id: string, data: { channel: string; handle: string; isPrimary?: boolean }) =>
    authFetch(`/leads/${id}/contacts`, { method: 'POST', body: JSON.stringify(data) }),
  removeLeadContact: (leadId: string, contactId: string) =>
    authFetch(`/leads/${leadId}/contacts/${contactId}`, { method: 'DELETE' }),

  // Analytics
  getOverview: (startDate?: string, endDate?: string) => {
    const qs = new URLSearchParams();
    if (startDate) qs.set('startDate', startDate);
    if (endDate) qs.set('endDate', endDate);
    return authFetch(`/analytics/overview?${qs}`);
  },
  getFunnel: () => authFetch('/analytics/funnel'),
  getLeadsByPeriod: (startDate?: string, endDate?: string) => {
    const qs = new URLSearchParams();
    if (startDate) qs.set('startDate', startDate);
    if (endDate) qs.set('endDate', endDate);
    return authFetch(`/analytics/leads-by-period?${qs}`);
  },
  getRevenue: (startDate?: string, endDate?: string) => {
    const qs = new URLSearchParams();
    if (startDate) qs.set('startDate', startDate);
    if (endDate) qs.set('endDate', endDate);
    return authFetch(`/analytics/revenue?${qs}`);
  },
  getAiCosts: (startDate?: string, endDate?: string) => {
    const qs = new URLSearchParams();
    if (startDate) qs.set('startDate', startDate);
    if (endDate) qs.set('endDate', endDate);
    return authFetch(`/analytics/ai-costs?${qs}`);
  },
  getFollowupRate: () => authFetch('/analytics/followup-rate'),
  getErrors: (startDate?: string, endDate?: string) => {
    const qs = new URLSearchParams();
    if (startDate) qs.set('startDate', startDate);
    if (endDate) qs.set('endDate', endDate);
    return authFetch(`/analytics/errors?${qs}`);
  },
  getConversionRates: (startDate?: string, endDate?: string) => {
    const qs = new URLSearchParams();
    if (startDate) qs.set('startDate', startDate);
    if (endDate) qs.set('endDate', endDate);
    return authFetch(`/analytics/conversion-rates?${qs}`);
  },
  getAverageTicket: (startDate?: string, endDate?: string) => {
    const qs = new URLSearchParams();
    if (startDate) qs.set('startDate', startDate);
    if (endDate) qs.set('endDate', endDate);
    return authFetch(`/analytics/average-ticket?${qs}`);
  },
  getFunnelByPipeline: (pipelineId?: string) => {
    const qs = new URLSearchParams();
    if (pipelineId) qs.set('pipelineId', pipelineId);
    return authFetch(`/analytics/funnel-by-pipeline?${qs}`);
  },
  getLeadSources: (startDate?: string, endDate?: string) => {
    const qs = new URLSearchParams();
    if (startDate) qs.set('startDate', startDate);
    if (endDate) qs.set('endDate', endDate);
    return authFetch(`/analytics/lead-sources?${qs}`);
  },
  getChannelsDistribution: () => authFetch('/analytics/channels-distribution'),
  getQuoteFunnel: (startDate?: string, endDate?: string) => {
    const qs = new URLSearchParams();
    if (startDate) qs.set('startDate', startDate);
    if (endDate) qs.set('endDate', endDate);
    return authFetch(`/analytics/quote-funnel?${qs}`);
  },
  getWorkOrderStatus: () => authFetch('/analytics/work-order-status'),
  getBriefingCompletion: () => authFetch('/analytics/briefing-completion'),
  getRecentActivity: (limit?: number) => {
    const qs = new URLSearchParams();
    if (limit) qs.set('limit', String(limit));
    return authFetch(`/analytics/recent-activity?${qs}`);
  },
  getPipelinePerformance: (pipelineId: string) =>
    authFetch(`/analytics/pipeline-performance?pipelineId=${encodeURIComponent(pipelineId)}`),

  // Objections
  getObjectionsOverview: (startDate?: string, endDate?: string) => {
    const qs = new URLSearchParams();
    if (startDate) qs.set('startDate', startDate);
    if (endDate) qs.set('endDate', endDate);
    return authFetch(`/objections/overview?${qs}`);
  },
  getObjectionsByPeriod: (startDate?: string, endDate?: string) => {
    const qs = new URLSearchParams();
    if (startDate) qs.set('startDate', startDate);
    if (endDate) qs.set('endDate', endDate);
    return authFetch(`/objections/by-period?${qs}`);
  },
  getObjectionCategories: () => authFetch('/objections/categories'),
  getObjectionDrilldown: (category: string) => authFetch(`/objections/drilldown/${encodeURIComponent(category)}`),

  // Assistant
  chatAssistant: (message: string, conversationId?: string) =>
    authFetch<{ conversationId: string; reply: string; actions?: Array<{ type: string; description: string; success: boolean }> }>(
      '/assistant/chat',
      { method: 'POST', body: JSON.stringify({ message, conversationId }) },
    ),
  getConversations: () => authFetch('/assistant/conversations'),
  getConversation: (id: string) => authFetch(`/assistant/conversations/${id}`),

  // Work Orders
  getWorkOrders: (_params?: unknown) => authFetch('/work-orders'),
  getWorkOrder: (id: string) => authFetch(`/work-orders/${id}`),

  // Payments
  getPayments: (_params?: unknown) => authFetch('/payments'),
  getPayment: (id: string) => authFetch(`/payments/${id}`),

  // Products
  getProducts: (search?: string) => {
    const qs = new URLSearchParams();
    if (search) qs.set('search', search);
    return authFetch(`/products?${qs}`);
  },
  getProduct: (id: string) => authFetch(`/products/${id}`),
  createProduct: (data: { name: string; category?: string; defaultCurrency?: string; prices?: Array<{ currency: string; priceAmount: string; isDefault?: boolean }> }) =>
    authFetch('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: string, data: { name?: string; category?: string; defaultCurrency?: string }) =>
    authFetch(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProduct: (id: string) =>
    authFetch(`/products/${id}`, { method: 'DELETE' }),
  addProductPrice: (productId: string, data: { currency: string; priceAmount: string; isDefault?: boolean }) =>
    authFetch(`/products/${productId}/prices`, { method: 'POST', body: JSON.stringify(data) }),
  updateProductPrice: (productId: string, priceId: string, data: { currency?: string; priceAmount?: string; isDefault?: boolean }) =>
    authFetch(`/products/${productId}/prices/${priceId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProductPrice: (productId: string, priceId: string) =>
    authFetch(`/products/${productId}/prices/${priceId}`, { method: 'DELETE' }),

  // Pipelines & Stages
  getPipelines: () => authFetch('/pipelines'),
  getPipeline: (id: string) => authFetch(`/pipelines/${id}`),
  createPipeline: (data: { name: string }) =>
    authFetch('/pipelines', { method: 'POST', body: JSON.stringify(data) }),
  updatePipeline: (id: string, data: { name?: string }) =>
    authFetch(`/pipelines/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deletePipeline: (id: string) =>
    authFetch(`/pipelines/${id}`, { method: 'DELETE' }),
  createStage: (pipelineId: string, data: { name: string; code: string; position?: number; isTerminal?: boolean }) =>
    authFetch(`/pipelines/${pipelineId}/stages`, { method: 'POST', body: JSON.stringify(data) }),
  updateStage: (stageId: string, data: { name?: string; code?: string; position?: number; isTerminal?: boolean }) =>
    authFetch(`/pipelines/stages/${stageId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteStage: (stageId: string) =>
    authFetch(`/pipelines/stages/${stageId}`, { method: 'DELETE' }),
  reorderStages: (pipelineId: string, stages: Array<{ id: string; position: number }>) =>
    authFetch(`/pipelines/${pipelineId}/stages/reorder`, { method: 'POST', body: JSON.stringify({ stages }) }),

  // ClickUp Integration
  getClickupStatus: () => authFetch<{ connected: boolean }>('/clickup/status'),
  getClickupTeams: () => authFetch<{ teams: Array<{ id: string; name: string }> }>('/clickup/teams'),
  getClickupSpaces: (teamId: string) =>
    authFetch<{ spaces: Array<{ id: string; name: string; statuses: Array<{ status: string; type: string; color: string }> }> }>(`/clickup/teams/${teamId}/spaces`),
  getClickupLists: (spaceId: string) =>
    authFetch<{ lists: Array<{ id: string; name: string; statuses: Array<{ status: string; type: string; color: string }> }> }>(`/clickup/spaces/${spaceId}/lists`),
  getClickupSyncMappings: () => authFetch('/clickup/sync'),
  getClickupSyncMapping: (pipelineId: string) => authFetch(`/clickup/sync/${pipelineId}`),
  createClickupSync: (data: { pipelineId: string; clickupType: 'space' | 'list'; clickupEntityId: string; clickupTeamId: string }) =>
    authFetch('/clickup/sync', { method: 'POST', body: JSON.stringify(data) }),
  deleteClickupSync: (pipelineId: string) =>
    authFetch(`/clickup/sync/${pipelineId}`, { method: 'DELETE' }),
  clickupForcePush: (pipelineId: string) =>
    authFetch(`/clickup/sync/${pipelineId}/push`, { method: 'POST' }),
  clickupForcePull: (pipelineId: string) =>
    authFetch(`/clickup/sync/${pipelineId}/pull`, { method: 'POST' }),
};
