import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { LoginForm } from '../../features/auth/LoginForm';
import { fetchSessionUser } from '../../features/auth/session-server';
import { safeNextPath } from '../../lib/safe-next';

export const metadata: Metadata = {
  title: 'Iniciar sesión',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await fetchSessionUser();
  const params = await searchParams;
  if (user) {
    redirect(safeNextPath(params.next));
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--accent)_22%,transparent),transparent_55%),radial-gradient(ellipse_at_bottom_right,color-mix(in_srgb,var(--accent-2)_14%,transparent),transparent_45%)]"
      />
      <div className="relative w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)]">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] text-lg font-semibold text-[var(--on-accent)]">
            V
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">VM Console</h1>
            <p className="text-sm text-[var(--muted)]">Inicia sesión para continuar</p>
          </div>
        </div>
        <Suspense fallback={<p className="text-sm text-[var(--muted)]">Cargando formulario…</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
