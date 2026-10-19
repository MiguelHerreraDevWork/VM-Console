import { Spinner } from '../../components/ui/Spinner';
import { cn } from '../../lib/cn';
import { pendingLabel, type VmPending } from './types';

/** Fondo de la fila/tarjeta con operación en vuelo: tinte de acento, o de peligro al borrar. */
export function pendingSurface(pending: VmPending | undefined): string | false {
  if (!pending) {
    return false;
  }
  return pending === 'delete'
    ? 'bg-[color-mix(in_srgb,var(--danger)_7%,var(--surface))]'
    : 'bg-[color-mix(in_srgb,var(--accent)_9%,var(--surface))]';
}

/**
 * Operación optimista aún sin confirmar por la API, junto a la VM afectada.
 * `role="status"` la anuncia de forma educada; el toast final informa del resultado.
 */
export function VmPendingNote({ pending, name }: { pending: VmPending; name: string }) {
  return (
    <span
      role="status"
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-semibold',
        pending === 'delete' ? 'text-[var(--danger)]' : 'text-[var(--accent-hover)]',
      )}
      data-pending={pending}
    >
      <Spinner className="size-3.5" />
      {pendingLabel(pending)}
      <span className="sr-only">{name}</span>
    </span>
  );
}
