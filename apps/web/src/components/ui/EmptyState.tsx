import type { ReactNode } from 'react';

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--surface)] p-8">
      <h2 className="text-lg font-semibold text-[var(--text)]">{title}</h2>
      {description ? <p className="max-w-prose text-sm text-[var(--muted)]">{description}</p> : null}
      {action}
    </div>
  );
}
