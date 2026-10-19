import {
  apiErrorSchema,
  vmListResponseSchema,
  vmSchema,
  type Vm,
} from '@repo/contracts';
import { beforeEach, describe, expect, it } from 'vitest';

import { buildApp } from '../src/app.js';
import { cookieFromResponse, createUser, resetAuthFixtures } from '../src/test/helpers.js';

const ADMIN = {
  email: 'admin-vms@demo.local',
  password: 'AdminTest!234',
  role: 'ADMIN' as const,
};
const CLIENT = {
  email: 'client-vms@demo.local',
  password: 'ClientTest!234',
  role: 'CLIENT' as const,
};

const origin = () => process.env.WEB_ORIGIN ?? 'http://localhost:3000';

const baseVm = {
  name: 'lab-alpha',
  cores: 2,
  ram: 4,
  disk: 40,
  os: 'Ubuntu' as const,
  status: 'ON' as const,
};

describe('VMs API', () => {
  beforeEach(async () => {
    await resetAuthFixtures();
    await createUser(ADMIN);
    await createUser(CLIENT);
  });

  async function withApp<T>(run: (app: Awaited<ReturnType<typeof buildApp>>) => Promise<T>) {
    const app = await buildApp();
    try {
      return await run(app);
    } finally {
      await app.close();
    }
  }

  async function login(
    app: Awaited<ReturnType<typeof buildApp>>,
    email: string,
    password: string,
  ) {
    const res = await app.inject({
      method: 'POST',
      url: '/login',
      headers: { origin: origin() },
      payload: { email, password },
    });
    expect(res.statusCode).toBe(200);
    const cookie = cookieFromResponse(res.headers['set-cookie']);
    expect(cookie).toBeTruthy();
    return cookie!;
  }

  function authHeaders(cookie: string, extra?: Record<string, string>) {
    return { cookie, origin: origin(), ...extra };
  }

  it('permission matrix for GET/POST/PUT/DELETE', async () => {
    await withApp(async (app) => {
      const adminCookie = await login(app, ADMIN.email, ADMIN.password);
      const clientCookie = await login(app, CLIENT.email, CLIENT.password);

      const created = await app.inject({
        method: 'POST',
        url: '/vms',
        headers: authHeaders(adminCookie),
        payload: baseVm,
      });
      expect(created.statusCode).toBe(201);
      const vm = vmSchema.parse(created.json());

      // GET
      expect((await app.inject({ method: 'GET', url: '/vms' })).statusCode).toBe(401);
      expect(
        (await app.inject({ method: 'GET', url: '/vms', headers: { cookie: clientCookie } }))
          .statusCode,
      ).toBe(200);
      expect(
        (await app.inject({ method: 'GET', url: '/vms', headers: { cookie: adminCookie } }))
          .statusCode,
      ).toBe(200);

      // POST
      expect(
        (
          await app.inject({
            method: 'POST',
            url: '/vms',
            headers: { origin: origin() },
            payload: { ...baseVm, name: 'other-1' },
          })
        ).statusCode,
      ).toBe(401);
      expect(
        (
          await app.inject({
            method: 'POST',
            url: '/vms',
            headers: authHeaders(clientCookie),
            payload: { ...baseVm, name: 'x', cores: 0 },
          })
        ).statusCode,
      ).toBe(403);
      expect(
        (
          await app.inject({
            method: 'POST',
            url: '/vms',
            headers: authHeaders(adminCookie),
            payload: { ...baseVm, name: 'lab-beta' },
          })
        ).statusCode,
      ).toBe(201);

      // PUT
      const putBody = { ...baseVm, name: 'lab-alpha', cores: 4 };
      expect(
        (
          await app.inject({
            method: 'PUT',
            url: `/vms/${vm.id}`,
            headers: { origin: origin() },
            payload: putBody,
          })
        ).statusCode,
      ).toBe(401);
      expect(
        (
          await app.inject({
            method: 'PUT',
            url: `/vms/${vm.id}`,
            headers: authHeaders(clientCookie),
            payload: { ...putBody, cores: 0 },
          })
        ).statusCode,
      ).toBe(403);
      expect(
        (
          await app.inject({
            method: 'PUT',
            url: `/vms/${vm.id}`,
            headers: authHeaders(adminCookie),
            payload: putBody,
          })
        ).statusCode,
      ).toBe(200);

      // DELETE
      expect(
        (
          await app.inject({
            method: 'DELETE',
            url: `/vms/${vm.id}`,
            headers: { origin: origin() },
          })
        ).statusCode,
      ).toBe(401);
      expect(
        (
          await app.inject({
            method: 'DELETE',
            url: `/vms/${vm.id}`,
            headers: authHeaders(clientCookie),
          })
        ).statusCode,
      ).toBe(403);
      expect(
        (
          await app.inject({
            method: 'DELETE',
            url: `/vms/${vm.id}`,
            headers: authHeaders(adminCookie),
          })
        ).statusCode,
      ).toBe(204);
    });
  });

  it('lists by createdAt desc and serializes with vmSchema', async () => {
    await withApp(async (app) => {
      const adminCookie = await login(app, ADMIN.email, ADMIN.password);
      await app.inject({
        method: 'POST',
        url: '/vms',
        headers: authHeaders(adminCookie),
        payload: { ...baseVm, name: 'first-vm' },
      });
      await app.inject({
        method: 'POST',
        url: '/vms',
        headers: authHeaders(adminCookie),
        payload: { ...baseVm, name: 'second-vm' },
      });

      const list = await app.inject({
        method: 'GET',
        url: '/vms',
        headers: { cookie: adminCookie },
      });
      expect(list.statusCode).toBe(200);
      const body = vmListResponseSchema.parse(list.json());
      expect(body.items.map((v) => v.name)).toEqual(['second-vm', 'first-vm']);
      for (const item of body.items) {
        expect(item).not.toHaveProperty('nameKey');
      }
    });
  });

  it('normalizes names and rejects invalid fields', async () => {
    await withApp(async (app) => {
      const adminCookie = await login(app, ADMIN.email, ADMIN.password);

      const normalized = await app.inject({
        method: 'POST',
        url: '/vms',
        headers: authHeaders(adminCookie),
        payload: { ...baseVm, name: '  web   01 ' },
      });
      expect(normalized.statusCode).toBe(201);
      expect(vmSchema.parse(normalized.json()).name).toBe('web 01');

      const cases: Array<{ payload: Record<string, unknown>; label: string }> = [
        { label: 'cores 0', payload: { ...baseVm, name: 'n1', cores: 0 } },
        { label: 'cores 65', payload: { ...baseVm, name: 'n2', cores: 65 } },
        { label: 'cores 1.5', payload: { ...baseVm, name: 'n3', cores: 1.5 } },
        { label: 'cores string', payload: { ...baseVm, name: 'n4', cores: '4' } },
        { label: 'ram -1', payload: { ...baseVm, name: 'n5', ram: -1 } },
        { label: 'disk 9', payload: { ...baseVm, name: 'n6', disk: 9 } },
        { label: 'name short', payload: { ...baseVm, name: 'ab' } },
        { label: 'name long', payload: { ...baseVm, name: 'a'.repeat(51) } },
        { label: 'name underscore', payload: { ...baseVm, name: 'vm_01' } },
        { label: 'name at', payload: { ...baseVm, name: 'vm@01' } },
        { label: 'os bad', payload: { ...baseVm, name: 'n7', os: 'Arch' } },
        { label: 'status bad', payload: { ...baseVm, name: 'n8', status: 'RUNNING' } },
        { label: 'extra field', payload: { ...baseVm, name: 'n9', extra: true } },
      ];

      for (const c of cases) {
        const res = await app.inject({
          method: 'POST',
          url: '/vms',
          headers: authHeaders(adminCookie),
          payload: c.payload,
        });
        expect(res.statusCode, c.label).toBe(400);
        expect(apiErrorSchema.parse(res.json()).error.code, c.label).toBe('VALIDATION_ERROR');
      }

      const accent = await app.inject({
        method: 'POST',
        url: '/vms',
        headers: authHeaders(adminCookie),
        payload: { ...baseVm, name: 'Ñandú 01' },
      });
      expect(accent.statusCode).toBe(201);
    });
  });

  it('enforces name uniqueness via nameKey and allows accent distinctions', async () => {
    await withApp(async (app) => {
      const adminCookie = await login(app, ADMIN.email, ADMIN.password);

      const first = await app.inject({
        method: 'POST',
        url: '/vms',
        headers: authHeaders(adminCookie),
        payload: { ...baseVm, name: 'web-01' },
      });
      expect(first.statusCode).toBe(201);
      const vm = vmSchema.parse(first.json());

      const dupCase = await app.inject({
        method: 'POST',
        url: '/vms',
        headers: authHeaders(adminCookie),
        payload: { ...baseVm, name: 'WEB-01' },
      });
      expect(dupCase.statusCode).toBe(409);
      expect(apiErrorSchema.parse(dupCase.json()).error).toMatchObject({
        code: 'VM_NAME_TAKEN',
        details: { field: 'name' },
      });

      const jose = await app.inject({
        method: 'POST',
        url: '/vms',
        headers: authHeaders(adminCookie),
        payload: { ...baseVm, name: 'José' },
      });
      const josePlain = await app.inject({
        method: 'POST',
        url: '/vms',
        headers: authHeaders(adminCookie),
        payload: { ...baseVm, name: 'Jose' },
      });
      expect(jose.statusCode).toBe(201);
      expect(josePlain.statusCode).toBe(201);

      const nfd = 'Jose\u0301';
      const nfdDup = await app.inject({
        method: 'POST',
        url: '/vms',
        headers: authHeaders(adminCookie),
        payload: { ...baseVm, name: nfd },
      });
      expect(nfdDup.statusCode).toBe(409);

      const selfRename = await app.inject({
        method: 'PUT',
        url: `/vms/${vm.id}`,
        headers: authHeaders(adminCookie),
        payload: { ...baseVm, name: 'WEB-01', cores: 8 },
      });
      expect(selfRename.statusCode).toBe(200);
      expect(vmSchema.parse(selfRename.json()).name).toBe('WEB-01');
    });
  });

  it('handles concurrent duplicate POSTs with one 201 and one 409', async () => {
    await withApp(async (app) => {
      const adminCookie = await login(app, ADMIN.email, ADMIN.password);
      const payload = { ...baseVm, name: 'race-vm' };
      const [a, b] = await Promise.all([
        app.inject({
          method: 'POST',
          url: '/vms',
          headers: authHeaders(adminCookie),
          payload,
        }),
        app.inject({
          method: 'POST',
          url: '/vms',
          headers: authHeaders(adminCookie),
          payload,
        }),
      ]);
      const codes = [a.statusCode, b.statusCode].sort();
      expect(codes).toEqual([201, 409]);
    });
  });

  it('returns 404 for missing UUID and 400 for invalid id', async () => {
    await withApp(async (app) => {
      const adminCookie = await login(app, ADMIN.email, ADMIN.password);
      const missingId = '22222222-2222-4222-8222-222222222222';

      const putMissing = await app.inject({
        method: 'PUT',
        url: `/vms/${missingId}`,
        headers: authHeaders(adminCookie),
        payload: baseVm,
      });
      expect(putMissing.statusCode).toBe(404);
      expect(apiErrorSchema.parse(putMissing.json()).error.code).toBe('VM_NOT_FOUND');

      const delMissing = await app.inject({
        method: 'DELETE',
        url: `/vms/${missingId}`,
        headers: authHeaders(adminCookie),
      });
      expect(delMissing.statusCode).toBe(404);

      const badId = await app.inject({
        method: 'PUT',
        url: '/vms/abc',
        headers: authHeaders(adminCookie),
        payload: baseVm,
      });
      expect(badId.statusCode).toBe(400);
      expect(apiErrorSchema.parse(badId.json()).error.code).toBe('VALIDATION_ERROR');
    });
  });

  it('PUT keeps createdAt and updates updatedAt; DELETE removes from list', async () => {
    await withApp(async (app) => {
      const adminCookie = await login(app, ADMIN.email, ADMIN.password);
      const created = await app.inject({
        method: 'POST',
        url: '/vms',
        headers: authHeaders(adminCookie),
        payload: baseVm,
      });
      const before = vmSchema.parse(created.json()) as Vm;
      await new Promise((r) => setTimeout(r, 20));

      const updated = await app.inject({
        method: 'PUT',
        url: `/vms/${before.id}`,
        headers: authHeaders(adminCookie),
        payload: { ...baseVm, cores: 8 },
      });
      const after = vmSchema.parse(updated.json());
      expect(after.createdAt).toBe(before.createdAt);
      expect(after.updatedAt >= before.updatedAt).toBe(true);
      expect(after.cores).toBe(8);

      await app.inject({
        method: 'DELETE',
        url: `/vms/${before.id}`,
        headers: authHeaders(adminCookie),
      });
      const list = vmListResponseSchema.parse(
        (
          await app.inject({
            method: 'GET',
            url: '/vms',
            headers: { cookie: adminCookie },
          })
        ).json(),
      );
      expect(list.items.find((v) => v.id === before.id)).toBeUndefined();
    });
  });

  it('rejects foreign Origin on mutations', async () => {
    await withApp(async (app) => {
      const adminCookie = await login(app, ADMIN.email, ADMIN.password);
      const res = await app.inject({
        method: 'POST',
        url: '/vms',
        headers: { cookie: adminCookie, origin: 'https://evil.example' },
        payload: baseVm,
      });
      expect(res.statusCode).toBe(403);
      expect(apiErrorSchema.parse(res.json()).error.code).toBe('ORIGIN_NOT_ALLOWED');
    });
  });

  it('PUT rejects missing fields', async () => {
    await withApp(async (app) => {
      const adminCookie = await login(app, ADMIN.email, ADMIN.password);
      const created = await app.inject({
        method: 'POST',
        url: '/vms',
        headers: authHeaders(adminCookie),
        payload: baseVm,
      });
      const vm = vmSchema.parse(created.json());
      const { status: _status, ...incomplete } = baseVm;
      const res = await app.inject({
        method: 'PUT',
        url: `/vms/${vm.id}`,
        headers: authHeaders(adminCookie),
        payload: incomplete,
      });
      expect(res.statusCode).toBe(400);
    });
  });
});
