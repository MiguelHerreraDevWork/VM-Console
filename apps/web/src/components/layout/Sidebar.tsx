'use client';

import { usePathname } from 'next/navigation';

import { BrandMark } from './BrandMark';
import { isNavActive, primaryNav } from './nav';
import { NavLink } from './NavLink';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] md:flex">
      <div className="flex h-16 items-center gap-3 border-b border-[var(--border)] px-5">
        <BrandMark />
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight">VM Console</p>
          <p className="text-xs text-[var(--muted)]">Inventario de VMs</p>
        </div>
      </div>
      <nav aria-label="Principal" className="flex flex-col gap-1 p-3">
        {primaryNav.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            active={isNavActive(pathname, item.href)}
            variant="sidebar"
          />
        ))}
      </nav>
    </aside>
  );
}
