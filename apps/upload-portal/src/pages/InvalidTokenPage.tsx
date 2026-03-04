import { ShieldX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { KoriaLogo } from '@/components/KoriaLogo';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function InvalidTokenPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-card/50">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
          <KoriaLogo size="sm" />
          <LanguageSwitcher />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
            <ShieldX className="h-10 w-10 text-red-400" />
          </div>

          <h2 className="text-2xl font-bold text-foreground">
            Link Inválido
          </h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            {t('upload.errors.invalidToken')}
          </p>
        </div>
      </main>
    </div>
  );
}
