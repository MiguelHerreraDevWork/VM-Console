'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '../../lib/cn';
import { primaryNav } from './nav';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-[var(--border)] bg-[var(--surface)] md:flex md:flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-[var(--border)] px-5">
        <span
          aria-hidden
          className="flex size-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] font-semibold text-[var(--on-accent)]"
        >
          V
        </span>
        <div>
          <p className="text-sm font-semibold tracking-tight">VM Console</p>
          <p className="text-xs text-[var(--muted)]">Operaciones</p>
        </div>
      </div>
      <nav aria-label="Principal" className="flex flex-col gap-1 p-3">
        {primaryNav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex min-h-11 items-center gap-3 rounded-[var(--radius-md)] px-3 text-sm font-medium transition-colors',
                active
                  ? 'bg-[color-mix(in_srgb,var(--accent)_22%,transparent)] text-[var(--text)]'
                  : 'text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]',
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
