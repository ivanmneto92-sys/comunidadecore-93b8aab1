import { Brain, Megaphone, BarChart3, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Highlight {
  id: string;
  type: 'risk' | 'announcement' | 'market';
  title: string;
  channel: string;
}

interface CommunityHighlightsProps {
  highlights: Highlight[];
}

const iconMap = {
  risk: Brain,
  announcement: Megaphone,
  market: BarChart3,
};

const typeConfig = {
  risk: { label: 'Leitura', color: 'text-primary', bg: 'bg-primary/10' },
  announcement: { label: 'Anúncio', color: 'text-status-warning', bg: 'bg-status-warning/10' },
  market: { label: 'Mercado', color: 'text-status-success', bg: 'bg-status-success/10' },
};

export function CommunityHighlights({ highlights }: CommunityHighlightsProps) {
  const navigate = useNavigate();

  if (highlights.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Comunidade
        </h3>
        <button 
          onClick={() => navigate('/community')}
          className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-0.5"
        >
          Ver todos
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      
      {/* Horizontal scroll carousel */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {highlights.slice(0, 5).map((highlight) => {
          const Icon = iconMap[highlight.type];
          const config = typeConfig[highlight.type];
          
          return (
            <button
              key={highlight.id}
              onClick={() => navigate('/community')}
              className={cn(
                'flex-shrink-0 w-40 p-3 rounded-xl',
                'bg-card/50 border border-border/50',
                'hover:bg-card/80 transition-colors',
                'text-left'
              )}
            >
              <div className={cn('inline-flex p-2 rounded-lg mb-2', config.bg)}>
                <Icon className={cn('h-4 w-4', config.color)} />
              </div>
              <span className={cn('text-[10px] font-medium block mb-1', config.color)}>
                {config.label}
              </span>
              <p className="text-xs text-foreground line-clamp-2 leading-tight">
                {highlight.title}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
