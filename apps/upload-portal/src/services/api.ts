const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

export interface WorkOrderInfo {
  valid: boolean;
  workOrderId: string;
  leadName: string | null;
  productName: string | null;
  status: string;
  dueAt: string | null;
  externalTaskId: string | null;
  channel: string | null;
  returnUrl: string | null;
}

export interface UploadedFile {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  clickupAttachmentUrl: string | null;
}

export interface UploadResponse {
  success: boolean;
  files: UploadedFile[];
  message: string;
}

export const uploadApi = {
  async validateToken(token: string): Promise<WorkOrderInfo> {
    const res = await fetch(`${API_BASE}/uploads/validate/${token}`);
    if (!res.ok) {
      throw new Error(`Validation failed: ${res.status}`);
    }
    return res.json();
  },

  async uploadFiles(
    token: string,
    files: File[],
    onProgress?: (progress: number) => void,
  ): Promise<UploadResponse> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('token', token);

    // XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Upload failed')));
      xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

      xhr.open('POST', `${API_BASE}/uploads/files`);
      xhr.send(formData);
    });
  },
};
