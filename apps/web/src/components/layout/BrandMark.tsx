import { cn } from '../../lib/cn';

/** Monograma tipográfico neutral (no es un logo oficial). */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] text-base font-bold text-[var(--on-accent)]',
        className,
      )}
    >
      V
    </span>
  );
}
