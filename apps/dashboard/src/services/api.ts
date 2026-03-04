/**
 * API client for the dashboard.
 * TODO: Implement with fetch/axios, JWT token interceptor.
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

async function authFetch(endpoint: string, options?: RequestInit) {
  // TODO: Add JWT token from auth store
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const dashboardApi = {
  // Auth
  login: (_email: string, _password: string) => authFetch('/auth/login', { method: 'POST' }),
  me: () => authFetch('/auth/me'),

  // Leads
  getLeads: (_params?: unknown) => authFetch('/leads'),
  getLead: (id: string) => authFetch(`/leads/${id}`),

  // Analytics
  getOverview: () => authFetch('/analytics/overview'),
  getFunnel: () => authFetch('/analytics/funnel'),
  getRevenue: (_params?: unknown) => authFetch('/analytics/revenue'),
  getAiCosts: (_params?: unknown) => authFetch('/analytics/ai-costs'),

  // Work Orders
  getWorkOrders: (_params?: unknown) => authFetch('/work-orders'),
  getWorkOrder: (id: string) => authFetch(`/work-orders/${id}`),

  // Payments
  getPayments: (_params?: unknown) => authFetch('/payments'),
  getPayment: (id: string) => authFetch(`/payments/${id}`),

  // Products
  getProducts: () => authFetch('/products'),
};
