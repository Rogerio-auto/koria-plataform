import { useParams, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { BriefingForm } from '@/components/BriefingForm';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useBriefingForm } from '@/hooks/use-briefing-form';

export function BriefingPage() {
  const { leadId } = useParams<{ leadId: string }>();
  const { t } = useTranslation();

  if (!leadId) return <Navigate to="/404" replace />;

  return <BriefingPageContent leadId={leadId} />;
}

function BriefingPageContent({ leadId }: { leadId: string }) {
  const { t } = useTranslation();
  const { isLoadingConfig, configError, submitSuccess } = useBriefingForm(leadId);

  if (submitSuccess) return <Navigate to="/briefing/success" replace />;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-bold text-primary">KorIA</h1>
            <p className="text-xs text-muted-foreground">{t('briefing.subtitle')}</p>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto max-w-2xl px-4 py-6 sm:py-8">
        {isLoadingConfig ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : configError ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold text-destructive">
                {t(`briefing.errors.${configError}`)}
              </p>
            </div>
          </div>
        ) : (
          <BriefingForm leadId={leadId} />
        )}
      </main>
    </div>
  );
}
