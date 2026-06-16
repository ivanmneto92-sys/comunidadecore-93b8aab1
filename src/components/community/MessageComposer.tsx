import { useState, useCallback, useRef } from 'react';
import { Send, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/useAuth';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { ImageUpload } from './ImageUpload';
import { FileUpload, AttachmentMeta } from './FileUpload';
import { MentionPopover } from './MentionPopover';
import { MentionUser } from '@/hooks/useMentions';
import { createMentionNotifications } from '@/lib/mentionUtils';

interface MessageComposerProps {
  channelId: string;
  channelName: string;
  onOpenPollModal: () => void;
  disabled?: boolean;
  onlineUserIds?: string[];
  onSend: (
    content: string,
    imageUrl: string | null,
    attachment: AttachmentMeta | null,
  ) => Promise<{ id?: string; error?: unknown }>;
}

export function MessageComposer({
  channelId,
  channelName,
  onOpenPollModal,
  disabled = false,
  onlineUserIds = [],
  onSend,
}: MessageComposerProps) {
  const { user } = useAuth();
  const { startTyping, stopTyping } = useTypingIndicator(channelId);
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Mention state
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [attachment, setAttachment] = useState<AttachmentMeta | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    setMessage(value);

    if (value.length > 0) {
      startTyping();
    }

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
    if ((!message.trim() && !imageUrl && !attachment) || !user) return;

    stopTyping();

    let content = message.trim();
    if (imageUrl) {
      content = content ? `${content}\n![image](${imageUrl})` : `![image](${imageUrl})`;
    }
    const currentImageUrl = imageUrl;
    const currentAttachment = attachment;

    // Clear input immediately for instant feedback
    setMessage('');
    setImageUrl(null);
    setAttachment(null);

    // Fire to parent (optimistic UI happens there)
    const result = await onSend(content, currentImageUrl, currentAttachment);

    // Notifications only if persisted successfully
    if (result.id && !result.error) {
      const senderName = user.user_metadata?.display_name || 'Alguém';
      createMentionNotifications({
        content,
        senderId: user.id,
        senderName,
        channelId,
        channelName,
        messageId: result.id,
      }).catch((err) => console.error('mention notification error', err));
    }
  };

  if (disabled) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="p-3 border-t border-border shrink-0 bg-background relative">
      <MentionPopover
        open={showMentions}
        query={mentionQuery}
        onlineUserIds={onlineUserIds}
        onSelect={handleMentionSelect}
        onClose={() => setShowMentions(false)}
      />

      {imageUrl && (
        <div className="mb-2 flex items-center gap-2">
          <img src={imageUrl} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-border" />
          <Button type="button" variant="ghost" size="sm" onClick={() => setImageUrl(null)}>
            Remover
          </Button>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <ImageUpload onImageSelected={setImageUrl} disabled={false} />
        <FileUpload attachment={attachment} onAttachmentChange={setAttachment} />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={onOpenPollModal}
              aria-label="Criar enquete"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Criar enquete</TooltipContent>
        </Tooltip>

        <Input
          ref={inputRef}
          value={message}
          onChange={handleInputChange}
          onBlur={stopTyping}
          onKeyDown={handleKeyDown}
          placeholder={`Mensagem em #${channelName.toLowerCase()}`}
          className="flex-1 h-9 text-sm"
        />

        <Button
          type="submit"
          size="icon"
          className="h-9 w-9 shrink-0"
          disabled={!message.trim() && !imageUrl && !attachment}
          aria-label="Enviar mensagem"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
