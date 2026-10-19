import { describe, expect, it } from 'vitest';

import type { VmView } from '../types';
import {
  findIndexById,
  insertTemp,
  markPending,
  removeById,
  replaceById,
  restoreAt,
} from './cache';

const a: VmView = {
  id: '00000000-0000-4000-8000-000000000001',
  name: 'a',
  cores: 1,
  ram: 2,
  disk: 10,
  os: 'Ubuntu',
  status: 'ON',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const b: VmView = { ...a, id: '00000000-0000-4000-8000-000000000002', name: 'b' };
const c: VmView = { ...a, id: '00000000-0000-4000-8000-000000000003', name: 'c' };

describe('cache utils', () => {
  it('insertTemp prepends without mutating the original', () => {
    const list = [a, b];
    const temp = { ...c, id: 'temp-1', pending: 'create' as const };
    const next = insertTemp(list, temp);
    expect(next).toEqual([temp, a, b]);
    expect(list).toEqual([a, b]);
  });

  it('replaceById swaps one item immutably', () => {
    const list = [a, b];
    const updated = { ...b, name: 'b2', pending: 'update' as const };
    const next = replaceById(list, b.id, updated);
    expect(next[1]).toEqual(updated);
    expect(list[1]).toEqual(b);
  });

  it('removeById drops the match; unknown id is a no-op copy', () => {
    expect(removeById([a, b], a.id)).toEqual([b]);
    const list = [a];
    const next = removeById(list, 'missing');
    expect(next).toEqual([a]);
    expect(next).not.toBe(list);
  });

  it('restoreAt inserts at the original index', () => {
    expect(restoreAt([a, c], 1, b)).toEqual([a, b, c]);
    expect(restoreAt([], 0, a)).toEqual([a]);
    expect(restoreAt([a], 99, b)).toEqual([a, b]);
    expect(restoreAt([a], -1, b)).toEqual([b, a]);
  });

  it('markPending sets pending only on the target', () => {
    const next = markPending([a, b], a.id, 'delete');
    expect(next[0]?.pending).toBe('delete');
    expect(next[1]).toEqual(b);
  });

  it('findIndexById handles empty and missing', () => {
    expect(findIndexById([], a.id)).toBe(-1);
    expect(findIndexById([a, b], b.id)).toBe(1);
    expect(findIndexById([a], 'x')).toBe(-1);
  });
});
