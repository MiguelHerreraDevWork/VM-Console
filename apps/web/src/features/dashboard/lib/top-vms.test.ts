import type { Vm } from '@repo/contracts';
import { describe, expect, it } from 'vitest';

import { topVmsByMetric } from './top-vms';

let seq = 0;
function vm(partial: Partial<Vm> & Pick<Vm, 'name' | 'status'>): Vm & { pending?: string } {
  seq += 1;
  return {
    id: `00000000-0000-4000-8000-${String(seq).padStart(12, '0')}`,
    cores: 1,
    ram: 1,
    disk: 10,
    os: 'Ubuntu',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...partial,
  };
}

describe('topVmsByMetric', () => {
  const list = [
    vm({ name: 'a', status: 'ON', cores: 2, ram: 32, disk: 100 }),
    vm({ name: 'b', status: 'ON', cores: 8, ram: 4, disk: 40 }),
    vm({ name: 'apagada', status: 'OFF', cores: 64, ram: 512, disk: 4096 }),
    vm({ name: 'c', status: 'ON', cores: 8, ram: 16, disk: 500 }),
    vm({ name: 'd', status: 'ON', cores: 4, ram: 8, disk: 80 }),
    vm({ name: 'e', status: 'ON', cores: 1, ram: 2, disk: 20 }),
    vm({ name: 'f', status: 'ON', cores: 3, ram: 6, disk: 60 }),
  ];

  it('ordena por el recurso elegido y se queda con 5 VMs encendidas', () => {
    expect(topVmsByMetric(list, 'cores').map((v) => [v.name, v.value])).toEqual([
      ['b', 8],
      ['c', 8],
      ['d', 4],
      ['f', 3],
      ['a', 2],
    ]);
    expect(topVmsByMetric(list, 'ramGb')[0]).toMatchObject({ name: 'a', value: 32 });
    expect(topVmsByMetric(list, 'diskGb')[0]).toMatchObject({ name: 'c', value: 500 });
  });

  it('nunca incluye VMs apagadas ni con borrado pendiente', () => {
    const withPending = [
      ...list,
      { ...vm({ name: 'z', status: 'ON', cores: 32 }), pending: 'delete' },
    ];
    const names = topVmsByMetric(withPending, 'cores').map((v) => v.name);
    expect(names).not.toContain('apagada');
    expect(names).not.toContain('z');
  });

  it('devuelve menos de 5 si no hay suficientes encendidas', () => {
    expect(topVmsByMetric(list.slice(0, 2), 'cores')).toHaveLength(2);
    expect(topVmsByMetric([], 'cores')).toEqual([]);
  });
});
