import type { Vm } from '@repo/contracts';
import { Cpu, HardDrive, MemoryStick, type LucideIcon } from 'lucide-react';

import { formatCount } from '../dashboard/lib/format';

function Spec({
  icon: Icon,
  label,
  value,
  unit,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <dt className="flex items-center text-[var(--muted)]">
        <Icon aria-hidden className="size-4" />
        <span className="sr-only">{label}</span>
      </dt>
      <dd className="text-sm">
        <span className="font-semibold tabular-nums text-[var(--text)]">{formatCount(value)}</span>{' '}
        <span className="text-[var(--muted)]">{unit}</span>
      </dd>
    </div>
  );
}

export function VmSpecs({ vm }: { vm: Pick<Vm, 'cores' | 'ram' | 'disk'> }) {
  return (
    <dl className="flex flex-wrap gap-x-4 gap-y-1.5">
      <Spec icon={Cpu} label="vCPU" value={vm.cores} unit="vCPU" />
      <Spec icon={MemoryStick} label="RAM" value={vm.ram} unit="GB RAM" />
      <Spec icon={HardDrive} label="Disco" value={vm.disk} unit="GB disco" />
    </dl>
  );
}
