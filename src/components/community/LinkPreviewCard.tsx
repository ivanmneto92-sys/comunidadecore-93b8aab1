import { useEffect, useState } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Preview {
  url: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  site_name: string | null;
}

const memCache = new Map<string, Preview | null>();

export function LinkPreviewCard({ url }: { url: string }) {
  const [preview, setPreview] = useState<Preview | null>(() => memCache.get(url) ?? null);
  const [loading, setLoading] = useState(!memCache.has(url));

  useEffect(() => {
    if (memCache.has(url)) {
      setPreview(memCache.get(url) ?? null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        // Try local cache first
        const { data: cached } = await supabase
          .from('link_previews')
          .select('*')
          .eq('url', url)
          .maybeSingle();

        if (cached && !cancelled) {
          memCache.set(url, cached as Preview);
          setPreview(cached as Preview);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.functions.invoke('og-preview', {
          body: { url },
        });
        if (cancelled) return;
        if (error || !data || data.error) {
          memCache.set(url, null);
          setPreview(null);
        } else {
          memCache.set(url, data as Preview);
          setPreview(data as Preview);
        }
      } catch {
        if (!cancelled) {
          memCache.set(url, null);
          setPreview(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (loading) {
    return (
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground border-l-2 border-primary/40 pl-2 py-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        Carregando preview…
      </div>
    );
  }

  if (!preview || (!preview.title && !preview.description && !preview.image_url)) {
    return null;
  }

  let host = preview.site_name || '';
  try { host = new URL(preview.url).hostname.replace(/^www\./, ''); } catch {}

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 flex gap-3 max-w-md border border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors overflow-hidden"
    >
      {preview.image_url && (
        <img
          src={preview.image_url}
          alt=""
          loading="lazy"
          className="w-20 h-20 object-cover shrink-0"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
      )}
      <div className="flex-1 min-w-0 p-2">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase">
          <ExternalLink className="h-2.5 w-2.5" />
          <span className="truncate">{host}</span>
        </div>
        {preview.title && (
          <div className="text-sm font-medium text-foreground line-clamp-2 mt-0.5">
            {preview.title}
          </div>
        )}
        {preview.description && (
          <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {preview.description}
          </div>
        )}
      </div>
    </a>
  );
}
