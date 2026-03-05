import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const LANGUAGES = [
  { code: 'pt-BR', label: 'Português' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
] as const;

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('koria-lang');
    if (saved) i18n.changeLanguage(saved);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function select(code: string) {
    i18n.changeLanguage(code);
    localStorage.setItem('koria-lang', code);
    setOpen(false);
  }

  const current = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-secondary transition-colors"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{current.label}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-36 rounded-md border border-border bg-card shadow-lg">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => select(lang.code)}
              className={`block w-full px-3 py-2 text-left text-sm hover:bg-secondary transition-colors ${
                lang.code === i18n.language ? 'font-semibold text-primary' : 'text-foreground'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
