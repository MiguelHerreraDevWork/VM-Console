'use client';

import { RotateCw, ServerCrash } from 'lucide-react';
import { useState } from 'react';

import { Button } from './Button';

export function ErrorState({
  title = 'Algo salió mal',
  description = 'No se pudo cargar la información.',
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => Promise<unknown> | void;
}) {
  const [retrying, setRetrying] = useState(false);

  async function retry() {
    if (!onRetry) {
      return;
    }
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  }

  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-[color-mix(in_srgb,var(--danger)_40%,var(--border))] bg-[var(--surface)] px-6 py-12 text-center"
    >
      <span className="mb-1 flex size-12 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--danger)_12%,var(--surface))] text-[var(--danger)]">
        <ServerCrash aria-hidden className="size-6" />
      </span>
      <h2 className="text-lg font-semibold text-[var(--text)]">{title}</h2>
      <p className="max-w-md text-sm text-[var(--muted)]">{description}</p>
      {onRetry ? (
        <Button
          type="button"
          variant="secondary"
          className="mt-2"
          loading={retrying}
          onClick={() => void retry()}
        >
          {retrying ? null : <RotateCw aria-hidden className="size-4" />}
          {retrying ? 'Reintentando…' : 'Reintentar'}
        </Button>
      ) : null}
    </div>
  );
}
