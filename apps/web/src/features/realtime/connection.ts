export type ConnectionStatus = 'live' | 'reconnecting' | 'offline';

export function connectionLabel(status: ConnectionStatus): string {
  switch (status) {
    case 'live':
      return 'En vivo';
    case 'reconnecting':
      return 'Reconectando…';
    case 'offline':
      return 'Sin conexión';
  }
}
