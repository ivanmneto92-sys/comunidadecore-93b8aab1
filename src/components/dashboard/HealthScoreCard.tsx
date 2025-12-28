import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HealthScoreCardProps {
  score: number;
  status: 'success' | 'warning' | 'danger';
}

const statusConfig = {
  success: {
    label: 'Estável',
    emoji: '🟢',
    color: 'text-status-success',
    bgColor: 'bg-status-success/10',
  },
  warning: {
    label: 'Atenção',
    emoji: '🟡',
    color: 'text-status-warning',
    bgColor: 'bg-status-warning/10',
  },
  danger: {
    label: 'Risco',
    emoji: '🔴',
    color: 'text-status-danger',
    bgColor: 'bg-status-danger/10',
  },
};

export function HealthScoreCard({ score, status }: HealthScoreCardProps) {
  const config = statusConfig[status];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Copy Health</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-3xl font-bold">{score}</span>
            <span className="text-xs text-muted-foreground">de 100</span>
          </div>
          <div className={cn('flex items-center gap-2 rounded-full px-3 py-1', config.bgColor)}>
            <span className="text-sm">{config.emoji}</span>
            <span className={cn('text-sm font-medium', config.color)}>
              {config.label}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
