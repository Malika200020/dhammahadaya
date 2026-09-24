import { useEffect, useState } from 'react';

const STORAGE_KEY = 'dhammahadaya-language';

function getStoredLanguage() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'en' || v === 'si' ? v : null;
  } catch {
    return null;
  }
}

// Global site language (client request, 2026-09: a single toggle in the
// menu bar that "applies consistently throughout the entire website and
// all subsequent navigation" — no mixed-language experience). Scope, per
// client confirmation: the site's own UI chrome (nav, buttons, headings,
// form labels) and the handful of pages that already carry both an English
// and a Sinhala version of their own text (About, Sponsorship note) — not
// admin-authored content (dictionary entries, Tripitaka catalogue rows,
// newsletter articles, PDF book listings), which was entered once, in
// whichever language, with no translated counterpart to switch to.
// Defaults to English, matching how the site's UI chrome (nav labels,
// button text) already reads today before this toggle existed.
export function useLanguage() {
  const [language, setLanguageState] = useState(() => getStoredLanguage() || 'en');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // private-browsing / storage disabled — language still applies for
      // this page load via React state, just won't persist.
    }
  }, [language]);

  function setLanguage(next) {
    setLanguageState(next);
  }

  function toggleLanguage() {
    setLanguageState((current) => (current === 'en' ? 'si' : 'en'));
  }

  return { language, setLanguage, toggleLanguage };
}
