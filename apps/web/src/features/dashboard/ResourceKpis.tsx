import type { ResourceAggregate } from './lib/aggregate-resources';
import { formatCount } from './lib/format';

function KpiCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-tight tabular-nums text-[var(--text)]">
          {formatCount(value)}
        </span>
        <span className="text-sm font-medium text-[var(--muted)]">{unit}</span>
      </p>
      <p className="mt-2 text-xs text-[var(--muted)]">Asignados a VMs encendidas</p>
    </div>
  );
}

export function ResourceKpis({ aggregate }: { aggregate: ResourceAggregate }) {
  const { allocated, on, off, total } = aggregate;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="vCPU" value={allocated.cores} unit="vCPU" />
        <KpiCard label="RAM" value={allocated.ramGb} unit="GB RAM" />
        <KpiCard label="Disco" value={allocated.diskGb} unit="GB disco" />
      </div>
      <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--muted)]">
        <div className="flex gap-2">
          <dt>Encendidas</dt>
          <dd className="font-medium tabular-nums text-[var(--text)]">{formatCount(on)}</dd>
        </div>
        <div className="flex gap-2">
          <dt>Apagadas</dt>
          <dd className="font-medium tabular-nums text-[var(--text)]">{formatCount(off)}</dd>
        </div>
        <div className="flex gap-2">
          <dt>Total</dt>
          <dd className="font-medium tabular-nums text-[var(--text)]">{formatCount(total)}</dd>
        </div>
      </dl>
    </div>
  );
}
