import { ChevronRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileMenuItemProps {
  icon: LucideIcon;
  iconColor?: string;
  label: string;
  subtitle?: string;
  badge?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  destructive?: boolean;
  className?: string;
}

export function ProfileMenuItem({
  icon: Icon,
  iconColor = 'text-primary',
  label,
  subtitle,
  badge,
  onClick,
  destructive = false,
  className,
}: ProfileMenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-4 px-4 py-3.5 transition-colors active:scale-[0.98] active:bg-muted/50',
        destructive ? 'hover:bg-destructive/10' : 'hover:bg-muted/30',
        className
      )}
    >
      <div className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center',
        destructive ? 'bg-destructive/10' : 'bg-muted/50'
      )}>
        <Icon className={cn('w-5 h-5', destructive ? 'text-destructive' : iconColor)} />
      </div>
      
      <div className="flex-1 text-left">
        <p className={cn(
          'font-medium',
          destructive ? 'text-destructive' : 'text-foreground'
        )}>
          {label}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>

      {badge && (
        <div className="mr-2">{badge}</div>
      )}

      {!destructive && (
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      )}
    </button>
  );
}
