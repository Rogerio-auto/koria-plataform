import { FileText, Image, Film, X, Check, Loader2, AlertCircle } from 'lucide-react';
import { formatFileSize } from '@koria/utils';
import type { FileWithPreview } from '@/hooks/use-upload';

interface FileListProps {
  files: FileWithPreview[];
  onRemove: (id: string) => void;
  disabled?: boolean;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return <Image className="h-5 w-5 text-blue-400" />;
  if (mimeType.startsWith('video/')) return <Film className="h-5 w-5 text-purple-400" />;
  return <FileText className="h-5 w-5 text-orange-400" />;
}

function getStatusIcon(status: FileWithPreview['status']) {
  switch (status) {
    case 'uploading':
      return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
    case 'success':
      return <Check className="h-4 w-4 text-green-400" />;
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-400" />;
    default:
      return null;
  }
}

export function FileList({ files, onRemove, disabled }: FileListProps) {
  if (files.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-foreground">
        Arquivos selecionados ({files.length})
      </h3>

      <div className="space-y-1.5">
        {files.map((file) => (
          <div
            key={file.id}
            className={`
              flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors
              ${file.status === 'success'
                ? 'border-green-500/20 bg-green-500/5'
                : file.status === 'error'
                  ? 'border-red-500/20 bg-red-500/5'
                  : 'border-border bg-card'
              }
            `}
          >
            {/* Preview or icon */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
              {file.preview ? (
                <img
                  src={file.preview}
                  alt={file.name}
                  className="h-10 w-10 rounded-md object-cover"
                />
              ) : (
                getFileIcon(file.type)
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </p>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              {getStatusIcon(file.status)}

              {file.status === 'pending' && !disabled && (
                <button
                  onClick={() => onRemove(file.id)}
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
