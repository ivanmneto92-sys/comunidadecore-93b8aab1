import { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageItem } from './MessageItem';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string | null;
  is_bot_message: boolean;
  is_pinned: boolean;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface ThreadViewProps {
  parentMessage: Message;
  channelId: string;
  onClose: () => void;
}

export function ThreadView({ parentMessage, channelId, onClose }: ThreadViewProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [replies, setReplies] = useState<Message[]>([]);
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReplies = async () => {
      setLoading(true);
      try {
        const { data: repliesData, error } = await supabase
          .from('messages')
          .select('id, content, created_at, user_id, is_bot_message, is_pinned')
          .eq('parent_id', parentMessage.id)
          .order('created_at', { ascending: true });

        if (error) throw error;

        // Fetch profiles
        const userIds = [...new Set((repliesData || []).map(m => m.user_id).filter(Boolean))] as string[];
        let profilesMap: Record<string, { display_name: string | null; avatar_url: string | null }> = {};

        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, display_name, avatar_url')
            .in('id', userIds);

          if (profilesData) {
            profilesMap = profilesData.reduce((acc, profile) => {
              acc[profile.id] = { display_name: profile.display_name, avatar_url: profile.avatar_url };
              return acc;
            }, {} as Record<string, { display_name: string | null; avatar_url: string | null }>);
          }
        }

        const repliesWithProfiles = (repliesData || []).map(msg => ({
          ...msg,
          profiles: msg.user_id ? profilesMap[msg.user_id] || null : null,
        }));

        setReplies(repliesWithProfiles as Message[]);
      } catch (error) {
        console.error('Error fetching replies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReplies();

    // Realtime subscription for replies
    const subscription = supabase
      .channel(`thread-${parentMessage.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `parent_id=eq.${parentMessage.id}`,
        },
        async (payload) => {
          const newMsg = payload.new as any;

          let profile = null;
          if (newMsg.user_id) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('display_name, avatar_url')
              .eq('id', newMsg.user_id)
              .maybeSingle();
            profile = profileData;
          }

          const message: Message = {
            id: newMsg.id,
            content: newMsg.content,
            created_at: newMsg.created_at,
            user_id: newMsg.user_id,
            is_bot_message: newMsg.is_bot_message,
            is_pinned: newMsg.is_pinned || false,
            profiles: profile,
          };

          setReplies((prev) => [...prev, message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [parentMessage.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [replies]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim() || !user || sending) return;

    setSending(true);
    try {
      const { error } = await supabase.from('messages').insert({
        channel_id: channelId,
        parent_id: parentMessage.id,
        user_id: user.id,
        content: newReply.trim(),
      });

      if (error) throw error;
      setNewReply('');
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({ variant: 'destructive', title: 'Erro ao enviar resposta' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background border-l border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div>
          <h3 className="font-semibold text-sm">Thread</h3>
          <p className="text-xs text-muted-foreground">
            {replies.length} {replies.length === 1 ? 'resposta' : 'respostas'}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Parent message */}
      <div className="border-b border-border bg-muted/30">
        <MessageItem message={parentMessage} showActions={false} />
      </div>

      {/* Replies */}
      <ScrollArea className="flex-1">
        <div className="py-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : replies.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-8">
              Nenhuma resposta ainda
            </p>
          ) : (
            replies.map((reply) => (
              <MessageItem key={reply.id} message={reply} showActions={false} />
            ))
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Reply input */}
      <form onSubmit={handleSendReply} className="p-3 border-t border-border shrink-0">
        <div className="flex gap-2">
          <Input
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            placeholder="Responder..."
            className="flex-1 h-9 text-sm"
            disabled={sending}
          />
          <Button type="submit" size="icon" className="h-9 w-9" disabled={!newReply.trim() || sending}>
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
