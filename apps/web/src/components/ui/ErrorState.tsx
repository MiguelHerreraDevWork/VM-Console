import { Button } from './Button';

export function ErrorState({
  title = 'Algo salió mal',
  description = 'No se pudo cargar la información.',
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--danger)]/40 bg-[var(--surface)] p-8"
    >
      <h2 className="text-lg font-semibold text-[var(--text)]">{title}</h2>
      <p className="max-w-prose text-sm text-[var(--muted)]">{description}</p>
      {onRetry ? (
        <Button type="button" variant="secondary" onClick={onRetry}>
          Reintentar
        </Button>
      ) : null}
    </div>
  );
}
