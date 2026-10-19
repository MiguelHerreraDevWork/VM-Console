'use client';

import { cn } from '../../lib/cn';
import { RoleGate } from '../auth/RoleGate';
import { useVmHighlighted } from '../realtime/RealtimeProvider';
import { VmActions } from './VmActions';
import { pendingSurface, VmPendingNote } from './VmPendingNote';
import { VmSpecs } from './VmSpecs';
import { VmStatusBadge } from './VmStatusBadge';
import type { VmView } from './types';

export function VmCard({ vm }: { vm: VmView }) {
  const highlighted = useVmHighlighted(vm.id);
  const deleting = vm.pending === 'delete';

  return (
    <article
      className={cn(
        'vm-surface flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 hover:border-[var(--border-strong)]',
        pendingSurface(vm.pending),
        highlighted && 'vm-highlighted',
      )}
      aria-busy={vm.pending ? true : undefined}
      data-pending={vm.pending}
      data-highlighted={highlighted || undefined}
    >
      <header className="flex items-start justify-between gap-3">
        <div className={cn('min-w-0', deleting && 'opacity-60')}>
          <h3
            className={cn(
              'truncate text-base font-semibold tracking-tight',
              deleting && 'line-through decoration-[var(--danger)]',
            )}
          >
            {vm.name}
          </h3>
          <p className="mt-0.5 text-sm text-[var(--muted)]">{vm.os}</p>
        </div>
        <VmStatusBadge status={vm.status} />
      </header>
      <div className={cn(deleting && 'opacity-60')}>
        <VmSpecs vm={vm} />
      </div>
      {/* Solo ADMIN lanza mutaciones, así que el estado pendiente vive en su barra de acciones. */}
      <RoleGate action="vm:edit">
        <div className="-mx-1 -mb-1 flex min-h-11 items-center justify-between gap-2 border-t border-[var(--border)] pl-1 pt-2">
          <span>{vm.pending ? <VmPendingNote pending={vm.pending} name={vm.name} /> : null}</span>
          <VmActions vm={vm} />
        </div>
      </RoleGate>
    </article>
  );
}
