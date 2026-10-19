import { CircleAlert } from 'lucide-react';

import { cn } from '../../lib/cn';

/** Clases compartidas de controles de formulario (input, number, select). */
export function controlClasses(error?: string) {
  return cn(
    'min-h-11 w-full rounded-[var(--radius-md)] border bg-[var(--surface-2)] text-[var(--text)] placeholder:text-[var(--muted)]',
    'transition-[border-color,box-shadow] duration-150',
    'hover:border-[var(--border-strong)] focus-visible:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]',
    'disabled:cursor-not-allowed disabled:opacity-60',
    error ? 'border-[var(--danger)] hover:border-[var(--danger)]' : 'border-[var(--border)]',
  );
}

export function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string | undefined;
  children: string;
}) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-[var(--text)]">
      {children}
    </label>
  );
}

export function FieldHint({ id, children }: { id?: string | undefined; children: string }) {
  return (
    <p id={id} className="text-xs text-[var(--muted)]">
      {children}
    </p>
  );
}

/** Error junto al campo: icono + texto (no solo color). */
export function FieldError({ id, children }: { id?: string | undefined; children: string }) {
  return (
    <p
      id={id}
      role="alert"
      className="flex items-start gap-1.5 text-xs font-medium text-[var(--danger)]"
    >
      <CircleAlert aria-hidden className="mt-px size-3.5 shrink-0" />
      {children}
    </p>
  );
}
