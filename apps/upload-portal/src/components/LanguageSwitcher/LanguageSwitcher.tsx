import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'pt-BR', label: 'PT' },
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className="flex items-center gap-1">
      <Globe className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`
            rounded px-1.5 py-0.5 text-xs font-medium transition-colors
            ${i18n.language === lang.code
              ? 'bg-primary/20 text-primary'
              : 'text-muted-foreground hover:text-foreground'
            }
          `}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
