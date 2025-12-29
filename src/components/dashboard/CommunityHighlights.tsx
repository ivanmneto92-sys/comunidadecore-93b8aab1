import { Brain, Megaphone, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

const typeLabels = {
  risk: 'Leitura de Risco',
  announcement: 'Anúncio',
  market: 'Mercado',
};

export function CommunityHighlights({ highlights }: CommunityHighlightsProps) {
  const navigate = useNavigate();

  if (highlights.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground">Destaques da Comunidade</h3>
      <div className="space-y-2">
        {highlights.slice(0, 3).map((highlight) => {
          const Icon = iconMap[highlight.type];
          return (
            <button
              key={highlight.id}
              onClick={() => navigate('/community')}
              className="w-full flex items-start gap-3 p-3 rounded-lg bg-card hover:bg-accent/50 transition-colors text-left"
            >
              <Icon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xs text-primary font-medium">{typeLabels[highlight.type]}</span>
                <p className="text-sm text-foreground truncate">{highlight.title}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
