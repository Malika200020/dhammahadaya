import { useEffect, useState } from 'react';

const STORAGE_KEY = 'dhammahadaya-theme';

function getStoredTheme() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'dark' || v === 'light' ? v : null;
  } catch {
    return null;
  }
}

function prefersDark() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// Three-state theme: an explicit stored choice always wins; with none, the
// OS preference decides (styles/tokens.css's prefers-color-scheme block
// does that part in pure CSS — this hook only needs to track/apply an
// explicit override once the user picks one). index.html has a tiny
// inline script that applies any stored choice before first paint, so
// there's no flash of the wrong theme while this hook's effect runs.
export function useTheme() {
  const [explicitTheme, setExplicitTheme] = useState(getStoredTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (explicitTheme) {
      root.setAttribute('data-theme', explicitTheme);
    } else {
      root.removeAttribute('data-theme');
    }
  }, [explicitTheme]);

  function toggleTheme() {
    setExplicitTheme((current) => {
      const effectiveCurrent = current || (prefersDark() ? 'dark' : 'light');
      const next = effectiveCurrent === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // private-browsing / storage disabled — theme still applies for
        // this page load via React state, just won't persist.
      }
      return next;
    });
  }

  const resolvedTheme = explicitTheme || (prefersDark() ? 'dark' : 'light');

  return { theme: resolvedTheme, toggleTheme };
}
