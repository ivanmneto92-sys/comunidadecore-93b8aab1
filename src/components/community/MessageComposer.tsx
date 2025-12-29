import { useState } from 'react';
import { Send, BarChart3, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user || sending) return;

    setSending(true);
    try {
      const { error } = await supabase.from('messages').insert({
        channel_id: channelId,
        user_id: user.id,
        content: message.trim(),
      });

      if (error) throw error;
      setMessage('');
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
      <div className="flex items-center gap-2">
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
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Mensagem em #${channelName.toLowerCase()}`}
          className="flex-1 h-9 text-sm"
          disabled={sending}
        />

        {/* Send button */}
        <Button 
          type="submit" 
          size="icon" 
          className="h-9 w-9 shrink-0" 
          disabled={!message.trim() || sending}
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
