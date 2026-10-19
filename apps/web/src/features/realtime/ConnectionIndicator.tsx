'use client';

import { cn } from '../../lib/cn';
import { useRealtime } from './RealtimeProvider';

export function ConnectionIndicator() {
  const { status, statusLabel } = useRealtime();

  return (
    <p
      className={cn(
        'hidden items-center gap-1.5 text-xs sm:flex',
        status === 'live' && 'text-[var(--success)]',
        status === 'reconnecting' && 'text-[var(--warning)]',
        status === 'offline' && 'text-[var(--muted)]',
      )}
      title={statusLabel}
      aria-live="polite"
    >
      <span
        className={cn(
          'size-1.5 shrink-0 rounded-full',
          status === 'live' && 'bg-[var(--success)]',
          status === 'reconnecting' && 'bg-[var(--warning)]',
          status === 'offline' && 'bg-[var(--muted)]',
        )}
        aria-hidden
      />
      <span>{statusLabel}</span>
    </p>
  );
}
