import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeletons reutilizáveis padronizados.
 * Use estes presets ao invés de spinners para qualquer estado de carregamento
 * de página/rota. Mantém a percepção de "app rápido" e consistência visual.
 */

export const PageSkeleton = () => (
  <div
    role="status"
    aria-label="Carregando conteúdo"
    aria-busy="true"
    className="min-h-dvh bg-background p-4 space-y-4 animate-in fade-in duration-300"
  >
    <Skeleton className="h-10 w-1/2 rounded-lg" />
    <Skeleton className="h-4 w-1/3 rounded" />
    <Skeleton className="h-56 w-full rounded-xl mt-6" />
    <div className="grid grid-cols-2 gap-3">
      <Skeleton className="h-28 rounded-xl" />
      <Skeleton className="h-28 rounded-xl" />
    </div>
    <Skeleton className="h-40 w-full rounded-xl" />
  </div>
);

export const FeedSkeleton = ({ count = 4 }: { count?: number }) => (
  <div
    role="status"
    aria-label="Carregando feed"
    aria-busy="true"
    className="space-y-3 animate-in fade-in duration-300"
  >
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="p-4 rounded-xl bg-card space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    ))}
  </div>
);

export const ListSkeleton = ({ count = 6 }: { count?: number }) => (
  <div
    role="status"
    aria-label="Carregando lista"
    aria-busy="true"
    className="space-y-2 animate-in fade-in duration-300"
  >
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-card">
        <Skeleton className="h-9 w-9 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    ))}
  </div>
);

export const CardGridSkeleton = ({
  count = 6,
  cardClassName = "h-32",
}: {
  count?: number;
  cardClassName?: string;
}) => (
  <div
    role="status"
    aria-label="Carregando cartões"
    aria-busy="true"
    className="grid grid-cols-2 md:grid-cols-3 gap-3 animate-in fade-in duration-300"
  >
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton key={i} className={`${cardClassName} rounded-xl`} />
    ))}
  </div>
);
