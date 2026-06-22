import { ArrowLeft, Newspaper, ExternalLink, RefreshCw } from 'lucide-react';
import { useMarketNews } from '@/hooks/useMarketNews';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Channel {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface NewsChannelViewProps {
  channel: Channel;
  onGoBack?: () => void;
  onlineCount: number;
}

function NewsItemSkeleton() {
  return (
    <div className="flex gap-4 p-4">
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

function getDateLabel(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  if (isToday(date)) return 'Hoje';
  if (isYesterday(date)) return 'Ontem';
  return format(date, "d 'de' MMMM", { locale: ptBR });
}

export function NewsChannelView({ channel, onGoBack, onlineCount }: NewsChannelViewProps) {
  const { data: news, isLoading, error, refetch, isFetching } = useMarketNews();

  // Group news by date
  const groupedNews = news?.reduce((acc, item) => {
    const label = getDateLabel(item.datetime);
    if (!acc[label]) acc[label] = [];
    acc[label].push(item);
    return acc;
  }, {} as Record<string, typeof news>) ?? {};

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-12 border-b border-border shrink-0">
        {onGoBack && (
          <Button aria-label="Voltar"
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:hidden"
            onClick={onGoBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <Newspaper className="h-5 w-5 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-sm truncate">{channel.name}</h2>
        </div>
        <Button aria-label="Recarregar"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
        </Button>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-status-success" />
          <span>{onlineCount} online</span>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="py-4">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <NewsItemSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Newspaper className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Não foi possível carregar as notícias</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
                Tentar novamente
              </Button>
            </div>
          ) : news && news.length > 0 ? (
            Object.entries(groupedNews).map(([dateLabel, items]) => (
              <div key={dateLabel}>
                {/* Date Divider */}
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs font-medium text-muted-foreground">{dateLabel}</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                {/* News Items */}
                {items?.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-4 px-4 py-3 hover:bg-muted/50 transition-colors group"
                  >
                    {/* Source Avatar */}
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Newspaper className="h-5 w-5 text-primary" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-foreground">{item.source}</span>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[10px] px-1.5 py-0",
                            item.category === 'CRYPTO' && "border-orange-500/50 text-orange-400",
                            item.category === 'ÍNDICES' && "border-blue-500/50 text-blue-400",
                            item.category === 'FOREX' && "border-emerald-500/50 text-emerald-400"
                          )}
                        >
                          {item.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(item.datetime * 1000), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed group-hover:text-primary transition-colors">
                        {item.headline}
                      </p>
                      {item.summary && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {item.summary}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="h-3 w-3" />
                        <span>Abrir artigo completo</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Newspaper className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Nenhuma notícia disponível</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-border shrink-0">
        <p className="text-[10px] text-muted-foreground text-center">
          Atualizado automaticamente a cada 5 minutos • Fonte: Finnhub • Não é recomendação de investimento
        </p>
      </div>
    </div>
  );
}
