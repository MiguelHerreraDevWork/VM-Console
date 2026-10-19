import type { Vm, VmOs } from '@repo/contracts';

export type AllocatedResources = {
  cores: number;
  ramGb: number;
  diskGb: number;
};

export type OsAllocation = {
  os: VmOs | string;
  cores: number;
  ramGb: number;
  diskGb: number;
};

export type ResourceAggregate = {
  on: number;
  off: number;
  total: number;
  allocated: AllocatedResources;
  byOs: OsAllocation[];
};

export function aggregateResources(vms: readonly Vm[]): ResourceAggregate {
  let on = 0;
  let off = 0;
  const allocated: AllocatedResources = { cores: 0, ramGb: 0, diskGb: 0 };
  const byOsMap = new Map<string, OsAllocation>();

  for (const vm of vms) {
    if (vm.status === 'ON') {
      on += 1;
      allocated.cores += vm.cores;
      allocated.ramGb += vm.ram;
      allocated.diskGb += vm.disk;

      const current = byOsMap.get(vm.os) ?? {
        os: vm.os,
        cores: 0,
        ramGb: 0,
        diskGb: 0,
      };
      current.cores += vm.cores;
      current.ramGb += vm.ram;
      current.diskGb += vm.disk;
      byOsMap.set(vm.os, current);
    } else {
      off += 1;
    }
  }

  const byOs = [...byOsMap.values()].sort((a, b) => a.os.localeCompare(b.os, 'es'));

  return {
    on,
    off,
    total: vms.length,
    allocated,
    byOs,
  };
}
