import { useState, useRef, useEffect } from 'react';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  MessageCircle,
  MoreHorizontal,
  Pin,
  Trash2,
  Reply,
  Shield,
  ShieldCheck,
  Pencil,
  X,
  Check,
  Loader2,
  AlertCircle,
  RotateCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ReactionPicker } from './ReactionPicker';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useAvatar, renderAvatarSvg } from '@/hooks/useAvatar';
import { renderMarkdown } from '@/lib/markdownUtils';
import { FileAttachmentCard } from './FileAttachmentCard';
import { LinkPreviewCard } from './LinkPreviewCard';

interface Reaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  edited_at?: string | null;
  user_id: string | null;
  is_bot_message: boolean;
  is_pinned: boolean;
  reply_count?: number;
  image_url?: string | null;
  file_url?: string | null;
  file_name?: string | null;
  file_type?: string | null;
  file_size?: number | null;
  link_preview_url?: string | null;
  status?: 'sending' | 'sent' | 'failed';
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
    avatar_id: string | null;
  } | null;
  reactions?: Reaction[];
}

interface MessageItemProps {
  message: Message;
  onReply?: () => void;
  onOpenThread?: () => void;
  isAdmin?: boolean;
  showActions?: boolean;
  authorRole?: 'admin' | 'moderator' | null;
  onRetry?: () => void;
  onDiscard?: () => void;
}

export function MessageItem({
  message,
  onReply,
  onOpenThread,
  isAdmin = false,
  showActions = true,
  authorRole,
  onRetry,
  onDiscard,
}: MessageItemProps) {
  const isOptimistic = message.status === 'sending' || message.status === 'failed';

  const { user } = useAuth();
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Avatar hook para renderizar SVG
  const { svg: avatarSvg } = useAvatar(
    message.profiles?.avatar_id, 
    message.profiles?.display_name || undefined
  );

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

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
      toast({
        variant: 'destructive',
        title: 'Erro ao reagir',
        description: 'Não foi possível adicionar sua reação.',
      });
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
      toast({
        variant: 'destructive',
        title: 'Erro ao fixar mensagem',
        description: 'Tente novamente.',
      });
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

  const handleEdit = () => {
    setEditContent(message.content);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(message.content);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim() || editContent === message.content) {
      handleCancelEdit();
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('messages')
        .update({ 
          content: editContent.trim(),
          edited_at: new Date().toISOString()
        })
        .eq('id', message.id);

      if (error) throw error;
      
      toast({ title: 'Mensagem editada' });
      setIsEditing(false);
    } catch (error) {
      console.error('Error editing message:', error);
      toast({ variant: 'destructive', title: 'Erro ao editar mensagem' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const isOwnMessage = user?.id === message.user_id;

  // Clean content (remove image markdown) for rendering
  const cleanContent = message.content.replace(/!\[image\]\([^)]+\)/g, '').trim();

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
        {message.is_bot_message ? (
          '🤖'
        ) : (
          renderAvatarSvg(avatarSvg, 'w-full h-full')
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
          {!message.is_bot_message && authorRole === 'admin' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 font-medium flex items-center gap-0.5">
              <Shield className="h-2.5 w-2.5" />
              ADMIN
            </span>
          )}
          {!message.is_bot_message && authorRole === 'moderator' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-500 font-medium flex items-center gap-0.5">
              <ShieldCheck className="h-2.5 w-2.5" />
              MOD
            </span>
          )}
          {message.is_pinned && (
            <Pin className="h-3 w-3 text-primary" />
          )}
          <span className="text-[10px] text-muted-foreground">
            {formatTime(message.created_at)}
          </span>
          {message.edited_at && (
            <span className="text-[10px] text-muted-foreground italic">
              (editado)
            </span>
          )}
          {message.status === 'sending' && (
            <span className="text-[10px] text-muted-foreground italic flex items-center gap-1">
              <Loader2 className="h-2.5 w-2.5 animate-spin" />
              enviando…
            </span>
          )}
          {message.status === 'sent' && (
            <Check className="h-3 w-3 text-muted-foreground/60" aria-label="Enviada" />
          )}
          {message.status === 'failed' && (
            <span className="text-[10px] text-destructive flex items-center gap-1.5">
              <AlertCircle className="h-2.5 w-2.5" />
              Falhou
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="underline hover:text-destructive/80 inline-flex items-center gap-0.5"
                >
                  <RotateCw className="h-2.5 w-2.5" /> Reenviar
                </button>
              )}
              {onDiscard && (
                <button
                  type="button"
                  onClick={onDiscard}
                  className="underline hover:text-destructive/80"
                >
                  Descartar
                </button>
              )}
            </span>
          )}

        </div>
        
        {isEditing ? (
          <div className="mt-1 flex items-center gap-2">
            <Input
              ref={inputRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSaving}
              className="flex-1 text-sm h-8"
            />
            <Button aria-label="Confirmar"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-primary"
              onClick={handleSaveEdit}
              disabled={isSaving}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button aria-label="Ação"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              onClick={handleCancelEdit}
              disabled={isSaving}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="text-sm text-foreground/90 break-words mt-0.5 whitespace-pre-wrap">
            {renderMarkdown(cleanContent)}
          </div>
        )}

        {/* Image display */}
        {message.image_url && !isEditing && (
          <div className="mt-2">
            <img 
              src={message.image_url} 
              alt="Imagem anexada" 
              loading="lazy"
              decoding="async"
              className="max-w-xs max-h-64 rounded-lg border border-border object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.image_url!, '_blank')}
            />
          </div>
        )}

        {/* File attachment (PDF, audio, etc.) */}
        {message.file_url && !isEditing && (
          <FileAttachmentCard
            path={message.file_url}
            name={message.file_name || 'Arquivo'}
            type={message.file_type || 'application/octet-stream'}
            size={message.file_size}
          />
        )}

        {/* Link preview (OG tags) */}
        {message.link_preview_url && !isEditing && !message.image_url && !message.file_url && (
          <LinkPreviewCard url={message.link_preview_url} />
        )}


        {/* Reactions & Reply count */}
        {!isEditing && (
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
        )}
      </div>

      {/* Hover actions - hidden for optimistic/failed messages */}
      {showActions && !isOptimistic && (isHovered || isDropdownOpen) && !isEditing && (
        <div className="absolute -top-3 right-2 flex items-center gap-0.5 bg-card border border-border rounded-md shadow-sm p-0.5">
          <ReactionPicker onSelect={handleReaction} />
          
          {onReply && (
            <Button aria-label="Responder"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onReply}
            >
              <Reply className="h-3.5 w-3.5" />
            </Button>
          )}

          {(isOwnMessage || isAdmin) && (
            <DropdownMenu onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Opções da mensagem">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwnMessage && !message.is_bot_message && (
                  <DropdownMenuItem onClick={handleEdit}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem onClick={handlePin}>
                    <Pin className="h-4 w-4 mr-2" />
                    {message.is_pinned ? 'Desafixar' : 'Fixar'}
                  </DropdownMenuItem>
                )}
                {(isOwnMessage || isAdmin) && (
                  <DropdownMenuItem 
                    onClick={() => setIsDeleteDialogOpen(true)}
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

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar mensagem?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. A mensagem será permanentemente removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Apagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
