'use client';

import { RotateCw, TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

import { Button } from '../components/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--danger)_12%,var(--surface))] text-[var(--danger)]">
        <TriangleAlert aria-hidden className="size-6" />
      </span>
      <h1 className="text-2xl font-semibold">No se pudo mostrar esta vista</h1>
      <p className="max-w-md text-sm text-[var(--muted)]">
        Ocurrió un error inesperado. Puedes reintentar o volver al panel.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button type="button" onClick={reset}>
          <RotateCw aria-hidden className="size-4" />
          Reintentar
        </Button>
        <Button asChild variant="secondary">
          <Link href="/dashboard">Ir al panel</Link>
        </Button>
      </div>
    </main>
  );
}
