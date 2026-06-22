import { useRef, useState } from 'react';
import { Paperclip, Mic, X, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface AttachmentMeta {
  path: string; // storage object path inside chat-files bucket
  name: string;
  type: string;
  size: number;
}

interface FileUploadProps {
  attachment: AttachmentMeta | null;
  onAttachmentChange: (att: AttachmentMeta | null) => void;
  disabled?: boolean;
}

const MAX_SIZE = 25 * 1024 * 1024; // 25MB

const ACCEPT =
  'application/pdf,audio/*,application/zip,application/msword,' +
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document,' +
  'application/vnd.ms-excel,' +
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,' +
  'text/plain,text/csv';

export function FileUpload({ attachment, onAttachmentChange, disabled }: FileUploadProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File) => {
    if (!user) return;
    if (file.size > MAX_SIZE) {
      toast({ variant: 'destructive', title: 'Arquivo grande demais', description: 'Limite de 25MB.' });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from('chat-files').upload(path, file, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });
      if (error) throw error;
      onAttachmentChange({
        path,
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
      });
    } catch (err) {
      console.error('upload error', err);
      toast({ variant: 'destructive', title: 'Falha ao enviar arquivo' });
    } finally {
      setUploading(false);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) void uploadFile(file);
  };

  const clear = () => onAttachmentChange(null);

  if (attachment) {
    const isAudio = attachment.type.startsWith('audio/');
    return (
      <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-muted/60 border border-border text-xs max-w-[200px]">
        {isAudio ? <Mic className="h-3.5 w-3.5 shrink-0" /> : <FileText className="h-3.5 w-3.5 shrink-0" />}
        <span className="truncate flex-1" title={attachment.name}>{attachment.name}</span>
        <button
          type="button"
          onClick={clear}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Remover anexo"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleFile}
        className="hidden"
        disabled={disabled || uploading}
      />
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        capture="user"
        onChange={handleFile}
        className="hidden"
        disabled={disabled || uploading}
      />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button aria-label="Ação"
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            aria-label="Anexar arquivo"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Anexar arquivo (PDF, áudio, doc)</TooltipContent>
      </Tooltip>
    </>
  );
}
