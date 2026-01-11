import { useState, useCallback } from 'react';
import { Search, X, Loader2, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  content: string;
  created_at: string;
  channel_id: string;
  user_id: string | null;
  is_bot_message: boolean;
  profiles?: {
    display_name: string | null;
  } | null;
  channels?: {
    name: string;
    slug: string;
  } | null;
}

interface MessageSearchProps {
  channelId?: string;
  onResultClick?: (messageId: string, channelSlug: string) => void;
  onClose?: () => void;
}

export function MessageSearch({ channelId, onResultClick, onClose }: MessageSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      let searchQuery = supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          channel_id,
          user_id,
          is_bot_message,
          channels:channel_id (name, slug)
        `)
        .ilike('content', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (channelId) {
        searchQuery = searchQuery.eq('channel_id', channelId);
      }

      const { data, error } = await searchQuery;

      if (error) throw error;
      
      // Fetch profiles for each message
      const userIds = [...new Set((data || []).filter(m => m.user_id).map(m => m.user_id))];
      
      let profilesMap: Record<string, { display_name: string | null }> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', userIds);
        
        profilesMap = (profiles || []).reduce((acc, p) => {
          acc[p.id] = { display_name: p.display_name };
          return acc;
        }, {} as Record<string, { display_name: string | null }>);
      }
      
      const enrichedData = (data || []).map(msg => ({
        ...msg,
        profiles: msg.user_id ? profilesMap[msg.user_id] || null : null
      }));
      
      setResults(enrichedData);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [query, channelId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      onClose?.();
    }
  };

  const highlightQuery = (text: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? (
        <mark key={i} className="bg-primary/30 text-foreground rounded px-0.5">
          {part}
        </mark>
      ) : part
    );
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar mensagens..."
            className="pl-9 pr-9"
            autoFocus
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={() => {
                setQuery('');
                setResults([]);
                setHasSearched(false);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {channelId ? 'Buscando neste canal' : 'Buscando em todos os canais'}
        </p>
      </div>

      <ScrollArea className="flex-1">
        {isSearching ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : hasSearched && results.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhuma mensagem encontrada
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Tente buscar por outros termos
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {results.map((result) => (
              <button
                key={result.id}
                onClick={() => onResultClick?.(result.id, result.channels?.slug || '')}
                className={cn(
                  'w-full text-left p-3 rounded-lg transition-colors',
                  'hover:bg-muted/50 focus:bg-muted/50 focus:outline-none'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">
                    {result.is_bot_message 
                      ? 'CORE Bot' 
                      : result.profiles?.display_name || 'Usuário'}
                  </span>
                  {!channelId && result.channels && (
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      #{result.channels.name}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {formatDate(result.created_at)}
                  </span>
                </div>
                <p className="text-sm text-foreground/80 line-clamp-2">
                  {highlightQuery(result.content.slice(0, 200))}
                </p>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
