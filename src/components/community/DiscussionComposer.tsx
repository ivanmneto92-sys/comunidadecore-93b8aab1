import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface DiscussionComposerProps {
  postId: string;
  parentId?: string | null;
  onSuccess: () => void;
  onCancelReply?: () => void;
  placeholder?: string;
}

export function DiscussionComposer({
  postId,
  parentId,
  onSuccess,
  onCancelReply,
  placeholder = 'Contribua com a discussão...',
}: DiscussionComposerProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setSending(true);
    try {
      const { error } = await supabase.from('post_discussions').insert({
        post_id: postId,
        user_id: user.id,
        content: content.trim(),
        parent_id: parentId || null,
      });

      if (error) throw error;

      setContent('');
      onSuccess();
      if (parentId && onCancelReply) {
        onCancelReply();
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({ title: 'Erro ao enviar comentário', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Faça login para participar da discussão.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {parentId && onCancelReply && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Respondendo a um comentário</span>
          <Button type="button" variant="ghost" size="sm" onClick={onCancelReply}>
            <X className="h-4 w-4 mr-1" />
            Cancelar
          </Button>
        </div>
      )}
      <div className="flex gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className="min-h-[60px] resize-none"
          disabled={sending}
        />
        <Button type="submit" disabled={!content.trim() || sending} className="shrink-0 self-end">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </form>
  );
}
