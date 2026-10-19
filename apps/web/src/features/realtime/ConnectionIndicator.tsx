'use client';

import { cn } from '../../lib/cn';
import { useRealtime } from './RealtimeProvider';

/** Estado del canal de tiempo real: punto + texto (en móvil, texto solo para lectores). */
export function ConnectionIndicator() {
  const { status, statusLabel } = useRealtime();

  return (
    <p
      role="status"
      title={statusLabel}
      className={cn(
        'flex min-h-11 items-center gap-1.5 px-2 text-xs font-medium',
        status === 'live' && 'text-[var(--success)]',
        status === 'reconnecting' && 'text-[var(--warning)]',
        status === 'offline' && 'text-[var(--muted)]',
      )}
    >
      <span className="relative flex size-2 shrink-0" aria-hidden>
        <span
          className={cn(
            'size-2 rounded-full',
            status === 'live' && 'bg-[var(--success)]',
            status === 'reconnecting' && 'bg-[var(--warning)]',
            status === 'offline' && 'bg-[var(--muted)]',
          )}
        />
      </span>
      <span className="sr-only sm:not-sr-only">{statusLabel}</span>
    </p>
  );
}
