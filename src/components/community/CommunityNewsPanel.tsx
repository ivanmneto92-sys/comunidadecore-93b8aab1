import { ExternalLink, Newspaper, X } from 'lucide-react';
import { useMarketNews } from '@/hooks/useMarketNews';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CommunityNewsPanelProps {
  onClose?: () => void;
  showCloseButton?: boolean;
}

function NewsItemSkeleton() {
  return (
    <div className="p-3 border-b border-border/50">
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-3 w-3/4 mb-2" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function CommunityNewsPanel({ onClose, showCloseButton = false }: CommunityNewsPanelProps) {
  const { data: news, isLoading, error } = useMarketNews();

  return (
    <div className="h-full flex flex-col bg-card/50">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Newspaper className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Notícias Forex</span>
        </div>
        {showCloseButton && onClose && (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div>
            {Array.from({ length: 5 }).map((_, i) => (
              <NewsItemSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            Não foi possível carregar as notícias
          </div>
        ) : news && news.length > 0 ? (
          <div>
            {news.slice(0, 10).map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 border-b border-border/50 hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0 mt-0.5">
                    FOREX
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                      {item.headline}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                      <span className="truncate">{item.source}</span>
                      <span>•</span>
                      <span className="shrink-0">
                        {formatDistanceToNow(new Date(item.datetime * 1000), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground text-sm">
            Nenhuma notícia disponível
          </div>
        )}
      </ScrollArea>

      {/* Footer disclaimer */}
      <div className="p-2 border-t border-border shrink-0">
        <p className="text-[10px] text-muted-foreground text-center">
          Atualizado a cada 5 min • Não é recomendação de investimento
        </p>
      </div>
    </div>
  );
}
