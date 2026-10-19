'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';

import { RoleGate } from '../../features/auth/RoleGate';
import { UserMenu } from '../../features/auth/UserMenu';
import { ConnectionIndicator } from '../../features/realtime/ConnectionIndicator';
import { ThemeToggle } from '../theme/ThemeToggle';
import { Button } from '../ui/Button';

export function Topbar({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 backdrop-blur-sm md:px-8">
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-[var(--muted)] md:hidden">VM Console</p>
        <h1 className="truncate text-lg font-semibold tracking-tight md:text-xl">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <ConnectionIndicator />
        <RoleGate action="vm:create">
          <Button asChild size="sm">
            <Link href="/vms/new">
              <Plus className="size-4" aria-hidden />
              Nueva VM
            </Link>
          </Button>
        </RoleGate>
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
