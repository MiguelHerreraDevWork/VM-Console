'use client';

import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

import { cn } from '../../lib/cn';
import { LinkPendingReporter } from './navigation-pending';

/**
 * Enlace de navegación principal. El icono nunca se sustituye: la espera de la vista se
 * indica en el área principal (navegación pendiente, `loading.tsx` y carga de datos). `prefetch` completo para
 * que, cuando ya está precargada, la navegación sea inmediata y no haya espera que mostrar.
 */
export function NavLink({
  href,
  label,
  icon: Icon,
  active,
  variant,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  variant: 'sidebar' | 'bottom';
}) {
  return (
    <Link
      href={href}
      prefetch
      aria-current={active ? 'page' : undefined}
      className={cn(
        'transition-colors duration-150',
        variant === 'sidebar' &&
          'flex min-h-11 items-center gap-3 rounded-[var(--radius-md)] px-3 text-sm font-medium',
        variant === 'bottom' &&
          'flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-xs font-semibold',
        active
          ? variant === 'sidebar'
            ? 'bg-[var(--accent-soft)] text-[var(--text)] [&_svg]:text-[var(--accent-hover)]'
            : 'text-[var(--text)] [&_svg]:text-[var(--accent-hover)]'
          : 'text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]',
      )}
    >
      <Icon className="size-5 shrink-0" aria-hidden />
      {label}
      <LinkPendingReporter href={href} />
    </Link>
  );
}
