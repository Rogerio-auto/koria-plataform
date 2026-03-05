import { useParams, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BriefingForm } from '@/components/BriefingForm';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function BriefingPage() {
  const { token } = useParams<{ token: string }>();

  if (!token) return <Navigate to="/404" replace />;

  return <BriefingPageContent token={token} />;
}

function BriefingPageContent({ token }: { token: string }) {
  const { t } = useTranslation();

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
        <BriefingForm token={token} />
      </main>
    </div>
  );
}
