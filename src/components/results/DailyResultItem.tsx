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
          <div className={cn('w-1 h-12 rounded-full shrink-0', config.color)} />

          {/* Date and stats */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold capitalize">{formattedDate}</p>
            <p className="text-[11px] text-muted-foreground">
              {report.trades_count} ops · {Number(report.win_rate).toFixed(0)}% win
            </p>
          </div>

          {/* PnL dominante */}
          <div className="flex items-center gap-1.5 shrink-0">
            <p className={cn(
              'text-lg font-bold tabular-nums leading-none',
              isPositive ? 'text-emerald-500' : 'text-destructive'
            )}>
              {isPositive ? '+' : ''}{Number(report.pnl_percent).toFixed(2)}%
            </p>
            <ChevronDown className={cn(
              'h-4 w-4 text-muted-foreground transition-transform duration-200',
              expanded && 'rotate-180'
            )} />
          </div>
        </div>


        {/* Expanded content */}
        <div className={cn(
          'overflow-hidden transition-all duration-200',
          expanded ? 'max-h-60 mt-3 pt-3 border-t border-border' : 'max-h-0'
        )}>
          <div className="space-y-3">
            {/* Métricas do dia */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-lg p-2">
                <p className="text-[10px] text-muted-foreground uppercase">Operações</p>
                <p className="text-sm font-semibold">{report.trades_count}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-2">
                <p className="text-[10px] text-muted-foreground uppercase">Win Rate</p>
                <p className="text-sm font-semibold">{Number(report.win_rate).toFixed(0)}%</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-2">
                <p className="text-[10px] text-muted-foreground uppercase">Resultado</p>
                <p className={cn(
                  'text-sm font-semibold',
                  isPositive ? 'text-emerald-500' : 'text-destructive'
                )}>
                  {isPositive ? '+' : ''}{Number(report.pnl_percent).toFixed(2)}%
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-2">
                <p className="text-[10px] text-muted-foreground uppercase">Drawdown</p>
                <p className="text-sm font-semibold">{Number(report.drawdown_percent).toFixed(2)}%</p>
              </div>
            </div>

            {/* Profile badge */}
            {report.profile_type && (
              <Badge variant="secondary" className="text-xs">
                Perfil: {profileLabels[report.profile_type] || report.profile_type}
              </Badge>
            )}

            {/* AI comment */}
            {report.ai_comment && (
              <div className="flex gap-2 bg-primary/5 rounded-lg p-2">
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
