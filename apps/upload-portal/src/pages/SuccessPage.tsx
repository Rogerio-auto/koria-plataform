import { useState, useEffect } from 'react';
import { CheckCircle2, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { KoriaLogo } from '@/components/KoriaLogo';

interface SuccessPageProps {
  returnUrl: string | null;
}

export function SuccessPage({ returnUrl }: SuccessPageProps) {
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!returnUrl) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = returnUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [returnUrl]);

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

        {returnUrl && (
          <div className="mt-6 space-y-2 text-center">
            <p className="text-sm text-muted-foreground">
              Redirecionando em <span className="font-semibold text-primary">{countdown}s</span>...
            </p>
            <a
              href={returnUrl}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Voltar ao atendimento
            </a>
          </div>
        )}

        <div className="mt-12">
          <KoriaLogo size="sm" />
        </div>
      </div>
    </div>
  );
}
