import { redirect } from 'next/navigation';

import { fetchSessionUser } from '../features/auth/session-server';

export default async function HomePage() {
  const user = await fetchSessionUser();
  redirect(user ? '/dashboard' : '/login');
}
