import { SESSION_COOKIE_NAME } from '@repo/contracts';
import { beforeEach, describe, expect, it } from 'vitest';

import { buildApp } from '../../app.js';
import { prisma } from '../../db.js';
import { cookieFromResponse, createUser, resetAuthFixtures } from '../../test/helpers.js';

const ADMIN = {
  email: 'admin-test@demo.local',
  password: 'AdminTest!234',
  role: 'ADMIN' as const,
};
const CLIENT = {
  email: 'client-test@demo.local',
  password: 'ClientTest!234',
  role: 'CLIENT' as const,
};

const origin = () => process.env.WEB_ORIGIN ?? 'http://localhost:3000';

describe('auth API', () => {
  beforeEach(async () => {
    await resetAuthFixtures();
    await createUser(ADMIN);
    await createUser(CLIENT);
  });

  async function withApp<T>(
    run: (app: Awaited<ReturnType<typeof buildApp>>) => Promise<T>,
    options?: Parameters<typeof buildApp>[0],
  ): Promise<T> {
    const app = await buildApp(options);
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
    headers?: Record<string, string>,
  ) {
    return app.inject({
      method: 'POST',
      url: '/login',
      headers: {
        origin: origin(),
        ...headers,
      },
      payload: { email, password },
    });
  }

  it('logs in ADMIN with cookie attributes and no token in body', async () => {
    await withApp(async (app) => {
      const res = await login(app, ADMIN.email, ADMIN.password);
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.user).toMatchObject({ email: ADMIN.email, role: 'ADMIN' });
      expect(body).not.toHaveProperty('token');
      expect(JSON.stringify(body)).not.toContain('eyJ');

      const setCookie = res.headers['set-cookie'];
      const cookieHeader = Array.isArray(setCookie) ? setCookie.join(';') : String(setCookie);
      expect(cookieHeader).toContain(`${SESSION_COOKIE_NAME}=`);
      expect(cookieHeader.toLowerCase()).toContain('httponly');
      expect(cookieHeader.toLowerCase()).toContain('secure');
      expect(cookieHeader.toLowerCase()).toContain('samesite=lax');
      expect(cookieHeader.toLowerCase()).toContain('path=/');
      expect(cookieHeader.toLowerCase()).toMatch(/max-age=\d+/);
    });
  });

  it('logs in CLIENT', async () => {
    await withApp(async (app) => {
      const res = await login(app, CLIENT.email, CLIENT.password);
      expect(res.statusCode).toBe(200);
      expect(res.json().user.role).toBe('CLIENT');
    });
  });

  it('returns the same 401 for wrong password and unknown email', async () => {
    await withApp(async (app) => {
      const wrong = await login(app, ADMIN.email, 'wrong-password');
      const missing = await login(app, 'nobody@demo.local', 'whatever');
      expect(wrong.statusCode).toBe(401);
      expect(missing.statusCode).toBe(401);
      expect(wrong.json().error.code).toBe('INVALID_CREDENTIALS');
      expect(missing.json().error.code).toBe('INVALID_CREDENTIALS');
      expect(wrong.json().error.message).toBe(missing.json().error.message);
    });
  });

  it('validates login body', async () => {
    await withApp(async (app) => {
      const res = await app.inject({
        method: 'POST',
        url: '/login',
        headers: { origin: origin() },
        payload: { email: 'not-an-email', password: '' },
      });
      expect(res.statusCode).toBe(400);
      expect(res.json().error.code).toBe('VALIDATION_ERROR');
      expect(res.json().error.details).toBeTruthy();
    });
  });

  it('serves /me with cookie and rejects missing/tampered/expired JWT', async () => {
    await withApp(async (app) => {
      const loginRes = await login(app, ADMIN.email, ADMIN.password);
      const cookie = cookieFromResponse(loginRes.headers['set-cookie']);
      expect(cookie).toBeTruthy();

      const meOk = await app.inject({
        method: 'GET',
        url: '/me',
        headers: { cookie },
      });
      expect(meOk.statusCode).toBe(200);
      expect(meOk.json().user.email).toBe(ADMIN.email);

      const meMissing = await app.inject({ method: 'GET', url: '/me' });
      expect(meMissing.statusCode).toBe(401);
      expect(meMissing.json().error.code).toBe('UNAUTHENTICATED');

      const meTampered = await app.inject({
        method: 'GET',
        url: '/me',
        headers: { cookie: `${SESSION_COOKIE_NAME}=not.a.jwt` },
      });
      expect(meTampered.statusCode).toBe(401);

      const expired = app.jwt.sign(
        { role: 'ADMIN' },
        { sub: loginRes.json().user.id, expiresIn: '1ms' },
      );
      await new Promise((r) => setTimeout(r, 20));
      const meExpired = await app.inject({
        method: 'GET',
        url: '/me',
        headers: { cookie: `${SESSION_COOKIE_NAME}=${expired}` },
      });
      expect(meExpired.statusCode).toBe(401);
    });
  });

  it('logout clears cookie and subsequent anonymous /me is 401', async () => {
    await withApp(async (app) => {
      const loginRes = await login(app, ADMIN.email, ADMIN.password);
      const cookie = cookieFromResponse(loginRes.headers['set-cookie']);

      const logout = await app.inject({
        method: 'POST',
        url: '/logout',
        headers: {
          cookie,
          origin: origin(),
        },
      });
      expect(logout.statusCode).toBe(204);
      const cleared = Array.isArray(logout.headers['set-cookie'])
        ? logout.headers['set-cookie'].join(';')
        : String(logout.headers['set-cookie'] ?? '');
      expect(cleared.toLowerCase()).toMatch(/max-age=0|expires=/);

      const meNoCookie = await app.inject({ method: 'GET', url: '/me' });
      expect(meNoCookie.statusCode).toBe(401);
    });
  });

  it('rejects mutations with foreign Origin', async () => {
    await withApp(async (app) => {
      const res = await app.inject({
        method: 'POST',
        url: '/login',
        headers: { origin: 'https://evil.example' },
        payload: { email: ADMIN.email, password: ADMIN.password },
      });
      expect(res.statusCode).toBe(403);
      expect(res.json().error.code).toBe('ORIGIN_NOT_ALLOWED');
    });
  });

  it('rate-limits login after N attempts', async () => {
    await withApp(
      async (app) => {
        for (let i = 0; i < 3; i += 1) {
          const res = await login(app, ADMIN.email, 'wrong');
          expect(res.statusCode).toBe(401);
        }
        const blocked = await login(app, ADMIN.email, 'wrong');
        expect(blocked.statusCode).toBe(429);
        expect(blocked.json().error.code).toBe('RATE_LIMITED');
      },
      { loginMax: 3, loginTimeWindow: '1 minute' },
    );
  });

  it('applies role changes from DB on the next request', async () => {
    await withApp(async (app) => {
      app.post(
        '/__test__/admin-only',
        { preHandler: [app.requireRole('ADMIN')] },
        async () => ({ ok: true }),
      );

      const loginRes = await login(app, CLIENT.email, CLIENT.password);
      const cookie = cookieFromResponse(loginRes.headers['set-cookie']);
      const userId = loginRes.json().user.id as string;

      const asClient = await app.inject({
        method: 'POST',
        url: '/__test__/admin-only',
        headers: { cookie, origin: origin() },
      });
      expect(asClient.statusCode).toBe(403);

      await prisma.user.update({ where: { id: userId }, data: { role: 'ADMIN' } });

      const asAdmin = await app.inject({
        method: 'POST',
        url: '/__test__/admin-only',
        headers: { cookie, origin: origin() },
      });
      expect(asAdmin.statusCode).toBe(200);
    });
  });

  it('requireRole: CLIENT 403, ADMIN 200, no session 401; production has no test route', async () => {
    await withApp(async (app) => {
      app.post(
        '/__test__/admin-only',
        { preHandler: [app.requireRole('ADMIN')] },
        async () => ({ ok: true }),
      );

      const clientLogin = await login(app, CLIENT.email, CLIENT.password);
      const adminLogin = await login(app, ADMIN.email, ADMIN.password);
      const clientCookie = cookieFromResponse(clientLogin.headers['set-cookie']);
      const adminCookie = cookieFromResponse(adminLogin.headers['set-cookie']);

      expect(
        (
          await app.inject({
            method: 'POST',
            url: '/__test__/admin-only',
            headers: { cookie: clientCookie, origin: origin() },
          })
        ).statusCode,
      ).toBe(403);

      expect(
        (
          await app.inject({
            method: 'POST',
            url: '/__test__/admin-only',
            headers: { cookie: adminCookie, origin: origin() },
          })
        ).statusCode,
      ).toBe(200);

      expect(
        (
          await app.inject({
            method: 'POST',
            url: '/__test__/admin-only',
            headers: { origin: origin() },
          })
        ).statusCode,
      ).toBe(401);
    });

    await withApp(async (production) => {
      const missing = await production.inject({
        method: 'POST',
        url: '/__test__/admin-only',
        headers: { origin: origin() },
      });
      expect(missing.statusCode).toBe(404);
      expect(missing.json().error.code).toBe('NOT_FOUND');
    });
  });

  it('unexpected errors become INTERNAL_ERROR without stack', async () => {
    await withApp(async (app) => {
      app.get('/__test__/boom', async () => {
        throw new Error('secret stack');
      });
      const res = await app.inject({ method: 'GET', url: '/__test__/boom' });
      expect(res.statusCode).toBe(500);
      expect(res.json().error.code).toBe('INTERNAL_ERROR');
      expect(JSON.stringify(res.json())).not.toContain('secret stack');
    });
  });
});
