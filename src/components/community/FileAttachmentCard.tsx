import { useEffect, useState } from 'react';
import { Download, FileText, FileAudio, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

interface FileAttachmentCardProps {
  path: string;
  name: string;
  type: string;
  size?: number | null;
}

function formatSize(bytes?: number | null) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileAttachmentCard({ path, name, type, size }: FileAttachmentCardProps) {
  const isAudio = type?.startsWith('audio/');
  const isPdf = type === 'application/pdf';
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);

  // For audio we need URL immediately; for others fetch on demand.
  useEffect(() => {
    if (!isAudio) return;
    let active = true;
    (async () => {
      const { data } = await supabase.storage.from('chat-files').createSignedUrl(path, 3600);
      if (active && data?.signedUrl) setSignedUrl(data.signedUrl);
    })();
    return () => { active = false; };
  }, [isAudio, path]);

  const handleOpen = async () => {
    if (signedUrl) {
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    setLoadingUrl(true);
    const { data, error } = await supabase.storage.from('chat-files').createSignedUrl(path, 3600);
    setLoadingUrl(false);
    if (error || !data?.signedUrl) return;
    setSignedUrl(data.signedUrl);
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
  };

  if (isAudio) {
    return (
      <div className="mt-2 rounded-lg border border-border bg-muted/40 p-2.5 max-w-sm">
        <div className="flex items-center gap-2 mb-1.5 text-xs text-muted-foreground">
          <FileAudio className="h-3.5 w-3.5" />
          <span className="truncate flex-1" title={name}>{name}</span>
          {size != null && <span>{formatSize(size)}</span>}
        </div>
        {signedUrl ? (
          <audio controls src={signedUrl} className="w-full h-9" preload="metadata" />
        ) : (
          <div className="h-9 flex items-center justify-center text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> Carregando áudio…
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleOpen}
      className="mt-2 flex items-center gap-3 p-2.5 rounded-lg border border-border bg-muted/40 hover:bg-muted/70 transition-colors max-w-sm text-left w-full"
    >
      <div className="h-10 w-10 rounded-md bg-primary/15 text-primary flex items-center justify-center shrink-0">
        <FileText className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" title={name}>{name}</p>
        <p className="text-[11px] text-muted-foreground">
          {isPdf ? 'PDF' : (type?.split('/')?.[1]?.toUpperCase() || 'Arquivo')}
          {size != null && ` · ${formatSize(size)}`}
        </p>
      </div>
      {loadingUrl ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <Download className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  );
}
