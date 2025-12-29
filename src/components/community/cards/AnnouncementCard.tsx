import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Megaphone, MessageSquare, Pin, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AnnouncementCardProps {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  isPinned: boolean;
  discussionCount: number;
  onOpenDiscussion: () => void;
}

export function AnnouncementCard({
  title,
  content,
  publishedAt,
  isPinned,
  discussionCount,
  onOpenDiscussion,
}: AnnouncementCardProps) {
  const formattedDate = format(new Date(publishedAt), "d 'de' MMM yyyy • HH:mm", { locale: ptBR });

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-500">
              <Megaphone className="h-5 w-5" />
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
            <Badge variant="outline" className="border-amber-500/50 bg-amber-500/10 text-amber-500 text-xs">
              Anúncio
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{content}</p>
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
