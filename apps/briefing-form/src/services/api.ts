import type { SubmitBriefingDto, BriefingSubmitResponse, BriefingFormConfig } from '@koria/types';

export const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const briefingApi = {
  async getFormConfig(token: string): Promise<BriefingFormConfig> {
    return request<BriefingFormConfig>(`/briefing/${encodeURIComponent(token)}`);
  },

  async submitBriefing(data: SubmitBriefingDto): Promise<BriefingSubmitResponse> {
    return request<BriefingSubmitResponse>('/briefing/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async uploadLogo(file: File, token: string): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('token', token);
    const res = await fetch(`${API_BASE}/briefing/upload-logo`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.message || 'Upload failed');
    }
    return res.json();
  },
};
