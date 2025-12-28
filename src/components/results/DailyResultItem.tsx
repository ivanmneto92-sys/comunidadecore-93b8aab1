import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DailyReport {
  id: string;
  date: string;
  trades_count: number;
  win_rate: number;
  pnl_percent: number;
  drawdown_percent: number;
  profile_type: string | null;
  status: 'success' | 'warning' | 'danger';
  ai_comment: string | null;
}

interface DailyResultItemProps {
  report: DailyReport;
}

const statusConfig = {
  success: { emoji: '🟢', color: 'bg-status-success/10 text-status-success' },
  warning: { emoji: '🟡', color: 'bg-status-warning/10 text-status-warning' },
  danger: { emoji: '🔴', color: 'bg-status-danger/10 text-status-danger' },
};

const profileLabels: Record<string, string> = {
  defensive: 'Defensivo',
  normal: 'Normal',
  aggressive: 'Agressivo',
};

export function DailyResultItem({ report }: DailyResultItemProps) {
  const [expanded, setExpanded] = useState(false);
  const isPositive = Number(report.pnl_percent) >= 0;
  const config = statusConfig[report.status];

  const formattedDate = (() => {
    try {
      return format(parseISO(report.date), "dd 'de' MMM", { locale: ptBR });
    } catch {
      return report.date;
    }
  })();

  return (
    <Card 
      className={cn(
        'cursor-pointer transition-colors hover:bg-card/80',
        expanded && 'ring-1 ring-border'
      )}
      onClick={() => setExpanded(!expanded)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg">{config.emoji}</span>
            <div>
              <p className="font-medium">{formattedDate}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{report.trades_count} trades</span>
                <span>•</span>
                <span>{Number(report.win_rate).toFixed(0)}% win</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className={cn(
                'font-bold',
                isPositive ? 'text-status-success' : 'text-status-danger'
              )}>
                {isPositive ? '+' : ''}{Number(report.pnl_percent).toFixed(2)}%
              </p>
              <p className="text-xs text-muted-foreground">
                DD: {Number(report.drawdown_percent).toFixed(2)}%
              </p>
            </div>
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-border space-y-3">
            {/* Profile type */}
            {report.profile_type && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={config.color}>
                  {profileLabels[report.profile_type] || report.profile_type}
                </Badge>
              </div>
            )}

            {/* AI Comment */}
            {report.ai_comment && (
              <div className="flex gap-2">
                <Sparkles className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {report.ai_comment}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
