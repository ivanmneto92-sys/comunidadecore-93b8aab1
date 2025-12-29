import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, MessageSquare, Pin, Calendar, Lightbulb } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DailyResultPostCardProps {
  id: string;
  title: string;
  publishedAt: string;
  isPinned: boolean;
  discussionCount: number;
  metadata: {
    pnl?: number;
    trades?: number;
    profile?: string;
    status?: 'stable' | 'attention' | 'risk';
    aiComment?: string;
  };
  onOpenDiscussion: () => void;
}

const statusConfig = {
  stable: { label: 'Estável', color: 'text-emerald-500', bg: 'bg-emerald-500/20', dot: '🟢' },
  attention: { label: 'Atenção', color: 'text-amber-500', bg: 'bg-amber-500/20', dot: '🟡' },
  risk: { label: 'Risco', color: 'text-red-500', bg: 'bg-red-500/20', dot: '🔴' },
};

const profileLabels: Record<string, string> = {
  defensive: 'Defensivo',
  normal: 'Normal',
  aggressive: 'Agressivo',
};

export function DailyResultPostCard({
  title,
  publishedAt,
  isPinned,
  discussionCount,
  metadata,
  onOpenDiscussion,
}: DailyResultPostCardProps) {
  const formattedDate = format(new Date(publishedAt), "d 'de' MMM yyyy", { locale: ptBR });
  const status = metadata.status || 'stable';
  const statusInfo = statusConfig[status];

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-500">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground">CORE</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isPinned && (
              <Pin className="h-4 w-4 text-primary" />
            )}
            <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/10 text-emerald-500 text-xs">
              Resultado
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-4">
        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className={`text-xl font-bold ${metadata.pnl && metadata.pnl > 0 ? 'text-emerald-500' : metadata.pnl && metadata.pnl < 0 ? 'text-red-500' : 'text-foreground'}`}>
              {metadata.pnl !== undefined ? `${metadata.pnl > 0 ? '+' : ''}${metadata.pnl.toFixed(2)}%` : '--'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">PnL</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-xl font-bold text-foreground">{metadata.trades ?? '--'}</p>
            <p className="text-xs text-muted-foreground mt-1">Operações</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-xl font-bold text-foreground">
              {metadata.profile ? profileLabels[metadata.profile] || metadata.profile : '--'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Perfil</p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <span className={`text-sm font-medium ${statusInfo.color}`}>
            {statusInfo.dot} {statusInfo.label}
          </span>
        </div>

        {/* AI Comment */}
        {metadata.aiComment && (
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-primary mb-1">Comentário CORE AI</p>
                <p className="text-sm text-foreground/80 leading-relaxed">{metadata.aiComment}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-border/30 pt-4">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            {discussionCount} comentários
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={onOpenDiscussion}>
          Ver Discussão
        </Button>
      </CardFooter>
    </Card>
  );
}
