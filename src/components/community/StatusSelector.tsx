import { useUserStatus, PresenceStatus } from '@/hooks/useUserStatus';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Circle, Moon, MinusCircle, Eye } from 'lucide-react';

const statusConfig: Record<PresenceStatus, { label: string; color: string; icon: React.ElementType }> = {
  online: { label: 'Online', color: 'bg-green-500', icon: Circle },
  idle: { label: 'Ausente', color: 'bg-yellow-500', icon: Moon },
  dnd: { label: 'Não Perturbe', color: 'bg-red-500', icon: MinusCircle },
  invisible: { label: 'Invisível', color: 'bg-muted-foreground', icon: Eye },
};

interface StatusSelectorProps {
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
}

export function StatusSelector({ children, align = 'start' }: StatusSelectorProps) {
  const { currentStatus, setStatus } = useUserStatus();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-48">
        {(Object.keys(statusConfig) as PresenceStatus[]).map((status) => {
          const config = statusConfig[status];
          const Icon = config.icon;
          const isActive = currentStatus === status;

          return (
            <DropdownMenuItem
              key={status}
              onClick={() => setStatus(status)}
              className={cn(
                'flex items-center gap-2 cursor-pointer',
                isActive && 'bg-accent'
              )}
            >
              <div className={cn('w-3 h-3 rounded-full', config.color)} />
              <span className="flex-1">{config.label}</span>
              {isActive && <Icon className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function StatusIndicator({ status, size = 'sm' }: { status: PresenceStatus; size?: 'sm' | 'md' | 'lg' }) {
  const config = statusConfig[status];
  const sizeClasses = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div 
      className={cn(
        'rounded-full border-2 border-card',
        config.color,
        sizeClasses[size]
      )} 
      title={config.label}
    />
  );
}
