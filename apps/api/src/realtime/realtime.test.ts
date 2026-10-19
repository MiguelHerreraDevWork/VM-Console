import { SESSION_COOKIE_NAME, VM_UPDATED_EVENT } from '@repo/contracts';
import { io as ioClient, type Socket } from 'socket.io-client';
import { beforeEach, describe, expect, it } from 'vitest';

import { buildApp } from '../app.js';
import { cookieFromResponse, createUser, resetAuthFixtures } from '../test/helpers.js';
import { attachRealtime } from './attach.js';
import { getRealtimeServer } from './hub.js';

const ADMIN = {
  email: 'rt-admin@demo.local',
  password: 'AdminTest!234',
  role: 'ADMIN' as const,
};

const origin = () => process.env.WEB_ORIGIN ?? 'http://localhost:3000';

function waitForEvent<T>(socket: Socket, event: string, timeoutMs = 5000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout waiting for ${event}`));
    }, timeoutMs);
    socket.once(event, (payload: T) => {
      clearTimeout(timer);
      resolve(payload);
    });
  });
}

describe('realtime Socket.IO', () => {
  beforeEach(async () => {
    await resetAuthFixtures();
    await createUser(ADMIN);
  });

  async function withListeningApp<T>(
    run: (ctx: {
      app: Awaited<ReturnType<typeof buildApp>>;
      baseUrl: string;
      cookie: string;
    }) => Promise<T>,
  ): Promise<T> {
    const app = await buildApp({ loginMax: 100 });
    await app.ready();
    attachRealtime(app);
    await app.listen({ port: 0, host: '127.0.0.1' });
    const address = app.server.address();
    if (!address || typeof address === 'string') {
      await app.close();
      throw new Error('No listening address');
    }
    const baseUrl = `http://127.0.0.1:${address.port}`;

    try {
      const login = await app.inject({
        method: 'POST',
        url: '/login',
        headers: { origin: origin() },
        payload: { email: ADMIN.email, password: ADMIN.password },
      });
      const cookie = cookieFromResponse(login.headers['set-cookie']);
      if (!cookie) {
        throw new Error('Missing session cookie');
      }
      return await run({ app, baseUrl, cookie });
    } finally {
      getRealtimeServer()?.disconnectSockets(true);
      await app.close();
    }
  }

  function openSocket(baseUrl: string, cookie: string, headers?: Record<string, string>) {
    return ioClient(baseUrl, {
      transports: ['polling'],
      extraHeaders: {
        origin: origin(),
        cookie,
        ...headers,
      },
      reconnection: false,
      forceNew: true,
    });
  }

  async function connectOrThrow(socket: Socket) {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('connect timeout')), 4000);
      socket.once('connect', () => {
        clearTimeout(timer);
        resolve();
      });
      socket.once('connect_error', (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });
  }

  it(
    'rejects handshake without cookie',
    async () => {
      await withListeningApp(async ({ baseUrl }) => {
        const socket = ioClient(baseUrl, {
          transports: ['polling'],
          extraHeaders: { origin: origin() },
          reconnection: false,
          forceNew: true,
        });
        const error = await new Promise<Error>((resolve) => {
          socket.on('connect_error', (err) => resolve(err));
        });
        expect(error.message).toMatch(/UNAUTHENTICATED/i);
        socket.close();
      });
    },
    15_000,
  );

  it(
    'rejects handshake with foreign Origin',
    async () => {
      await withListeningApp(async ({ baseUrl, cookie }) => {
        const socket = ioClient(baseUrl, {
          transports: ['polling'],
          extraHeaders: {
            origin: 'http://evil.example',
            cookie,
          },
          reconnection: false,
          forceNew: true,
        });
        const error = await new Promise<Error>((resolve) => {
          socket.on('connect_error', (err) => resolve(err));
        });
        expect(error.message).toMatch(/UNAUTHENTICATED/i);
        socket.close();
      });
    },
    15_000,
  );

  it(
    'emits vm:updated only when status changes',
    async () => {
      await withListeningApp(async ({ app, baseUrl, cookie }) => {
        const create = await app.inject({
          method: 'POST',
          url: '/vms',
          headers: { cookie, origin: origin() },
          payload: {
            name: 'rt-vm-01',
            cores: 2,
            ram: 4,
            disk: 40,
            os: 'Ubuntu',
            status: 'OFF',
          },
        });
        expect(create.statusCode).toBe(201);
        const vm = create.json() as { id: string; name: string };

        const socket = openSocket(baseUrl, cookie);
        await connectOrThrow(socket);

        const statusEvent = waitForEvent<{ vm: { id: string; status: string } }>(
          socket,
          VM_UPDATED_EVENT,
        );
        const putStatus = await app.inject({
          method: 'PUT',
          url: `/vms/${vm.id}`,
          headers: { cookie, origin: origin() },
          payload: {
            name: vm.name,
            cores: 2,
            ram: 4,
            disk: 40,
            os: 'Ubuntu',
            status: 'ON',
          },
        });
        expect(putStatus.statusCode).toBe(200);
        const payload = await statusEvent;
        expect(payload.vm.id).toBe(vm.id);
        expect(payload.vm.status).toBe('ON');

        let ramEvent = false;
        const onRam = () => {
          ramEvent = true;
        };
        socket.on(VM_UPDATED_EVENT, onRam);
        const putRam = await app.inject({
          method: 'PUT',
          url: `/vms/${vm.id}`,
          headers: { cookie, origin: origin() },
          payload: {
            name: vm.name,
            cores: 2,
            ram: 8,
            disk: 40,
            os: 'Ubuntu',
            status: 'ON',
          },
        });
        expect(putRam.statusCode).toBe(200);
        await new Promise((r) => setTimeout(r, 250));
        expect(ramEvent).toBe(false);

        socket.off(VM_UPDATED_EVENT, onRam);
        socket.close();
        expect(cookie.startsWith(`${SESSION_COOKIE_NAME}=`)).toBe(true);
      });
    },
    15_000,
  );
});
