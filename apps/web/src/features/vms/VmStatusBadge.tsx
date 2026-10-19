import type { VmStatus } from '@repo/contracts';

import { Badge } from '../../components/ui/Badge';
import { cn } from '../../lib/cn';
import { statusLabel } from '../../lib/labels';

/** Estado con texto + punto (no solo color). Encendida usa el tono de éxito. */
export function VmStatusBadge({ status }: { status: VmStatus }) {
  const on = status === 'ON';
  return (
    <Badge tone={on ? 'success' : 'muted'}>
      <span
        aria-hidden
        className={cn(
          'size-1.5 rounded-full',
          on ? 'bg-[var(--success)]' : 'border border-[var(--muted)] bg-transparent',
        )}
      />
      {statusLabel(status)}
    </Badge>
  );
}
