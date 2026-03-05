import { useState, useCallback } from 'react';
import { uploadApi, type UploadedFile } from '@/services/api';
import { getFileCategory, ALL_ALLOWED_MIME_TYPES, MAX_FILE_SIZES } from '@koria/utils';

export interface FileWithPreview {
  file: File;
  preview?: string;
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface UseUploadOptions {
  token: string;
  onComplete?: () => void;
}

export function useUpload({ token, onComplete }: UseUploadOptions) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const addFiles = useCallback((newFiles: File[]) => {
    const validFiles: FileWithPreview[] = [];
    const errors: string[] = [];

    for (const file of newFiles) {
      // Validate MIME type
      if (!ALL_ALLOWED_MIME_TYPES.includes(file.type as any)) {
        errors.push(`${file.name}: formato não aceito`);
        continue;
      }

      // Validate file size
      const category = getFileCategory(file.type);
      const maxSize = category !== 'unknown'
        ? MAX_FILE_SIZES[category as keyof typeof MAX_FILE_SIZES]
        : MAX_FILE_SIZES.document;

      if (file.size > maxSize) {
        errors.push(`${file.name}: arquivo muito grande`);
        continue;
      }

      const fileWithPreview: FileWithPreview = {
        file,
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        status: 'pending' as const,
        preview: file.type.startsWith('image/')
          ? URL.createObjectURL(file)
          : undefined,
      };

      validFiles.push(fileWithPreview);
    }

    if (errors.length > 0) {
      setError(errors.join('\n'));
      setTimeout(() => setError(null), 5000);
    }

    setFiles((prev) => [...prev, ...validFiles]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const uploadAll = useCallback(async () => {
    if (files.length === 0 || isUploading) return;

    setIsUploading(true);
    setProgress(0);
    setError(null);

    // Mark all as uploading
    setFiles((prev) =>
      prev.map((f) => ({ ...f, status: 'uploading' as const }))
    );

    try {
      const rawFiles = files.map((f) => f.file);
      const result = await uploadApi.uploadFiles(token, rawFiles, setProgress);

      if (result.success) {
        setUploadedFiles(result.files);
        setFiles((prev) =>
          prev.map((f) => ({ ...f, status: 'success' as const }))
        );

        // Small delay then trigger complete
        setTimeout(() => {
          onComplete?.();
        }, 1500);
      } else {
        throw new Error(result.message || 'Upload falhou');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro no upload';
      setError(message);
      setFiles((prev) =>
        prev.map((f) => ({ ...f, status: 'error' as const, error: message }))
      );
    } finally {
      setIsUploading(false);
    }
  }, [files, isUploading, token, onComplete]);

  const clearError = useCallback(() => setError(null), []);

  return {
    files,
    uploadedFiles,
    isUploading,
    progress,
    error,
    addFiles,
    removeFile,
    uploadAll,
    clearError,
  };
}
