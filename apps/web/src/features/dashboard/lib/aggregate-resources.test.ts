import type { Vm } from '@repo/contracts';
import { describe, expect, it } from 'vitest';

import { aggregateResources } from './aggregate-resources';

function vm(partial: Partial<Vm> & Pick<Vm, 'name' | 'status' | 'cores' | 'ram' | 'disk' | 'os'>): Vm {
  return {
    id: partial.id ?? crypto.randomUUID(),
    createdAt: partial.createdAt ?? '2026-01-01T00:00:00.000Z',
    updatedAt: partial.updatedAt ?? '2026-01-01T00:00:00.000Z',
    ...partial,
  };
}

describe('aggregateResources', () => {
  it('lista vacía da ceros', () => {
    expect(aggregateResources([])).toEqual({
      on: 0,
      off: 0,
      total: 0,
      allocated: { cores: 0, ramGb: 0, diskGb: 0 },
      byOs: [],
    });
  });

  it('todas OFF da ceros de asignación', () => {
    const result = aggregateResources([
      vm({ name: 'a', status: 'OFF', cores: 4, ram: 8, disk: 100, os: 'Ubuntu' }),
      vm({ name: 'b', status: 'OFF', cores: 2, ram: 4, disk: 40, os: 'Debian' }),
    ]);
    expect(result).toMatchObject({
      on: 0,
      off: 2,
      total: 2,
      allocated: { cores: 0, ramGb: 0, diskGb: 0 },
      byOs: [],
    });
  });

  it('mezcla ON/OFF suma solo ON y agrupa por SO', () => {
    const result = aggregateResources([
      vm({ name: 'u1', status: 'ON', cores: 2, ram: 4, disk: 40, os: 'Ubuntu' }),
      vm({ name: 'u2', status: 'ON', cores: 4, ram: 8, disk: 80, os: 'Ubuntu' }),
      vm({ name: 'd1', status: 'ON', cores: 1, ram: 2, disk: 20, os: 'Debian' }),
      vm({ name: 'off', status: 'OFF', cores: 64, ram: 512, disk: 4096, os: 'Windows Server' }),
    ]);

    expect(result.on).toBe(3);
    expect(result.off).toBe(1);
    expect(result.total).toBe(4);
    expect(result.allocated).toEqual({ cores: 7, ramGb: 14, diskGb: 140 });
    expect(result.byOs).toEqual([
      { os: 'Debian', cores: 1, ramGb: 2, diskGb: 20 },
      { os: 'Ubuntu', cores: 6, ramGb: 12, diskGb: 120 },
    ]);
  });
});
