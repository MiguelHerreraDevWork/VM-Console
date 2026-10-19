'use client';

import { Moon, Sun } from 'lucide-react';

import { switchTheme, useTheme } from '../../lib/theme';
import { Button } from '../ui/Button';

export function ThemeToggle() {
  const theme = useTheme();
  const isDark = theme === 'dark';

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => switchTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      title={isDark ? 'Tema claro' : 'Tema oscuro'}
    >
      {isDark ? <Sun aria-hidden className="size-5" /> : <Moon aria-hidden className="size-5" />}
    </Button>
  );
}
