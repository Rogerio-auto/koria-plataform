import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { KoriaLogo } from '@/components/KoriaLogo';

export function SuccessPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>

        <h2 className="text-2xl font-bold text-foreground">
          {t('upload.success.title')}
        </h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {t('upload.success.message')}
        </p>

        <div className="mt-12">
          <KoriaLogo size="sm" />
        </div>
      </div>
    </div>
  );
}
