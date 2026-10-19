import { describe, expect, it } from 'vitest';

import type { VmView } from '../../vms/types';
import { decideVmUpdate } from './reconcile';

const base: VmView = {
  id: '00000000-0000-4000-8000-000000000001',
  name: 'web-01',
  cores: 2,
  ram: 4,
  disk: 40,
  os: 'Ubuntu',
  status: 'OFF',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('decideVmUpdate', () => {
  it('ignores when a local mutation is pending for that id', () => {
    const cache = [{ ...base, pending: 'update' as const }];
    const remote = { ...base, status: 'ON' as const, updatedAt: '2026-01-02T00:00:00.000Z' };
    expect(decideVmUpdate(cache, remote)).toBe('ignore');
  });

  it('ignores stale updatedAt', () => {
    const cache = [{ ...base, updatedAt: '2026-01-03T00:00:00.000Z' }];
    const remote = { ...base, status: 'ON' as const, updatedAt: '2026-01-02T00:00:00.000Z' };
    expect(decideVmUpdate(cache, remote)).toBe('ignore');
  });

  it('replaces when updatedAt is newer or equal', () => {
    const cache = [base];
    const newer = { ...base, status: 'ON' as const, updatedAt: '2026-01-02T00:00:00.000Z' };
    expect(decideVmUpdate(cache, newer)).toBe('replace');
    expect(decideVmUpdate(cache, { ...base, status: 'ON' as const })).toBe('replace');
  });

  it('invalidates when id is unknown (no phantom insert)', () => {
    const remote = {
      ...base,
      id: '00000000-0000-4000-8000-000000000099',
      status: 'ON' as const,
    };
    expect(decideVmUpdate([base], remote)).toBe('invalidate');
  });
});
