import { useState, useCallback, useRef } from 'react';
import { Send, BarChart3, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { ImageUpload } from './ImageUpload';
import { MentionPopover } from './MentionPopover';
import { MentionUser } from '@/hooks/useMentions';
import { createMentionNotifications } from '@/lib/mentionUtils';

interface MessageComposerProps {
  channelId: string;
  channelName: string;
  onOpenPollModal: () => void;
  disabled?: boolean;
  onlineUserIds?: string[];
}

export function MessageComposer({ 
  channelId, 
  channelName, 
  onOpenPollModal,
  disabled = false,
  onlineUserIds = []
}: MessageComposerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { startTyping, stopTyping } = useTypingIndicator(channelId);
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  
  // Mention state
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    setMessage(value);
    
    if (value.length > 0) {
      startTyping();
    }

    // Check for @ trigger
    const textBeforeCursor = value.slice(0, cursorPos);
    const atMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (atMatch) {
      setShowMentions(true);
      setMentionQuery(atMatch[1]);
      setMentionStartIndex(cursorPos - atMatch[0].length);
    } else {
      setShowMentions(false);
      setMentionQuery('');
      setMentionStartIndex(-1);
    }
  }, [startTyping]);

  const handleMentionSelect = useCallback((selectedUser: MentionUser) => {
    if (mentionStartIndex === -1) return;
    
    const beforeMention = message.slice(0, mentionStartIndex);
    const afterMention = message.slice(mentionStartIndex + mentionQuery.length + 1);
    const mentionText = `@[${selectedUser.display_name}](${selectedUser.id}) `;
    
    const newMessage = beforeMention + mentionText + afterMention;
    setMessage(newMessage);
    setShowMentions(false);
    setMentionQuery('');
    setMentionStartIndex(-1);
    
    // Focus input and set cursor after mention
    setTimeout(() => {
      if (inputRef.current) {
        const newCursorPos = beforeMention.length + mentionText.length;
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }, [message, mentionQuery, mentionStartIndex]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showMentions && e.key === 'Escape') {
      e.preventDefault();
      setShowMentions(false);
    }
  }, [showMentions]);

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

      const { data, error } = await supabase.from('messages').insert({
        channel_id: channelId,
        user_id: user.id,
        content,
        image_url: imageUrl,
      }).select('id').single();

      if (error) throw error;

      // Create notifications for mentioned users
      const senderName = user.user_metadata?.display_name || 'Alguém';
      await createMentionNotifications({
        content,
        senderId: user.id,
        senderName,
        channelId,
        channelName,
        messageId: data?.id,
      });

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
    <form onSubmit={handleSubmit} className="p-3 border-t border-border shrink-0 bg-background relative">
      {/* Mention popover */}
      <MentionPopover
        open={showMentions}
        query={mentionQuery}
        onlineUserIds={onlineUserIds}
        onSelect={handleMentionSelect}
        onClose={() => setShowMentions(false)}
      />

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
          ref={inputRef}
          value={message}
          onChange={handleInputChange}
          onBlur={stopTyping}
          onKeyDown={handleKeyDown}
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
