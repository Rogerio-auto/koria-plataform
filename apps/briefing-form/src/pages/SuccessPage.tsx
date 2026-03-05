import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';

export function SuccessPage() {
  const { t } = useTranslation();

  const steps = [
    t('briefing.success.step1'),
    t('briefing.success.step2'),
    t('briefing.success.step3'),
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">{t('briefing.success.title')}</h1>
          <p className="text-muted-foreground">{t('briefing.success.message')}</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 text-left">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">
            {t('briefing.success.subtitle')}
          </h3>
          <ol className="space-y-3">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <span className="text-sm text-foreground pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
