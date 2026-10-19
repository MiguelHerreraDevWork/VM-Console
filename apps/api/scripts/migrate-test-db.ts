import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { PrismaClient } from '@prisma/client';

import { getConfig } from '../src/config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiRoot = path.resolve(__dirname, '..');
const prismaCli = path.join(apiRoot, 'node_modules', 'prisma', 'build', 'index.js');

const config = getConfig();

async function ensureTestDatabase() {
  const testUrl = new URL(config.DATABASE_URL_TEST);
  const testDbName = testUrl.pathname.replace(/^\//, '').split('?')[0];
  if (!testDbName) {
    throw new Error('DATABASE_URL_TEST must include a database name');
  }

  const admin = new PrismaClient({
    datasources: { db: { url: config.DATABASE_URL } },
  });

  try {
    const rows = await admin.$queryRawUnsafe<{ exists: boolean }[]>(
      `SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = $1) AS exists`,
      testDbName,
    );
    if (rows[0]?.exists !== true) {
      await admin.$executeRawUnsafe(`CREATE DATABASE "${testDbName}"`);
      console.log(`Created database ${testDbName}`);
    }
  } finally {
    await admin.$disconnect();
  }
}

await ensureTestDatabase();

execFileSync(process.execPath, ['--env-file=../../.env', prismaCli, 'migrate', 'deploy'], {
  cwd: apiRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
    DATABASE_URL: config.DATABASE_URL_TEST,
  },
});

console.log('Test database migrated');
