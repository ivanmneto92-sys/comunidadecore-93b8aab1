import { useState, useCallback } from 'react';
import { Send, BarChart3, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { ImageUpload } from './ImageUpload';

interface MessageComposerProps {
  channelId: string;
  channelName: string;
  onOpenPollModal: () => void;
  disabled?: boolean;
}

export function MessageComposer({ 
  channelId, 
  channelName, 
  onOpenPollModal,
  disabled = false 
}: MessageComposerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { startTyping, stopTyping } = useTypingIndicator(channelId);
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (e.target.value.length > 0) {
      startTyping();
    }
  }, [startTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && !imageUrl) || !user || sending) return;

    setSending(true);
    stopTyping();
    
    try {
      let content = message.trim();
      
      // Se tiver imagem, adicionar como link no conteúdo
      if (imageUrl) {
        content = content ? `${content}\n![image](${imageUrl})` : `![image](${imageUrl})`;
      }

      const { error } = await supabase.from('messages').insert({
        channel_id: channelId,
        user_id: user.id,
        content,
        image_url: imageUrl,
      });

      if (error) throw error;
      setMessage('');
      setImageUrl(null);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ variant: 'destructive', title: 'Erro ao enviar mensagem' });
    } finally {
      setSending(false);
    }
  };

  if (disabled) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="p-3 border-t border-border shrink-0 bg-background">
      {/* Preview da imagem */}
      {imageUrl && (
        <div className="mb-2 flex items-center gap-2">
          <img src={imageUrl} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-border" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setImageUrl(null)}
          >
            Remover
          </Button>
        </div>
      )}
      
      <div className="flex items-center gap-2">
        {/* Image upload button */}
        <ImageUpload 
          onImageSelected={setImageUrl} 
          disabled={sending}
        />

        {/* Poll button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={onOpenPollModal}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Criar enquete</TooltipContent>
        </Tooltip>

        {/* Input */}
        <Input
          value={message}
          onChange={handleInputChange}
          onBlur={stopTyping}
          placeholder={`Mensagem em #${channelName.toLowerCase()}`}
          className="flex-1 h-9 text-sm"
          disabled={sending}
        />

        {/* Send button */}
        <Button 
          type="submit" 
          size="icon" 
          className="h-9 w-9 shrink-0" 
          disabled={(!message.trim() && !imageUrl) || sending}
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </form>
  );
}
