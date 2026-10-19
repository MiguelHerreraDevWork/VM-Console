import Link from 'next/link';

import { Button } from '../components/ui/Button';

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-medium text-[var(--accent-2)]">404</p>
      <h1 className="text-2xl font-semibold">Página no encontrada</h1>
      <p className="max-w-md text-sm text-[var(--muted)]">
        La ruta no existe o ya no está disponible.
      </p>
      <Button asChild>
        <Link href="/dashboard">Ir al dashboard</Link>
      </Button>
    </main>
  );
}
