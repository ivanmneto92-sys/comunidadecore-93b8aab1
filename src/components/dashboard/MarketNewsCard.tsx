import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useMarketNews, NewsItem } from "@/hooks/useMarketNews";
import { Newspaper, ExternalLink, AlertCircle, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";

function NewsItemCard({ news, isCarousel = false }: { news: NewsItem; isCarousel?: boolean }) {
  const timeAgo = formatDistanceToNow(new Date(news.datetime * 1000), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <a
      href={news.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block p-4 rounded-xl bg-gradient-to-r from-card to-card/80 border border-border/30 hover:border-primary/40 hover:from-primary/5 hover:to-card/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 ${
        isCarousel ? "min-w-[280px] w-[280px] flex-shrink-0 h-full" : ""
      }`}
    >
      <div className={`flex ${isCarousel ? "flex-col gap-3" : "gap-4"}`}>
        {news.image && (
          <div className="relative flex-shrink-0">
            <img
              src={news.image}
              alt=""
              className={`object-cover ring-1 ring-border/20 group-hover:ring-primary/30 transition-all duration-300 ${
                isCarousel ? "w-full h-32 rounded-lg" : "w-20 h-20 rounded-lg"
              }`}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        )}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className="bg-primary/10 text-primary border-primary/20 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5"
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Forex
            </Badge>
          </div>
          <h4 className={`text-sm font-medium text-foreground leading-snug group-hover:text-primary transition-colors duration-200 ${
            isCarousel ? "line-clamp-3" : "line-clamp-2"
          }`}>
            {news.headline}
          </h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium truncate max-w-[80px]">{news.source}</span>
              <span className="text-border">•</span>
              <span className="truncate">{timeAgo}</span>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 flex-shrink-0" />
          </div>
        </div>
      </div>
    </a>
  );
}

function CarouselDots({ count, selected }: { count: number; selected: number }) {
  return (
    <div className="flex justify-center gap-1.5 mt-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            index === selected 
              ? "w-4 bg-primary" 
              : "w-1.5 bg-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

function NewsCarousel({ news }: { news: NewsItem[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div>
      <div className="overflow-hidden -mx-4 px-4" ref={emblaRef}>
        <div className="flex gap-3">
          {news.map((item) => (
            <NewsItemCard key={item.id} news={item} isCarousel />
          ))}
        </div>
      </div>
      <CarouselDots count={news.length} selected={selectedIndex} />
    </div>
  );
}

function NewsSkeletons({ isCarousel = false }: { isCarousel?: boolean }) {
  if (isCarousel) {
    return (
      <div className="flex gap-3 overflow-hidden -mx-4 px-4">
        {[1, 2].map((i) => (
          <div key={i} className="min-w-[280px] w-[280px] flex-shrink-0 p-4 rounded-xl bg-card/50 border border-border/20">
            <Skeleton className="w-full h-32 rounded-lg mb-3" />
            <Skeleton className="h-4 w-16 rounded-full mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4 p-4 rounded-xl bg-card/50 border border-border/20">
          <Skeleton className="w-20 h-20 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-16 rounded-full" />
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
    <Card className="bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm border-border/50 overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20">
            <Newspaper className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              Notícias de Forex
            </span>
            <span className="text-xs text-muted-foreground font-normal">
              Deslize para ver mais
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Mobile: Carousel */}
        <div className="md:hidden">
          {isLoading && <NewsSkeletons isCarousel />}
          
          {error && (
            <div className="flex items-center gap-3 text-muted-foreground p-4 rounded-xl bg-destructive/5 border border-destructive/10">
              <AlertCircle className="w-5 h-5 text-destructive/70" />
              <span className="text-sm">Não foi possível carregar as notícias</span>
            </div>
          )}
          
          {news && news.length > 0 && <NewsCarousel news={news} />}
          
          {news && news.length === 0 && (
            <div className="text-center py-8">
              <Newspaper className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Nenhuma notícia disponível no momento
              </p>
            </div>
          )}
        </div>

        {/* Desktop: Vertical list */}
        <div className="hidden md:block">
          {isLoading && <NewsSkeletons />}
          
          {error && (
            <div className="flex items-center gap-3 text-muted-foreground p-4 rounded-xl bg-destructive/5 border border-destructive/10">
              <AlertCircle className="w-5 h-5 text-destructive/70" />
              <span className="text-sm">Não foi possível carregar as notícias</span>
            </div>
          )}
          
          {news && news.length > 0 && (
            <div className="space-y-3">
              {news.map((item) => (
                <NewsItemCard key={item.id} news={item} />
              ))}
            </div>
          )}
          
          {news && news.length === 0 && (
            <div className="text-center py-8">
              <Newspaper className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Nenhuma notícia disponível no momento
              </p>
            </div>
          )}
        </div>
        
        <p className="text-[10px] text-muted-foreground/60 mt-4 text-center pt-3 border-t border-border/30">
          Conteúdo apenas para fins educacionais. Não constitui aconselhamento de investimento.
        </p>
      </CardContent>
    </Card>
  );
}
