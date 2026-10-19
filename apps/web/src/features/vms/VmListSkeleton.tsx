import { Skeleton } from '../../components/ui/Skeleton';

export function VmListSkeleton() {
  return (
    <>
      <div className="hidden overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] lg:block">
        <div className="grid grid-cols-[2fr_1fr_repeat(3,0.7fr)_1fr_7rem] gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, row) => (
          <div
            key={row}
            className="grid grid-cols-[2fr_1fr_repeat(3,0.7fr)_1fr_7rem] gap-3 border-b border-[var(--border)] px-4 py-4 last:border-b-0"
          >
            {Array.from({ length: 7 }).map((_, col) => (
              <Skeleton key={col} className="h-5 w-full" />
            ))}
          </div>
        ))}
      </div>
      <div className="grid gap-3 lg:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4"
          >
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-10 w-28 self-end" />
          </div>
        ))}
      </div>
    </>
  );
}
