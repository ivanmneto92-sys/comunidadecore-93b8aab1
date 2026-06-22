import { Skeleton } from '@/components/ui/skeleton';

export function ResultsSkeleton() {
  return (
    <div className="px-4 py-6 space-y-4 overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-16 rounded-full" />
        ))}
      </div>

      {/* Streak badge */}
      <Skeleton className="h-16 w-full rounded-2xl" />

      {/* Today result */}
      <Skeleton className="h-28 w-full rounded-2xl" />

      {/* Performance overview */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>

      {/* Growth charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>

      {/* PnL chart */}
      <Skeleton className="h-72 w-full rounded-2xl" />

      {/* Daily list */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
