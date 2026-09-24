import { createContext, useContext, useMemo } from 'react';
import { useLanguage as useLanguageState } from '../hooks/useLanguage';
import { translations } from './translations';

const LanguageContext = createContext(null);

function format(template, vars) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) => (key in vars ? String(vars[key]) : match));
}

// Global language provider (client request, 2026-09) — wraps the whole app
// so every page reads the same current language and the same `t()`
// lookup, instead of each page keeping its own local EN/SI toggle (as
// About and Sponsorship used to). See useLanguage.js for persistence and
// translations.js for the dictionary + scope notes.
export function LanguageProvider({ children }) {
  const { language, setLanguage, toggleLanguage } = useLanguageState();

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t(key, vars) {
        const entry = translations[key];
        if (!entry) {
          console.warn(`Missing translation for key: ${key}`);
          return key;
        }
        const template = entry[language] ?? entry.en ?? key;
        return format(template, vars);
      },
    }),
    [language, setLanguage, toggleLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useTranslation must be used within a LanguageProvider');
  return ctx;
}
