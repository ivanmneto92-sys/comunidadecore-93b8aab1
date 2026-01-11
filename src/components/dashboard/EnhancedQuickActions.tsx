import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  to: string;
  icon: typeof BarChart3;
  label: string;
  badge?: number;
  isNew?: boolean;
  bgColor: string;
}

const quickActions: QuickAction[] = [
  { 
    to: '/results', 
    icon: BarChart3, 
    label: 'Resultados',
    bgColor: 'bg-primary/10 hover:bg-primary/20',
  },
  { 
    to: '/community', 
    icon: Users, 
    label: 'Comunidade',
    bgColor: 'bg-status-success/10 hover:bg-status-success/20',
  },
  { 
    to: '/academy', 
    icon: GraduationCap, 
    label: 'Academia',
    badge: 3,
    bgColor: 'bg-status-warning/10 hover:bg-status-warning/20',
  },
];

interface EnhancedQuickActionsProps {
  badges?: Record<string, number>;
}

export function EnhancedQuickActions({ badges = {} }: EnhancedQuickActionsProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
        Acesso Rápido
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {quickActions.map((action) => {
          const badgeCount = badges[action.to] || action.badge;
          
          return (
            <button
              key={action.to}
              onClick={() => navigate(action.to)}
              className={cn(
                'relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl',
                'border border-border/30 hover:border-border/50',
                'transition-all duration-200',
                action.bgColor
              )}
            >
              {/* Badge */}
              {badgeCount && badgeCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] flex items-center justify-center text-[10px] font-bold text-primary-foreground bg-primary rounded-full px-1">
                  {badgeCount > 9 ? '9+' : badgeCount}
                </span>
              )}
              
              {/* New indicator */}
              {action.isNew && !badgeCount && (
                <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 text-[8px] font-bold uppercase text-primary-foreground bg-status-success rounded-full">
                  novo
                </span>
              )}

              {/* Icon */}
              <action.icon className="h-6 w-6 text-foreground" />
              
              {/* Label */}
              <span className="text-xs font-medium text-foreground">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
