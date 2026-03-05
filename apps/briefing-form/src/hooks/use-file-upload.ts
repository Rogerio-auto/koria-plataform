import { useState, useCallback } from 'react';
import { briefingApi } from '@/services/api';
import { MAX_FILE_SIZES, ALLOWED_MIME_TYPES } from '@koria/utils';

const ALLOWED_LOGO_TYPES = [...ALLOWED_MIME_TYPES.image, 'image/svg+xml'] as string[];

interface UseFileUploadReturn {
  uploadFile: (file: File, token: string) => Promise<string | null>;
  uploadProgress: number;
  isUploading: boolean;
  error: string | null;
  preview: string | null;
  uploadedUrl: string | null;
  removeFile: () => void;
}

export function useFileUpload(): UseFileUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const removeFile = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setUploadedUrl(null);
    setError(null);
    setUploadProgress(0);
  }, [preview]);

  const uploadFile = useCallback(async (file: File, token: string): Promise<string | null> => {
    setError(null);

    if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
      setError('Formato não suportado. Use PNG, JPG, SVG ou WebP.');
      return null;
    }
    if (file.size > MAX_FILE_SIZES.logo) {
      setError('Arquivo muito grande. Máximo 5MB.');
      return null;
    }

    // Local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    setIsUploading(true);
    setUploadProgress(30);

    try {
      const result = await briefingApi.uploadLogo(file, token);
      setUploadProgress(100);
      setUploadedUrl(result.url);
      return result.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return { uploadFile, uploadProgress, isUploading, error, preview, uploadedUrl, removeFile };
}
