import { describe, expect, it } from 'vitest';

import { normalizeVmName, vmNameKey } from './vm-name.js';
import { vmInputSchema } from './vm.js';

const base = {
  cores: 2,
  ram: 4,
  disk: 20,
  os: 'Ubuntu' as const,
  status: 'ON' as const,
};

describe('normalizeVmName', () => {
  it('trims and collapses whitespace, keeps accents', () => {
    expect(normalizeVmName('  Ñandú   01 ')).toBe('Ñandú 01');
  });

  it('normalizes NFD José to NFC', () => {
    const nfd = 'Jose\u0301';
    expect(normalizeVmName(nfd)).toBe('José');
    expect(normalizeVmName(nfd)).toBe(normalizeVmName('José'));
  });
});

describe('vmNameKey', () => {
  it('is case-insensitive', () => {
    expect(vmNameKey('WEB-01')).toBe(vmNameKey('web-01'));
  });

  it('keeps accented characters distinct', () => {
    expect(vmNameKey('José')).not.toBe(vmNameKey('Jose'));
  });
});

describe('vmInputSchema limits', () => {
  it('rejects cores 0 and 65; accepts 1 and 64', () => {
    expect(vmInputSchema.safeParse({ ...base, name: 'vm-a', cores: 0 }).success).toBe(false);
    expect(vmInputSchema.safeParse({ ...base, name: 'vm-a', cores: 1 }).success).toBe(true);
    expect(vmInputSchema.safeParse({ ...base, name: 'vm-a', cores: 64 }).success).toBe(true);
    expect(vmInputSchema.safeParse({ ...base, name: 'vm-a', cores: 65 }).success).toBe(false);
  });

  it('rejects negative ram', () => {
    expect(vmInputSchema.safeParse({ ...base, name: 'vm-a', ram: -1 }).success).toBe(false);
  });

  it('rejects disk 9 and 4097; accepts 10 and 4096', () => {
    expect(vmInputSchema.safeParse({ ...base, name: 'vm-a', disk: 9 }).success).toBe(false);
    expect(vmInputSchema.safeParse({ ...base, name: 'vm-a', disk: 10 }).success).toBe(true);
    expect(vmInputSchema.safeParse({ ...base, name: 'vm-a', disk: 4096 }).success).toBe(true);
    expect(vmInputSchema.safeParse({ ...base, name: 'vm-a', disk: 4097 }).success).toBe(false);
  });

  it('enforces name length 3–50 after normalization', () => {
    expect(vmInputSchema.safeParse({ ...base, name: 'ab' }).success).toBe(false);
    expect(vmInputSchema.safeParse({ ...base, name: 'abc' }).success).toBe(true);
    expect(vmInputSchema.safeParse({ ...base, name: 'a'.repeat(50) }).success).toBe(true);
    expect(vmInputSchema.safeParse({ ...base, name: 'a'.repeat(51) }).success).toBe(false);
  });

  it('rejects invalid name characters', () => {
    expect(vmInputSchema.safeParse({ ...base, name: 'web_01' }).success).toBe(false);
    expect(vmInputSchema.safeParse({ ...base, name: 'web@01' }).success).toBe(false);
  });

  it('normalizes name before validating', () => {
    const parsed = vmInputSchema.parse({ ...base, name: '  Ñandú   01 ' });
    expect(parsed.name).toBe('Ñandú 01');
  });
});
