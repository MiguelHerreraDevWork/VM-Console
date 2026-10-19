'use client';

import { usePathname } from 'next/navigation';

import { isNavActive, primaryNav } from './nav';
import { NavLink } from './NavLink';

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Principal móvil"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-[var(--border)] bg-[var(--surface)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden"
    >
      {primaryNav.map((item) => (
        <NavLink
          key={item.href}
          {...item}
          active={isNavActive(pathname, item.href)}
          variant="bottom"
        />
      ))}
    </nav>
  );
}
