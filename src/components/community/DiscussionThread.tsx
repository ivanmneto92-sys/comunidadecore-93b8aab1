import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThumbsUp, Award, CornerDownRight, MoreHorizontal, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Discussion {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  is_highlighted: boolean;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  reactions?: {
    like: number;
    useful: number;
    user_reacted_like: boolean;
    user_reacted_useful: boolean;
  };
  replies?: Discussion[];
}

interface DiscussionThreadProps {
  discussions: Discussion[];
  onReply: (parentId: string) => void;
  onRefresh: () => void;
  isAdmin: boolean;
}

export function DiscussionThread({ discussions, onReply, onRefresh, isAdmin }: DiscussionThreadProps) {
  const { user } = useAuth();

  const handleReaction = async (discussionId: string, reactionType: 'like' | 'useful', hasReacted: boolean) => {
    if (!user) return;

    try {
      if (hasReacted) {
        await supabase
          .from('post_reactions')
          .delete()
          .eq('discussion_id', discussionId)
          .eq('user_id', user.id)
          .eq('reaction_type', reactionType);
      } else {
        await supabase
          .from('post_reactions')
          .insert({
            discussion_id: discussionId,
            user_id: user.id,
            reaction_type: reactionType,
          });
      }
      onRefresh();
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  const handleDelete = async (discussionId: string) => {
    try {
      const { error } = await supabase
        .from('post_discussions')
        .delete()
        .eq('id', discussionId);

      if (error) throw error;
      toast({ title: 'Comentário removido' });
      onRefresh();
    } catch (error) {
      toast({ title: 'Erro ao remover comentário', variant: 'destructive' });
    }
  };

  const renderDiscussion = (discussion: Discussion, isReply = false) => {
    const timeAgo = formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true, locale: ptBR });
    const canDelete = user?.id === discussion.user_id || isAdmin;

    return (
      <div 
        key={discussion.id} 
        className={`${isReply ? 'ml-8 pl-4 border-l border-border/30' : ''} ${discussion.is_highlighted ? 'bg-primary/5 rounded-lg p-3 -mx-3' : ''}`}
      >
        <div className="flex gap-3 py-3">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={discussion.profiles?.avatar_url || ''} />
            <AvatarFallback className="text-xs bg-muted">
              {discussion.profiles?.display_name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-foreground">
                {discussion.profiles?.display_name || 'Usuário'}
              </span>
              <span className="text-xs text-muted-foreground">{timeAgo}</span>
            </div>

            <p className="text-sm text-foreground/90 leading-relaxed mb-2">
              {discussion.content}
            </p>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 px-2 text-xs ${discussion.reactions?.user_reacted_like ? 'text-primary' : 'text-muted-foreground'}`}
                onClick={() => handleReaction(discussion.id, 'like', discussion.reactions?.user_reacted_like || false)}
              >
                <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                {discussion.reactions?.like || 0}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`h-7 px-2 text-xs ${discussion.reactions?.user_reacted_useful ? 'text-amber-500' : 'text-muted-foreground'}`}
                onClick={() => handleReaction(discussion.id, 'useful', discussion.reactions?.user_reacted_useful || false)}
              >
                <Award className="h-3.5 w-3.5 mr-1" />
                útil {discussion.reactions?.useful || 0}
              </Button>

              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground"
                  onClick={() => onReply(discussion.id)}
                >
                  <CornerDownRight className="h-3.5 w-3.5 mr-1" />
                  Responder
                </Button>
              )}

              {canDelete && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDelete(discussion.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Replies */}
            {discussion.replies && discussion.replies.length > 0 && (
              <div className="mt-2">
                {discussion.replies.map((reply) => renderDiscussion(reply, true))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (discussions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">Nenhum comentário ainda.</p>
        <p className="text-xs mt-1">Seja o primeiro a contribuir com a discussão.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/30">
      {discussions.map((discussion) => renderDiscussion(discussion))}
    </div>
  );
}
