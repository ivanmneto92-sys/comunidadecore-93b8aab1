import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, MessageSquare, Pin, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RiskReadingCardProps {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  isPinned: boolean;
  discussionCount: number;
  metadata: {
    summary?: string;
    keyPoints?: string[];
    impact?: string;
  };
  onOpenDiscussion: () => void;
}

export function RiskReadingCard({
  title,
  content,
  publishedAt,
  isPinned,
  discussionCount,
  metadata,
  onOpenDiscussion,
}: RiskReadingCardProps) {
  const formattedDate = format(new Date(publishedAt), "d 'de' MMM yyyy", { locale: ptBR });

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/20 text-sky-500">
              <Brain className="h-5 w-5" />
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
            <Badge variant="outline" className="border-sky-500/50 bg-sky-500/10 text-sky-500 text-xs">
              Risco
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-4">
        {/* Summary */}
        {(metadata.summary || content) && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-sky-500" />
              Resumo do Cenário
            </h4>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {metadata.summary || content}
            </p>
          </div>
        )}

        {/* Key Points */}
        {metadata.keyPoints && metadata.keyPoints.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Pontos-Chave:</h4>
            <ul className="space-y-1.5">
              {metadata.keyPoints.map((point, index) => (
                <li key={index} className="text-sm text-foreground/80 flex items-start gap-2">
                  <span className="text-sky-500 mt-1">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Impact */}
        {metadata.impact && (
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-amber-500 mb-1">Impacto Esperado</p>
                <p className="text-sm text-foreground/80 leading-relaxed">{metadata.impact}</p>
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
          Abrir Discussão
        </Button>
      </CardFooter>
    </Card>
  );
}
