import { describe, expect, it } from 'vitest';

import { safeNextPath } from './safe-next';

describe('safeNextPath', () => {
  it('acepta rutas internas', () => {
    expect(safeNextPath('/vms')).toBe('/vms');
    expect(safeNextPath('/vms/new?x=1')).toBe('/vms/new?x=1');
  });

  it('usa el fallback si no hay valor', () => {
    expect(safeNextPath(null)).toBe('/dashboard');
    expect(safeNextPath('')).toBe('/dashboard');
  });

  it.each([
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    '\\\\evil.example',
    '/\t/evil.example',
    'javascript:alert(1)',
  ])('rechaza redirecciones externas: %s', (value) => {
    expect(safeNextPath(value)).toBe('/dashboard');
  });
});
