import type { ComponentPropsWithRef } from 'react';

import { cn } from '../../lib/cn';
import { controlClasses, FieldError, FieldHint, FieldLabel } from './field';

export type InputProps = ComponentPropsWithRef<'input'> & {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
};

export function Input({ className, label, error, hint, id, ...props }: InputProps) {
  const inputId = id ?? props.name;
  const errorId = error && inputId ? `${inputId}-error` : undefined;
  const hintId = hint && inputId ? `${inputId}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      <input
        id={inputId}
        className={cn(controlClasses(error), 'px-3', className)}
        aria-invalid={Boolean(error)}
        aria-describedby={[errorId, hintId].filter(Boolean).join(' ') || undefined}
        {...props}
      />
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
      {hint && !error ? <FieldHint id={hintId}>{hint}</FieldHint> : null}
    </div>
  );
}
