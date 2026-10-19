'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

import { applyTheme, readStoredTheme, storeTheme, type Theme } from '../../lib/theme';
import { Button } from '../ui/Button';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    setTheme(readStoredTheme() ?? 'dark');
  }, []);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
    storeTheme(next);
  }

  const isDark = theme === 'dark';

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-pressed={isDark}
      aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      title={isDark ? 'Tema claro' : 'Tema oscuro'}
    >
      {isDark ? <Sun aria-hidden className="size-5" /> : <Moon aria-hidden className="size-5" />}
      <span className="sr-only">{isDark ? 'Oscuro' : 'Claro'}</span>
    </Button>
  );
}
