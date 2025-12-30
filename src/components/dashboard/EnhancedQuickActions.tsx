import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Brain, GraduationCap, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  to: string;
  icon: typeof BarChart3;
  label: string;
  description: string;
  badge?: number;
  isNew?: boolean;
}

const quickActions: QuickAction[] = [
  { 
    to: '/results', 
    icon: BarChart3, 
    label: 'Resultados',
    description: 'Performance detalhada',
  },
  { 
    to: '/community', 
    icon: Brain, 
    label: 'Leitura de Risco',
    description: 'Análise do mercado',
    isNew: true,
  },
  { 
    to: '/academy', 
    icon: GraduationCap, 
    label: 'Academia',
    description: 'Conteúdo educacional',
    badge: 3,
  },
];

interface EnhancedQuickActionsProps {
  badges?: Record<string, number>;
}

export function EnhancedQuickActions({ badges = {} }: EnhancedQuickActionsProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
        Acesso Rápido
      </h3>
      <div className="space-y-2">
        {quickActions.map((action) => {
          const badgeCount = badges[action.to] || action.badge;
          
          return (
            <button
              key={action.to}
              onClick={() => navigate(action.to)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-xl',
                'bg-secondary/50 hover:bg-secondary/80',
                'border border-border/30 hover:border-border/50',
                'transition-all duration-200 group'
              )}
            >
              {/* Icon */}
              <div className="relative p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                <action.icon className="h-5 w-5 text-primary" />
                
                {/* Badge */}
                {badgeCount && badgeCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-primary-foreground bg-primary rounded-full px-1">
                    {badgeCount > 9 ? '9+' : badgeCount}
                  </span>
                )}
                
                {/* New indicator */}
                {action.isNew && !badgeCount && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[8px] font-bold uppercase text-primary-foreground bg-status-success rounded-full">
                    novo
                  </span>
                )}
              </div>
              
              {/* Text */}
              <div className="flex-1 text-left">
                <span className="text-sm font-medium text-foreground block">
                  {action.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {action.description}
                </span>
              </div>
              
              {/* Arrow */}
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
