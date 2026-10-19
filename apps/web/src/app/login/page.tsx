import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { BrandMark } from '../../components/layout/BrandMark';
import { ThemeToggle } from '../../components/theme/ThemeToggle';
import { Skeleton } from '../../components/ui/Skeleton';
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
      <div aria-hidden className="bg-glow-page pointer-events-none absolute inset-0" />
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3">
          <BrandMark className="size-10 text-lg" />
          <div className="leading-tight">
            <p className="text-lg font-semibold tracking-tight">VM Console</p>
            <p className="text-sm text-[var(--muted)]">Inventario de máquinas virtuales</p>
          </div>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-pop)] sm:p-8">
          <h1 className="text-xl font-semibold tracking-tight">Iniciar sesión</h1>
          <p className="mb-6 mt-1 text-sm text-[var(--muted)]">
            Usa tu cuenta de Administrador o de Cliente.
          </p>
          <Suspense
            fallback={
              <div className="flex flex-col gap-5" aria-hidden>
                <Skeleton className="h-[4.5rem] w-full" />
                <Skeleton className="h-[4.5rem] w-full" />
                <Skeleton className="h-11 w-full" />
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
