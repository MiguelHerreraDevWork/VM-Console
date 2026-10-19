'use client';

import { useRealtime } from './RealtimeProvider';

/** Polite live region for remote status changes. */
export function RealtimeAnnouncer() {
  const { announcement } = useRealtime();
  return (
    <div className="sr-only" aria-live="polite" aria-atomic="true">
      {announcement}
    </div>
  );
}
