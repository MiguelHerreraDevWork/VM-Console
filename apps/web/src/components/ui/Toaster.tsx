'use client';

import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  return (
    <Sonner
      theme="system"
      position="top-right"
      closeButton
      toastOptions={{
        classNames: {
          toast:
            'bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] shadow-[var(--shadow)]',
          description: 'text-[var(--muted)]',
          actionButton: 'bg-[var(--accent)] text-[var(--on-accent)]',
          cancelButton: 'bg-[var(--surface-2)] text-[var(--text)]',
        },
      }}
    />
  );
}
