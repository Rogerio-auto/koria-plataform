import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LogoUploadProps {
  preview: string | null;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  onDrop: (file: File) => void;
  onRemove: () => void;
}

export function LogoUpload({ preview, isUploading, uploadProgress, error, onDrop, onRemove }: LogoUploadProps) {
  const { t } = useTranslation();

  const handleDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) onDrop(accepted[0]);
    },
    [onDrop],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'image/png': [],
      'image/jpeg': [],
      'image/svg+xml': [],
      'image/webp': [],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    disabled: isUploading,
  });

  if (preview) {
    return (
      <div className="relative flex items-center gap-4 rounded-lg border border-border bg-card p-4">
        <img
          src={preview}
          alt="Logo preview"
          className="h-20 w-20 rounded-md object-contain bg-muted"
        />
        <div className="flex-1 min-w-0">
          {isUploading ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted">
                <div
                  className="h-1.5 rounded-full bg-primary transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-green-600 font-medium">
              {t('briefing.review.logoUploaded')} ✓
            </p>
          )}
        </div>
        {!isUploading && (
          <button
            type="button"
            onClick={onRemove}
            className="absolute right-2 top-2 rounded-full p-1 hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`flex min-h-[8rem] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : error
              ? 'border-destructive/50 bg-destructive/5'
              : 'border-border hover:border-primary/50 hover:bg-muted/50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className={`h-8 w-8 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
        <p className="text-sm text-muted-foreground">
          {t('briefing.visual.logoUpload')}
        </p>
        <p className="text-xs text-muted-foreground">
          {t('briefing.visual.logoFormats')}
        </p>
      </div>
      {error && <p className="mt-1.5 text-sm text-destructive">{error}</p>}
    </div>
  );
}
