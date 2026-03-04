/**
 * API client for the briefing form.
 * TODO: Implement HTTP calls to the API.
 */

export const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

export const briefingApi = {
  /** Get form configuration for a specific lead */
  async getFormConfig(_leadId: string) {
    // TODO: GET /briefing/:leadId
    return null;
  },

  /** Submit briefing form data */
  async submitBriefing(_data: unknown) {
    // TODO: POST /briefing/submit
    return null;
  },

  /** Upload logo file */
  async uploadLogo(_file: File) {
    // TODO: POST /briefing/upload-logo (multipart)
    return null;
  },
};
