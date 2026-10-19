import type { Vm } from '@repo/contracts';

export function VmSpecs({
  vm,
  className,
}: {
  vm: Pick<Vm, 'cores' | 'ram' | 'disk' | 'os'>;
  className?: string;
}) {
  return (
    <dl className={className ?? 'flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--muted)]'}>
      <div>
        <dt className="sr-only">Sistema operativo</dt>
        <dd>{vm.os}</dd>
      </div>
      <div>
        <dt className="sr-only">vCPU</dt>
        <dd>
          <span className="font-mono text-[var(--text)]">{vm.cores}</span> vCPU
        </dd>
      </div>
      <div>
        <dt className="sr-only">RAM</dt>
        <dd>
          <span className="font-mono text-[var(--text)]">{vm.ram}</span> GB RAM
        </dd>
      </div>
      <div>
        <dt className="sr-only">Disco</dt>
        <dd>
          <span className="font-mono text-[var(--text)]">{vm.disk}</span> GB disco
        </dd>
      </div>
    </dl>
  );
}
