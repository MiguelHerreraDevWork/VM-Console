import { SESSION_COOKIE_NAME, sessionResponseSchema, type SessionUser } from '@repo/contracts';
import { cookies } from 'next/headers';

export async function fetchSessionUser(): Promise<SessionUser | null> {
  const apiUrl = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const response = await fetch(`${apiUrl}/me`, {
    headers: {
      cookie: `${SESSION_COOKIE_NAME}=${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  const data: unknown = await response.json();
  const parsed = sessionResponseSchema.safeParse(data);
  return parsed.success ? parsed.data.user : null;
}
