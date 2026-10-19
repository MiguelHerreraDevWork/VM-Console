'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { UserMenu } from '../../features/auth/UserMenu';
import { ConnectionIndicator } from '../../features/realtime/ConnectionIndicator';
import { ThemeToggle } from '../theme/ThemeToggle';
import { BrandMark } from './BrandMark';
import { routeCrumbs } from './nav';
import { LinkPendingReporter } from './navigation-pending';

export function Topbar() {
  const pathname = usePathname();
  const crumbs = routeCrumbs(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)]/90 px-4 backdrop-blur-sm md:px-8">
      <BrandMark className="size-8 text-sm md:hidden" />
      <nav aria-label="Ruta" className="min-w-0 flex-1">
        <ol className="flex min-w-0 items-center gap-1.5 text-sm">
          {crumbs.map((crumb, index) => {
            const last = index === crumbs.length - 1;
            return (
              <li
                key={crumb.label}
                className={
                  last ? 'flex min-w-0 items-center gap-1.5' : 'flex shrink-0 items-center gap-1.5'
                }
              >
                {index > 0 ? (
                  <ChevronRight aria-hidden className="size-4 shrink-0 text-[var(--muted)]" />
                ) : null}
                <span className={last ? 'min-w-0 truncate' : undefined}>
                  {crumb.href && !last ? (
                    <Link
                      href={crumb.href}
                      className="rounded-[var(--radius-sm)] text-[var(--muted)] transition-colors hover:text-[var(--text)]"
                    >
                      {crumb.label}
                      <LinkPendingReporter href={crumb.href} />
                    </Link>
                  ) : (
                    <span
                      aria-current={last ? 'page' : undefined}
                      className="font-semibold text-[var(--text)]"
                    >
                      {crumb.label}
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <ConnectionIndicator />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
