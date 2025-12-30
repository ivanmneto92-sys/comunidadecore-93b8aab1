import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { useStreakHistory } from '@/hooks/useStreakHistory';
import { Skeleton } from '@/components/ui/skeleton';
import { Flame, Trophy, Calendar, TrendingUp, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function StreakHistory() {
  const navigate = useNavigate();
  const { streaks, bestStreak, currentStreak, totalPositiveDays, isLoading } = useStreakHistory();

  return (
    <AppLayout>
      <div className="px-4 py-6 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Histórico de Streaks</h1>
            <p className="text-xs text-muted-foreground">Seus melhores registros consecutivos</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
            <Skeleton className="h-48" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3 animate-fade-in" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
              {/* Current Streak */}
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="pt-4 pb-3 px-3 text-center">
                  <Flame className="h-5 w-5 text-primary mx-auto mb-1" />
                  <div className="text-2xl font-bold text-primary">{currentStreak}</div>
                  <div className="text-[10px] text-muted-foreground">Atual</div>
                </CardContent>
              </Card>

              {/* Best Streak */}
              <Card className="border-status-warning/30 bg-status-warning/5">
                <CardContent className="pt-4 pb-3 px-3 text-center">
                  <Trophy className="h-5 w-5 text-status-warning mx-auto mb-1" />
                  <div className="text-2xl font-bold text-status-warning">{bestStreak}</div>
                  <div className="text-[10px] text-muted-foreground">Recorde</div>
                </CardContent>
              </Card>

              {/* Total Positive Days */}
              <Card className="border-status-success/30 bg-status-success/5">
                <CardContent className="pt-4 pb-3 px-3 text-center">
                  <TrendingUp className="h-5 w-5 text-status-success mx-auto mb-1" />
                  <div className="text-2xl font-bold text-status-success">{totalPositiveDays}</div>
                  <div className="text-[10px] text-muted-foreground">Dias +</div>
                </CardContent>
              </Card>
            </div>

            {/* Streak List */}
            <div className="space-y-2 animate-fade-in" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
                Melhores Sequências
              </h3>

              {streaks.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Flame className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Nenhuma sequência registrada ainda
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Sequências de 2+ dias positivos aparecerão aqui
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {streaks.map((streak, index) => (
                    <Card 
                      key={`${streak.startDate}-${streak.endDate}`}
                      className={cn(
                        'transition-all',
                        index === 0 && 'border-status-warning/30 bg-status-warning/5'
                      )}
                    >
                      <CardContent className="py-3 px-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {/* Rank */}
                            <div className={cn(
                              'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                              index === 0 ? 'bg-status-warning/20 text-status-warning' : 'bg-secondary text-muted-foreground'
                            )}>
                              {index === 0 ? <Trophy className="h-3.5 w-3.5" /> : index + 1}
                            </div>

                            {/* Info */}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-foreground">
                                  {streak.days} dias
                                </span>
                                <span className="text-xs text-status-success font-medium">
                                  +{streak.totalPnl.toFixed(2)}%
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {format(parseISO(streak.startDate), "dd MMM", { locale: ptBR })} - {format(parseISO(streak.endDate), "dd MMM yyyy", { locale: ptBR })}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Flame indicator */}
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: Math.min(streak.days, 5) }).map((_, i) => (
                              <Flame 
                                key={i} 
                                className={cn(
                                  'h-3.5 w-3.5',
                                  index === 0 ? 'text-status-warning' : 'text-primary/50'
                                )} 
                              />
                            ))}
                            {streak.days > 5 && (
                              <span className="text-[10px] text-muted-foreground ml-0.5">+{streak.days - 5}</span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <p className="text-center text-xs text-muted-foreground pt-2">
              Streaks são sequências de dias consecutivos com retorno positivo
            </p>
          </>
        )}
      </div>
    </AppLayout>
  );
}
