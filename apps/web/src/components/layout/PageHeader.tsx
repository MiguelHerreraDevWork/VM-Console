export function PageHeader({
  title,
  breadcrumb,
  description,
}: {
  title: string;
  breadcrumb?: string[];
  description?: string;
}) {
  return (
    <div className="mb-6 flex flex-col gap-2">
      {breadcrumb && breadcrumb.length > 0 ? (
        <nav aria-label="Miga de pan" className="text-xs text-[var(--muted)]">
          {breadcrumb.join(' / ')}
        </nav>
      ) : null}
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      {description ? <p className="max-w-prose text-sm text-[var(--muted)]">{description}</p> : null}
    </div>
  );
}
