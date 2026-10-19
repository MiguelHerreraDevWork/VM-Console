import { formatCount } from './lib/format';
import type { TopVm } from './lib/top-vms';
import { metricMeta, type Metric } from './metrics';

/**
 * Ranking de VMs encendidas por recurso asignado. Es una lista HTML (texto real, sin
 * alternativa oculta): rango, nombre, SO y valor con su unidad. La barra solo compara con
 * la primera del ranking; no representa uso, capacidad ni porcentaje y no se anima.
 */
export function TopVmsList({ items, metric }: { items: TopVm[]; metric: Metric }) {
  const meta = metricMeta[metric];
  const max = items[0]?.value ?? 0;

  return (
    <ol className="flex flex-col gap-3" aria-label={`VMs encendidas con más ${meta.rankingNoun}`}>
      {items.map((vm, index) => (
        <li
          key={vm.id}
          className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5"
        >
          <span aria-hidden className="text-sm font-semibold tabular-nums text-[var(--muted)]">
            {index + 1}
          </span>
          <span className="min-w-0">
            <span className="sr-only">{`Puesto ${index + 1}: `}</span>
            <span className="block truncate text-sm font-semibold text-[var(--text)]">
              {vm.name}
            </span>
            <span className="block truncate text-xs text-[var(--muted)]">{vm.os}</span>
          </span>
          <span className="text-right text-sm">
            <span className="font-semibold tabular-nums text-[var(--text)]">
              {formatCount(vm.value)}
            </span>{' '}
            <span className="text-[var(--muted)]">{meta.unitLong}</span>
          </span>
          <span
            aria-hidden
            className="col-start-2 col-end-4 h-1.5 overflow-hidden rounded-full bg-[var(--surface-2)]"
          >
            <span
              className="block h-full rounded-full bg-[var(--accent)]"
              style={{ width: max > 0 ? `${Math.max(4, (vm.value / max) * 100)}%` : '0%' }}
            />
          </span>
        </li>
      ))}
    </ol>
  );
}
