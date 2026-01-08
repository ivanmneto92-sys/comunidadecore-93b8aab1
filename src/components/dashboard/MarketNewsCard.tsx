import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarketNews, NewsItem } from "@/hooks/useMarketNews";
import { Newspaper, ExternalLink, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

function NewsItemCard({ news }: { news: NewsItem }) {
  const timeAgo = formatDistanceToNow(new Date(news.datetime * 1000), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <a
      href={news.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
    >
      {news.image && (
        <img
          src={news.image}
          alt=""
          className="w-16 h-16 rounded-md object-cover flex-shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {news.headline}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">{news.source}</span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
      </div>
      <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </a>
  );
}

function NewsSkeletons() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3 p-3">
          <Skeleton className="w-16 h-16 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MarketNewsCard() {
  const { data: news, isLoading, error } = useMarketNews();

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Newspaper className="w-5 h-5 text-primary" />
          Notícias de Forex
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <NewsSkeletons />}
        
        {error && (
          <div className="flex items-center gap-2 text-muted-foreground p-4">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">Não foi possível carregar as notícias</span>
          </div>
        )}
        
        {news && news.length > 0 && (
          <div className="space-y-2">
            {news.map((item) => (
              <NewsItemCard key={item.id} news={item} />
            ))}
          </div>
        )}
        
        {news && news.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma notícia disponível no momento
          </p>
        )}
        
        <p className="text-[10px] text-muted-foreground mt-4 text-center">
          Conteúdo apenas para fins educacionais. Não constitui aconselhamento de investimento.
        </p>
      </CardContent>
    </Card>
  );
}
