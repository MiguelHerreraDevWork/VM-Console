export type Theme = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'vm-console-theme';

export function readStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    if (value === 'dark' || value === 'light') {
      return value;
    }
  } catch {
    // localStorage may be blocked
  }
  return null;
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

export function storeTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore
  }
}
