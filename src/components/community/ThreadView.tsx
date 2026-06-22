import { useState, useEffect, useRef, useMemo } from 'react';
import { X, Send, Loader2, CornerDownRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageItem } from './MessageItem';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { createReplyNotification, createMentionNotifications } from '@/lib/mentionUtils';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string | null;
  parent_id: string | null;
  is_bot_message: boolean;
  is_pinned: boolean;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
    avatar_id: string | null;
  } | null;
}

interface ThreadViewProps {
  parentMessage: Message;
  channelId: string;
  channelName: string;
  onClose: () => void;
}

const MAX_VISUAL_DEPTH = 5; // beyond this, stop indenting further

export function ThreadView({ parentMessage, channelId, channelName, onClose }: ThreadViewProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [descendants, setDescendants] = useState<Message[]>([]);
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch full subtree via BFS
  useEffect(() => {
    let cancelled = false;
    const fetchTree = async () => {
      setLoading(true);
      try {
        const all: Message[] = [];
        let frontier: string[] = [parentMessage.id];
        for (let depth = 0; depth < 20 && frontier.length > 0; depth++) {
          const { data, error } = await supabase
            .from('messages')
            .select('id, content, created_at, user_id, parent_id, is_bot_message, is_pinned')
            .in('parent_id', frontier)
            .order('created_at', { ascending: true });
          if (error) throw error;
          const batch = (data || []) as Message[];
          if (batch.length === 0) break;
          all.push(...batch);
          frontier = batch.map(m => m.id);
        }

        const userIds = [...new Set(all.map(m => m.user_id).filter(Boolean))] as string[];
        let profilesMap: Record<string, Message['profiles']> = {};
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, display_name, avatar_url, avatar_id')
            .in('id', userIds);
          (profilesData || []).forEach(p => {
            profilesMap[p.id] = {
              display_name: p.display_name,
              avatar_url: p.avatar_url,
              avatar_id: p.avatar_id,
            };
          });
        }

        const enriched = all.map(m => ({
          ...m,
          profiles: m.user_id ? profilesMap[m.user_id] || null : null,
        }));

        if (!cancelled) setDescendants(enriched);
      } catch (err) {
        console.error('Error fetching thread:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchTree();
    return () => { cancelled = true; };
  }, [parentMessage.id]);

  // Realtime: any new message in this channel that belongs to our subtree
  useEffect(() => {
    const ch = supabase
      .channel(`thread-tree-${parentMessage.id}-${Date.now()}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` },
        async (payload) => {
          const m = payload.new as any;
          if (!m.parent_id) return;
          setDescendants(prev => {
            const knownIds = new Set([parentMessage.id, ...prev.map(p => p.id)]);
            if (!knownIds.has(m.parent_id)) return prev; // not in our subtree
            if (prev.some(p => p.id === m.id)) return prev;
            const placeholder: Message = {
              id: m.id,
              content: m.content,
              created_at: m.created_at,
              user_id: m.user_id,
              parent_id: m.parent_id,
              is_bot_message: m.is_bot_message,
              is_pinned: m.is_pinned || false,
              profiles: null,
            };
            // hydrate profile async
            if (m.user_id) {
              supabase
                .from('profiles')
                .select('display_name, avatar_url, avatar_id')
                .eq('id', m.user_id)
                .maybeSingle()
                .then(({ data }) => {
                  if (!data) return;
                  setDescendants(curr => curr.map(c => c.id === m.id ? { ...c, profiles: data } : c));
                });
            }
            return [...prev, placeholder];
          });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [parentMessage.id, channelId]);

  // Build children map
  const childrenByParent = useMemo(() => {
    const map = new Map<string, Message[]>();
    descendants.forEach(m => {
      if (!m.parent_id) return;
      const arr = map.get(m.parent_id) || [];
      arr.push(m);
      map.set(m.parent_id, arr);
    });
    map.forEach(arr => arr.sort((a, b) => a.created_at.localeCompare(b.created_at)));
    return map;
  }, [descendants]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [descendants.length]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim() || !user || sending) return;
    setSending(true);
    try {
      const parent = replyingTo ?? parentMessage;
      const { data, error } = await supabase.from('messages').insert({
        channel_id: channelId,
        parent_id: parent.id,
        user_id: user.id,
        content: newReply.trim(),
      }).select('id').single();
      if (error) throw error;

      const replierName = user.user_metadata?.display_name || 'Alguém';
      const content = newReply.trim();

      if (parent.user_id) {
        await createReplyNotification({
          parentMessageUserId: parent.user_id,
          replyContent: content,
          replierId: user.id,
          replierName,
          channelId,
          channelName,
          replyMessageId: data?.id,
        });
      }
      await createMentionNotifications({
        content,
        senderId: user.id,
        senderName: replierName,
        channelId,
        channelName,
        messageId: data?.id,
      });
      setNewReply('');
      setReplyingTo(null);
    } catch (err) {
      console.error('Error sending reply:', err);
      toast({ variant: 'destructive', title: 'Erro ao enviar resposta' });
    } finally {
      setSending(false);
    }
  };

  const handleReplyClick = (msg: Message) => {
    setReplyingTo(msg);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  // Recursive renderer with indent + connector line
  const renderNode = (msg: Message, depth: number): JSX.Element => {
    const children = childrenByParent.get(msg.id) || [];
    const visualDepth = Math.min(depth, MAX_VISUAL_DEPTH);
    const isActive = replyingTo?.id === msg.id;

    return (
      <div key={msg.id} className="relative">
        <div
          className={cn(
            'relative',
            visualDepth > 0 && 'pl-3 ml-3 border-l border-border/60',
            isActive && 'bg-primary/5 rounded-md',
          )}
        >
          <MessageItem
            message={msg as any}
            showActions
            onReply={() => handleReplyClick(msg)}
          />
        </div>
        {children.length > 0 && (
          <div className={cn(visualDepth < MAX_VISUAL_DEPTH ? 'ml-3' : 'ml-0')}>
            {children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const topLevelReplies = childrenByParent.get(parentMessage.id) || [];
  const totalCount = descendants.length;

  return (
    <div className="flex flex-col h-full bg-background border-l border-border">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div>
          <h3 className="font-semibold text-sm">Thread</h3>
          <p className="text-xs text-muted-foreground">
            {totalCount} {totalCount === 1 ? 'resposta' : 'respostas'}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar thread">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="border-b border-border bg-muted/30">
        <MessageItem
          message={parentMessage as any}
          showActions
          onReply={() => handleReplyClick(parentMessage)}
        />
      </div>

      <ScrollArea className="flex-1">
        <div className="py-2 pr-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : topLevelReplies.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-8">
              Nenhuma resposta ainda. Seja o primeiro!
            </p>
          ) : (
            topLevelReplies.map(reply => renderNode(reply, 1))
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {replyingTo && replyingTo.id !== parentMessage.id && (
        <div className="px-3 pt-2 flex items-center gap-2 text-xs text-muted-foreground border-t border-border">
          <CornerDownRight className="h-3 w-3 shrink-0" />
          <span className="truncate flex-1">
            Respondendo a <span className="font-medium text-foreground">
              {replyingTo.profiles?.display_name || 'mensagem'}
            </span>
            : "{replyingTo.content.slice(0, 60)}{replyingTo.content.length > 60 ? '…' : ''}"
          </span>
          <button
            type="button"
            onClick={() => setReplyingTo(null)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Cancelar resposta"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <form onSubmit={handleSendReply} className="p-3 border-t border-border shrink-0">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            placeholder={replyingTo && replyingTo.id !== parentMessage.id ? 'Responder à resposta…' : 'Responder…'}
            className="flex-1 h-9 text-sm"
            disabled={sending}
          />
          <Button type="submit" size="icon" className="h-9 w-9" disabled={!newReply.trim() || sending} aria-label="Enviar resposta">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}
