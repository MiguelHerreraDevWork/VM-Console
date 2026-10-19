'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '../../lib/cn';
import { primaryNav } from './nav';

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Principal móvil"
      className="sticky bottom-0 z-40 flex border-t border-[var(--border)] bg-[var(--surface)] md:hidden"
    >
      {primaryNav.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
              active
                ? 'bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] text-[var(--text)]'
                : 'text-[var(--muted)]',
            )}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className="size-5" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
