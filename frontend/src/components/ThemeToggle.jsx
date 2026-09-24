import { Moon, Sun } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import './ThemeToggle.css';

export function ThemeToggle({ theme, toggleTheme }) {
  const { t } = useTranslation();
  const isDark = theme === 'dark';
  const label = isDark ? t('theme.switchToLight') : t('theme.switchToDark');
  return (
    <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={label} title={label}>
      {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
}
