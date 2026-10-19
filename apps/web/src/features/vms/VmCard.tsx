'use client';

import { cn } from '../../lib/cn';
import { RoleGate } from '../auth/RoleGate';
import { useVmHighlighted } from '../realtime/RealtimeProvider';
import { VmActions } from './VmActions';
import { VmSpecs } from './VmSpecs';
import { VmStatusBadge } from './VmStatusBadge';
import type { VmView } from './types';

export function VmCard({ vm }: { vm: VmView }) {
  const pending = Boolean(vm.pending);
  const highlighted = useVmHighlighted(vm.id);

  return (
    <article
      className={cn(
        'vm-surface flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow)]',
        pending && 'opacity-70',
        highlighted && 'vm-highlighted',
      )}
      aria-busy={pending || undefined}
      data-highlighted={highlighted || undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold tracking-tight">{vm.name}</h3>
          {pending ? (
            <p className="mt-0.5 text-xs text-[var(--muted)]">Guardando…</p>
          ) : null}
        </div>
        <VmStatusBadge status={vm.status} />
      </div>
      <VmSpecs vm={vm} />
      <RoleGate action="vm:edit">
        <div className="flex justify-end border-t border-[var(--border)] pt-3">
          <VmActions vm={vm} />
        </div>
      </RoleGate>
    </article>
  );
}
