import { cn } from '@/lib/utils';

interface UnreadBadgeProps {
  count: number;
  className?: string;
}

export function UnreadBadge({ count, className }: UnreadBadgeProps) {
  if (count === 0) return null;

  const displayCount = count > 99 ? '99+' : count;

  return (
    <span
      className={cn(
        "flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold",
        "bg-destructive text-destructive-foreground rounded-full",
        className
      )}
    >
      {displayCount}
    </span>
  );
}
