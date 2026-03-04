import { useTranslation } from 'react-i18next';
import { Send } from 'lucide-react';
import { KoriaLogo } from '@/components/KoriaLogo';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { WorkOrderInfo } from '@/components/WorkOrderInfo';
import { Dropzone } from '@/components/Dropzone';
import { FileList } from '@/components/FileList';
import { ProgressBar } from '@/components/ProgressBar';
import { useUpload } from '@/hooks/use-upload';
import type { WorkOrderInfo as WorkOrderData } from '@/services/api';

interface UploadPageProps {
  token: string;
  workOrder: WorkOrderData;
  onComplete: () => void;
}

export function UploadPage({ token, workOrder, onComplete }: UploadPageProps) {
  const { t } = useTranslation();
  const {
    files,
    isUploading,
    progress,
    error,
    addFiles,
    removeFile,
    uploadAll,
    clearError,
  } = useUpload({ token, onComplete });

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
          <KoriaLogo size="sm" />
          <LanguageSwitcher />
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            {t('upload.title')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('upload.subtitle')}
          </p>
        </div>

        {/* Work Order Info */}
        <div className="mb-6">
          <WorkOrderInfo workOrder={workOrder} />
        </div>

        {/* Dropzone */}
        <div className="mb-6">
          <Dropzone onDrop={addFiles} disabled={isUploading} />
        </div>

        {/* Files list */}
        {files.length > 0 && (
          <div className="mb-6">
            <FileList
              files={files}
              onRemove={removeFile}
              disabled={isUploading}
            />
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
            <div className="flex items-start justify-between">
              <p className="text-sm text-red-400 whitespace-pre-line">{error}</p>
              <button
                onClick={clearError}
                className="ml-2 text-xs text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Upload progress */}
        {isUploading && (
          <div className="mb-6 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t('upload.actions.uploading')}</span>
              <span className="font-medium text-primary">{progress}%</span>
            </div>
            <ProgressBar progress={progress} className="h-2" />
          </div>
        )}

        {/* Upload button */}
        {files.length > 0 && !isUploading && (
          <button
            onClick={uploadAll}
            disabled={files.every((f) => f.status === 'success')}
            className="
              flex w-full items-center justify-center gap-2 rounded-xl bg-primary
              px-6 py-3.5 text-sm font-semibold text-primary-foreground
              transition-all duration-200
              hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20
              disabled:cursor-not-allowed disabled:opacity-50
              active:scale-[0.98]
            "
          >
            <Send className="h-4 w-4" />
            {t('upload.actions.upload')}
          </button>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground/50">
        KorIA Creative Studio © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
