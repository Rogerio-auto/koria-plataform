/**
 * Language switcher — pt-BR / en / es.
 * TODO: Implement with i18next changeLanguage.
 */
export function LanguageSwitcher() {
  return (
    <div className="flex gap-2">
      <button className="text-sm">PT</button>
      <button className="text-sm">EN</button>
      <button className="text-sm">ES</button>
    </div>
  );
}
