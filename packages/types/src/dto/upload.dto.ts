/**
 * Resposta da validação de token de upload.
 */
export interface ValidateUploadTokenResponse {
  valid: boolean;
  workOrderId: string;
  leadName: string | null;
  productName: string | null;
  status: string;
  dueAt: string | null;
  externalTaskId: string | null;
}

/**
 * Metadados de um arquivo enviado.
 */
export interface UploadedFileDto {
  id: string;
  workOrderId: string;
  type: string;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  clickupAttachmentUrl: string | null;
  createdAt: string;
}

/**
 * Resposta após upload dos arquivos.
 */
export interface UploadFilesResponse {
  success: boolean;
  files: UploadedFileDto[];
  message: string;
}

/**
 * Payload enviado para o webhook do N8N (agente OCR).
 */
export interface N8nWebhookPayload {
  workOrderId: string;
  leadName: string | null;
  externalTaskId: string | null;
  files: Array<{
    fileName: string;
    mimeType: string;
    fileSize: number;
    url: string;
    base64?: string;
  }>;
  timestamp: string;
}
