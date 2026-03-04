import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ALL_ALLOWED_MIME_TYPES } from '@koria/utils';

interface DropzoneProps {
  onDrop: (files: File[]) => void;
  disabled?: boolean;
}

export function Dropzone({ onDrop, disabled = false }: DropzoneProps) {
  const { t } = useTranslation();

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onDrop(acceptedFiles);
      }
    },
    [onDrop],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop: handleDrop,
    accept: ALL_ALLOWED_MIME_TYPES.reduce(
      (acc, type) => {
        acc[type] = [];
        return acc;
      },
      {} as Record<string, string[]>,
    ),
    disabled,
    maxFiles: 20,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        group relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center
        rounded-xl border-2 border-dashed p-8 transition-all duration-300
        ${isDragActive && !isDragReject
          ? 'border-primary bg-primary/5 scale-[1.01]'
          : isDragReject
            ? 'border-destructive bg-destructive/5'
            : 'border-border hover:border-primary/50 hover:bg-muted/30'
        }
        ${disabled ? 'cursor-not-allowed opacity-50' : ''}
      `}
    >
      <input {...getInputProps()} />

      <div className={`
        mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300
        ${isDragActive
          ? 'bg-primary/20 text-primary scale-110'
          : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
        }
      `}>
        {isDragActive ? (
          <FileUp className="h-8 w-8" />
        ) : (
          <Upload className="h-8 w-8" />
        )}
      </div>

      <p className="text-center text-base font-medium text-foreground">
        {isDragActive
          ? 'Solte os arquivos aqui...'
          : t('upload.dropzone.title')
        }
      </p>

      <p className="mt-1 text-center text-sm text-muted-foreground">
        {t('upload.dropzone.subtitle')}
      </p>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {['PDF', 'JPG', 'PNG', 'MP4', 'MOV'].map((ext) => (
          <span
            key={ext}
            className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
          >
            {ext}
          </span>
        ))}
      </div>

      <p className="mt-2 text-center text-xs text-muted-foreground/70">
        {t('upload.dropzone.maxSize')}
      </p>
    </div>
  );
}
