import { buildApp } from './app.js';
import { getConfig } from './config.js';
import { attachRealtime } from './realtime/attach.js';

async function main() {
  const config = getConfig();
  const app = await buildApp();
  await app.ready();
  attachRealtime(app);

  try {
    await app.listen({ port: config.API_PORT, host: '0.0.0.0' });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
