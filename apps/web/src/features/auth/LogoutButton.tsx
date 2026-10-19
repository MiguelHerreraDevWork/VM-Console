'use client';

import { useLogout } from './hooks';

export function LogoutButton() {
  const logout = useLogout();
  return (
    <button type="button" onClick={() => logout.mutate()} disabled={logout.isPending}>
      {logout.isPending ? 'Saliendo…' : 'Cerrar sesión'}
    </button>
  );
}
