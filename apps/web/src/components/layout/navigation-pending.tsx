'use client';

import { useLinkStatus } from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/** Último recurso: si una navegación nunca se confirma, no dejar el área principal cargando. */
const PENDING_SAFETY_MS = 20_000;

type NavigationPendingValue = {
  /** Ruta de destino de una navegación iniciada y aún sin confirmar. */
  pendingHref: string | null;
  report: (href: string, pending: boolean) => void;
};

const NavigationPendingContext = createContext<NavigationPendingValue | null>(null);

const pathOf = (href: string) => href.split('?')[0];

export function NavigationPendingProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const report = useCallback((href: string, pending: boolean) => {
    // Solo quien inició la espera puede darla por terminada.
    setPendingHref((current) => (pending ? href : current === href ? null : current));
  }, []);

  // La espera termina cuando la ruta de destino ya es la actual.
  useEffect(() => {
    if (pendingHref && pathOf(pendingHref) === pathname) {
      setPendingHref(null);
    }
  }, [pathname, pendingHref]);

  useEffect(() => {
    if (!pendingHref) {
      return;
    }
    const timer = setTimeout(() => setPendingHref(null), PENDING_SAFETY_MS);
    return () => clearTimeout(timer);
  }, [pendingHref]);

  const value = useMemo(() => ({ pendingHref, report }), [pendingHref, report]);
  return (
    <NavigationPendingContext.Provider value={value}>{children}</NavigationPendingContext.Provider>
  );
}

/** Destino pendiente, salvo que ya sea la ruta actual. */
export function useNavigationPending(): string | null {
  const pathname = usePathname();
  const pendingHref = useContext(NavigationPendingContext)?.pendingHref ?? null;
  return pendingHref && pathOf(pendingHref) !== pathname ? pendingHref : null;
}

/** Navegación programática (p. ej. tras guardar) con la misma señal de carga que un enlace. */
export function useNavigateWithPending() {
  const router = useRouter();
  const report = useContext(NavigationPendingContext)?.report;
  return useCallback(
    (href: string) => {
      report?.(href, true);
      router.push(href);
    },
    [report, router],
  );
}

/**
 * Hijo de un `<Link>`: informa al shell de que la navegación de ese enlace está pendiente
 * (`useLinkStatus`) para que el área principal muestre la carga de destino desde el clic.
 * No pinta nada: el enlace conserva su icono y su texto.
 */
export function LinkPendingReporter({ href }: { href: string }) {
  const { pending } = useLinkStatus();
  const report = useContext(NavigationPendingContext)?.report;

  useEffect(() => {
    if (report && pending) {
      report(href, true);
    }
  }, [href, pending, report]);

  return null;
}
