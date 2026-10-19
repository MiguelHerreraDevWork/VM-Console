import type { VmStatus } from '@repo/contracts';

import { Badge } from '../../components/ui/Badge';
import { statusLabel } from '../../lib/labels';

export function VmStatusBadge({ status }: { status: VmStatus }) {
  return (
    <Badge tone={status === 'ON' ? 'accent' : 'muted'} aria-label={statusLabel(status)}>
      {statusLabel(status)}
    </Badge>
  );
}
