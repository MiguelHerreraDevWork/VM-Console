import type { InputHTMLAttributes } from 'react';

import { cn } from '../../lib/cn';
import { controlClasses, FieldError, FieldHint, FieldLabel } from './field';

export type NumberInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string;
  unit: string;
  error?: string | undefined;
  hint?: string | undefined;
};

export function NumberInput({
  className,
  label,
  unit,
  error,
  hint,
  id,
  ...props
}: NumberInputProps) {
  const inputId = id ?? props.name;
  const errorId = error && inputId ? `${inputId}-error` : undefined;
  const hintId = hint && inputId ? `${inputId}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      <div className="relative">
        <input
          id={inputId}
          type="number"
          className={cn(controlClasses(error), 'py-2 pl-3 pr-14 tabular-nums', className)}
          aria-invalid={Boolean(error)}
          aria-describedby={[errorId, hintId].filter(Boolean).join(' ') || undefined}
          {...props}
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-[var(--muted)]">
          {unit}
        </span>
      </div>
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
      {hint && !error ? <FieldHint id={hintId}>{hint}</FieldHint> : null}
    </div>
  );
}
