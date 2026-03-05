import { useTranslation } from 'react-i18next';
import { FileQuestion } from 'lucide-react';

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <FileQuestion className="mx-auto h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">404</h2>
        <p className="text-muted-foreground">{t('briefing.errors.invalidLink')}</p>
      </div>
    </div>
  );
}
