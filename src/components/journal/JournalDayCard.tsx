import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp, TrendingDown, Target, Smile, Meh, Frown, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { JournalEntry } from '@/hooks/useJournal';

interface JournalDayCardProps {
  entry: JournalEntry;
  onClick?: () => void;
}

export function JournalDayCard({ entry, onClick }: JournalDayCardProps) {
  const isPositive = entry.pnl_percent > 0;
  const isNegative = entry.pnl_percent < 0;
  const winRate = entry.trades_count > 0 
    ? Math.round((entry.wins / entry.trades_count) * 100) 
    : 0;

  const EmotionIcon = entry.emotional_state === 'good' 
    ? Smile 
    : entry.emotional_state === 'stressed' 
      ? Frown 
      : Meh;

  return (
    <Card 
      className={cn(
        "p-3 cursor-pointer transition-colors hover:bg-accent",
        "border-l-4",
        isPositive && "border-l-success",
        isNegative && "border-l-destructive",
        !isPositive && !isNegative && "border-l-muted-foreground"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Date */}
          <div className="text-center min-w-[40px]">
            <p className="text-lg font-bold leading-none">
              {format(parseISO(entry.date), 'd')}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase">
              {format(parseISO(entry.date), 'EEE', { locale: ptBR })}
            </p>
          </div>

          {/* Main stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : isNegative ? (
                <TrendingDown className="h-4 w-4 text-destructive" />
              ) : (
                <Target className="h-4 w-4 text-muted-foreground" />
              )}
              <span className={cn(
                "font-semibold",
                isPositive && "text-success",
                isNegative && "text-destructive"
              )}>
                {isPositive ? '+' : ''}{entry.pnl_percent.toFixed(1)}%
              </span>
            </div>

            <div className="text-xs text-muted-foreground">
              <span className="text-success">{entry.wins}W</span>
              {' / '}
              <span className="text-destructive">{entry.losses}L</span>
            </div>

            {entry.trades_count > 0 && (
              <div className="text-xs text-muted-foreground">
                {winRate}% WR
              </div>
            )}
          </div>
        </div>

        {/* Right side indicators */}
        <div className="flex items-center gap-2">
          {entry.emotional_state && (
            <EmotionIcon className={cn(
              "h-4 w-4",
              entry.emotional_state === 'good' && "text-success",
              entry.emotional_state === 'stressed' && "text-destructive",
              entry.emotional_state === 'neutral' && "text-muted-foreground"
            )} />
          )}
          {entry.followed_plan ? (
            <CheckCircle className="h-4 w-4 text-success" />
          ) : (
            <XCircle className="h-4 w-4 text-destructive" />
          )}
        </div>
      </div>

      {/* Notes preview */}
      {entry.notes && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-1 pl-[52px]">
          {entry.notes}
        </p>
      )}
    </Card>
  );
}
