import { Skeleton } from '../../components/ui/Skeleton';

/** Geometría del formulario mientras llega la VM a editar. */
export function VmFormSkeleton() {
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
        {[2, 3, 1].map((fields, section) => (
          <div
            key={section}
            className="flex flex-col gap-4 border-t border-[var(--border)] px-5 py-6 first:border-t-0 sm:px-6"
          >
            <Skeleton className="h-5 w-40" />
            <div className="grid gap-4 sm:grid-cols-3">
              {Array.from({ length: fields }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-11 w-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="h-11 w-40" />
    </div>
  );
}
