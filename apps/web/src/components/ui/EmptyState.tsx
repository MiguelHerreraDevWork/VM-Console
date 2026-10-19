import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';

export function EmptyState({
  title,
  description,
  action,
  icon: Icon,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-6 py-12 text-center',
        className,
      )}
    >
      {Icon ? (
        <span className="mb-1 flex size-12 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--muted)]">
          <Icon aria-hidden className="size-6" />
        </span>
      ) : null}
      <h2 className="text-lg font-semibold text-[var(--text)]">{title}</h2>
      {description ? <p className="max-w-md text-sm text-[var(--muted)]">{description}</p> : null}
      {action ? <div className="mt-2 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  );
}
