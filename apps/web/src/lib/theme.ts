'use client';

import { useSyncExternalStore } from 'react';

import { THEME_STORAGE_KEY } from './theme-key';

export type Theme = 'dark' | 'light';

export { THEME_STORAGE_KEY };

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

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

/** Tema aplicado en `<html data-theme>`; el script anti-FOUC lo fija antes del primer pintado. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, currentTheme, () => 'dark');
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => unknown;
};

/**
 * Cambia el tema con un crossfade breve (View Transitions) donde el navegador lo soporta.
 * Sin soporte o con `prefers-reduced-motion`, el cambio es inmediato.
 */
export function switchTheme(next: Theme) {
  const commit = () => {
    applyTheme(next);
    storeTheme(next);
  };
  const doc = document as ViewTransitionDocument;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!doc.startViewTransition || reduce) {
    commit();
    return;
  }
  doc.startViewTransition(commit);
}
