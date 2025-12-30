import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Sparkles } from 'lucide-react';
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
  success: { color: 'bg-emerald-500' },
  warning: { color: 'bg-amber-500' },
  danger: { color: 'bg-destructive' },
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
      return format(parseISO(report.date), "dd MMM", { locale: ptBR });
    } catch {
      return report.date;
    }
  })();

  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all duration-200 hover:bg-muted/30',
        expanded && 'ring-1 ring-primary/30'
      )}
      onClick={() => setExpanded(!expanded)}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {/* Status indicator */}
          <div className={cn('w-1 h-10 rounded-full shrink-0', config.color)} />
          
          {/* Date and stats */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{formattedDate}</p>
            <p className="text-xs text-muted-foreground">
              {report.trades_count} trades • {Number(report.win_rate).toFixed(0)}% win
            </p>
          </div>
          
          {/* PnL and expand */}
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className={cn(
                'text-sm font-bold',
                isPositive ? 'text-emerald-500' : 'text-destructive'
              )}>
                {isPositive ? '+' : ''}{Number(report.pnl_percent).toFixed(2)}%
              </p>
              <p className="text-[10px] text-muted-foreground">
                DD {Number(report.drawdown_percent).toFixed(1)}%
              </p>
            </div>
            <ChevronDown className={cn(
              'h-4 w-4 text-muted-foreground transition-transform duration-200',
              expanded && 'rotate-180'
            )} />
          </div>
        </div>

        {/* Expanded content */}
        <div className={cn(
          'overflow-hidden transition-all duration-200',
          expanded ? 'max-h-40 mt-3 pt-3 border-t border-border' : 'max-h-0'
        )}>
          <div className="space-y-2">
            {report.profile_type && (
              <Badge variant="secondary" className="text-xs">
                {profileLabels[report.profile_type] || report.profile_type}
              </Badge>
            )}
            {report.ai_comment && (
              <div className="flex gap-2">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {report.ai_comment}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
