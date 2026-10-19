import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DATABASE_URL_TEST: z.string().min(1, 'DATABASE_URL_TEST is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().min(1, 'JWT_EXPIRES_IN is required'),
  WEB_ORIGIN: z.string().url('WEB_ORIGIN must be a valid URL'),
  API_PORT: z.coerce.number().int().positive(),
  API_INTERNAL_URL: z.string().url('API_INTERNAL_URL must be a valid URL'),
  SEED_ADMIN_EMAIL: z.string().email(),
  SEED_ADMIN_PASSWORD: z.string().min(8),
  SEED_CLIENT_EMAIL: z.string().email(),
  SEED_CLIENT_PASSWORD: z.string().min(8),
});

export type AppConfig = z.infer<typeof envSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const path = issue?.path.join('.') || 'unknown';
    const message = issue?.message ?? 'Invalid configuration';
    throw new Error(`Invalid environment: ${path} — ${message}`);
  }
  return parsed.data;
}

let cached: AppConfig | undefined;

export function getConfig(): AppConfig {
  if (!cached) {
    cached = loadConfig();
  }
  return cached;
}
