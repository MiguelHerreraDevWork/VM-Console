import { describe, expect, it } from 'vitest';

import { toVmDto } from './mapper.js';

describe('toVmDto', () => {
  it('maps Prisma row to public VM without nameKey and with ISO dates', () => {
    const createdAt = new Date('2026-01-02T03:04:05.000Z');
    const updatedAt = new Date('2026-01-03T04:05:06.000Z');
    const dto = toVmDto({
      id: '11111111-1111-4111-8111-111111111111',
      name: 'web 01',
      nameKey: 'web 01',
      cores: 2,
      ram: 4,
      disk: 40,
      os: 'Ubuntu',
      status: 'ON',
      createdAt,
      updatedAt,
    });

    expect(dto).toEqual({
      id: '11111111-1111-4111-8111-111111111111',
      name: 'web 01',
      cores: 2,
      ram: 4,
      disk: 40,
      os: 'Ubuntu',
      status: 'ON',
      createdAt: '2026-01-02T03:04:05.000Z',
      updatedAt: '2026-01-03T04:05:06.000Z',
    });
    expect(dto).not.toHaveProperty('nameKey');
  });
});
