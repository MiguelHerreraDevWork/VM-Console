/**
 * Spike opcional: verificar cookie Secure en un navegador ya abierto con CDP.
 *
 * Ejemplo Edge:
 *   msedge --remote-debugging-port=9223 --user-data-dir=%TEMP%\ifx-edge http://localhost:3000/login
 *   pnpm add -D playwright-core
 *   node --env-file=.env scripts/spike-secure-cookie.mjs
 *   pnpm remove -D playwright-core
 */
import { chromium } from 'playwright-core';

const cdpUrl = process.env.CDP_URL ?? 'http://127.0.0.1:9223';
const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@demo.local';
const password = process.env.SEED_ADMIN_PASSWORD ?? 'AdminDemo!234';

const browser = await chromium.connectOverCDP(cdpUrl);
const context = browser.contexts()[0] ?? (await browser.newContext());
const page = context.pages()[0] ?? (await context.newPage());

await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
await page.getByLabel('Email').fill(email);
await page.getByLabel('Contraseña').fill(password);
await page.getByRole('button', { name: 'Entrar' }).click();
await page.waitForURL('**/dashboard', { timeout: 15_000 });

const cookies = await context.cookies('http://localhost:3000');
const session = cookies.find((c) => c.name === 'session');
const documentCookie = await page.evaluate(() => document.cookie);
const storage = await page.evaluate(() => ({
  localStorage: Object.keys(localStorage),
  sessionStorage: Object.keys(sessionStorage),
}));

console.log(
  JSON.stringify(
    {
      url: page.url(),
      sessionCookie: session
        ? {
            httpOnly: session.httpOnly,
            secure: session.secure,
            sameSite: session.sameSite,
            path: session.path,
          }
        : null,
      documentCookieHasSession: documentCookie.includes('session='),
      storage,
    },
    null,
    2,
  ),
);

await browser.close();
