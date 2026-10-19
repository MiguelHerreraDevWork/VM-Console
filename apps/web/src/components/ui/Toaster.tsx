'use client';

import type { CSSProperties } from 'react';
import { Toaster as Sonner } from 'sonner';

import { useTheme } from '../../lib/theme';

export function Toaster() {
  // Sigue el tema de la app (data-theme), no el del sistema operativo.
  const theme = useTheme();

  return (
    <Sonner
      theme={theme}
      position="bottom-right"
      // En móvil, por encima de la navegación inferior fija (h-14 + zona segura).
      mobileOffset={{ bottom: 'calc(4.25rem + env(safe-area-inset-bottom))' }}
      closeButton
      // Sonner pinta con sus variables --normal-*; se mapean a los tokens del tema.
      style={
        {
          '--normal-bg': 'var(--surface)',
          '--normal-border': 'var(--border)',
          '--normal-text': 'var(--text)',
        } as CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            'bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] shadow-[var(--shadow-pop)] rounded-[var(--radius-md)]',
          description: 'text-[var(--muted)]',
          actionButton: '!bg-[var(--accent)] !text-[var(--on-accent)] !font-semibold',
          cancelButton: '!bg-[var(--surface-2)] !text-[var(--text)]',
          closeButton:
            '!bg-[var(--surface)] !text-[var(--muted)] !border-[var(--border)] hover:!text-[var(--text)]',
          success: '[&_[data-icon]]:text-[var(--success)]',
          error: '[&_[data-icon]]:text-[var(--danger)]',
          info: '[&_[data-icon]]:text-[var(--accent-2)]',
        },
      }}
    />
  );
}
