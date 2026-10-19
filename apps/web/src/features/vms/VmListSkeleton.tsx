import { Skeleton } from '../../components/ui/Skeleton';

/** Misma geometría que filtros + tabla (escritorio) y tarjetas (móvil) para evitar saltos. */
export function VmListSkeleton() {
  return (
    <div>
      <div className="@container mb-4 flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 @xs:grid-cols-2 @2xl:grid-cols-[2fr_1fr_1fr]">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={
                i === 0
                  ? 'flex flex-col gap-1.5 @xs:col-span-2 @2xl:col-span-1'
                  : 'flex flex-col gap-1.5'
              }
            >
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-11 w-full" />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
      <div className="hidden overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] lg:block">
        <div className="grid grid-cols-[2fr_1.2fr_repeat(3,0.7fr)_1fr_7rem] gap-4 px-4 py-3.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-16" />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, row) => (
          <div
            key={row}
            className="grid grid-cols-[2fr_1.2fr_repeat(3,0.7fr)_1fr_7rem] items-center gap-4 border-t border-[var(--border)] px-4 py-4"
          >
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="ml-auto h-4 w-8" />
            <Skeleton className="ml-auto h-4 w-12" />
            <Skeleton className="ml-auto h-4 w-14" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="ml-auto h-8 w-24" />
          </div>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
