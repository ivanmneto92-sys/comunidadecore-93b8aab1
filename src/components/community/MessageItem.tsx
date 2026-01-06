import { useState } from 'react';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  MessageCircle, 
  MoreHorizontal, 
  Pin, 
  Trash2,
  Reply
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ReactionPicker } from './ReactionPicker';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Reaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string | null;
  is_bot_message: boolean;
  is_pinned: boolean;
  reply_count?: number;
  image_url?: string | null;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  reactions?: Reaction[];
}

interface MessageItemProps {
  message: Message;
  onReply?: () => void;
  onOpenThread?: () => void;
  isAdmin?: boolean;
  showActions?: boolean;
}

export function MessageItem({ 
  message, 
  onReply, 
  onOpenThread,
  isAdmin = false,
  showActions = true 
}: MessageItemProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);

  const formatTime = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return format(date, 'HH:mm', { locale: ptBR });
      }
      return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
    } catch {
      return '';
    }
  };

  const handleReaction = async (emoji: string) => {
    if (!user) return;

    try {
      const existingReaction = message.reactions?.find(
        r => r.emoji === emoji && r.hasReacted
      );

      if (existingReaction) {
        await supabase
          .from('message_reactions')
          .delete()
          .eq('message_id', message.id)
          .eq('user_id', user.id)
          .eq('emoji', emoji);
      } else {
        await supabase.from('message_reactions').insert({
          message_id: message.id,
          user_id: user.id,
          emoji,
        });
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  const handlePin = async () => {
    try {
      await supabase
        .from('messages')
        .update({ is_pinned: !message.is_pinned })
        .eq('id', message.id);
      
      toast({
        title: message.is_pinned ? 'Mensagem desafixada' : 'Mensagem fixada',
      });
    } catch (error) {
      console.error('Error pinning message:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await supabase.from('messages').delete().eq('id', message.id);
      toast({ title: 'Mensagem apagada' });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({ variant: 'destructive', title: 'Erro ao apagar mensagem' });
    }
  };

  const isOwnMessage = user?.id === message.user_id;

  return (
    <div 
      className={cn(
        'group relative flex gap-2.5 p-2 rounded-lg transition-colors',
        isHovered && 'bg-muted/50',
        message.is_pinned && 'border-l-2 border-primary bg-primary/5'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0 overflow-hidden">
        {message.profiles?.avatar_url ? (
          <img 
            src={message.profiles.avatar_url} 
            alt="" 
            className="w-full h-full object-cover"
          />
        ) : message.is_bot_message ? (
          '🤖'
        ) : (
          (message.profiles?.display_name?.[0] || '?').toUpperCase()
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-sm">
            {message.is_bot_message 
              ? 'CORE Bot' 
              : message.profiles?.display_name || 'Usuário'}
          </span>
          {message.is_bot_message && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium">
              BOT
            </span>
          )}
          {message.is_pinned && (
            <Pin className="h-3 w-3 text-primary" />
          )}
          <span className="text-[10px] text-muted-foreground">
            {formatTime(message.created_at)}
          </span>
        </div>
        
        <p className="text-sm text-foreground/90 break-words mt-0.5 whitespace-pre-wrap">
          {message.content.replace(/!\[image\]\([^)]+\)/g, '')}
        </p>

        {/* Image display */}
        {message.image_url && (
          <div className="mt-2">
            <img 
              src={message.image_url} 
              alt="Imagem anexada" 
              className="max-w-xs max-h-64 rounded-lg border border-border object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.image_url!, '_blank')}
            />
          </div>
        )}

        {/* Reactions & Reply count */}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {message.reactions?.filter(r => r.count > 0).map((reaction) => (
            <button
              key={reaction.emoji}
              onClick={() => handleReaction(reaction.emoji)}
              className={cn(
                'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors',
                reaction.hasReacted 
                  ? 'bg-primary/20 text-primary border border-primary/30' 
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              )}
            >
              <span>{reaction.emoji}</span>
              <span>{reaction.count}</span>
            </button>
          ))}
          
          {(message.reply_count ?? 0) > 0 && (
            <button
              onClick={onOpenThread}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <MessageCircle className="h-3 w-3" />
              <span>{message.reply_count} {message.reply_count === 1 ? 'resposta' : 'respostas'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Hover actions */}
      {showActions && isHovered && (
        <div className="absolute -top-3 right-2 flex items-center gap-0.5 bg-card border border-border rounded-md shadow-sm p-0.5">
          <ReactionPicker onSelect={handleReaction} />
          
          {onReply && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onReply}
            >
              <Reply className="h-3.5 w-3.5" />
            </Button>
          )}

          {(isOwnMessage || isAdmin) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isAdmin && (
                  <DropdownMenuItem onClick={handlePin}>
                    <Pin className="h-4 w-4 mr-2" />
                    {message.is_pinned ? 'Desafixar' : 'Fixar'}
                  </DropdownMenuItem>
                )}
                {(isOwnMessage || isAdmin) && (
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Apagar
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}
    </div>
  );
}
