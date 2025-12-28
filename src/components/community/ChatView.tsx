import { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Send, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface Channel {
  id: string;
  name: string;
  slug: string;
  is_admin_only: boolean;
  is_bot_only: boolean;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string | null;
  is_bot_message: boolean;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface ChatViewProps {
  channel: Channel;
}

export function ChatView({ channel }: ChatViewProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const canSendMessages = !channel.is_admin_only && !channel.is_bot_only;

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        // First fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('id, content, created_at, user_id, is_bot_message')
          .eq('channel_id', channel.id)
          .is('parent_id', null)
          .order('created_at', { ascending: true })
          .limit(100);

        if (messagesError) throw messagesError;

        // Then fetch profiles for unique user IDs
        const userIds = [...new Set((messagesData || []).map(m => m.user_id).filter(Boolean))] as string[];
        
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

        // Combine messages with profiles
        const messagesWithProfiles = (messagesData || []).map(msg => ({
          ...msg,
          profiles: msg.user_id ? profilesMap[msg.user_id] || null : null,
        }));

        setMessages(messagesWithProfiles as Message[]);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Subscribe to realtime updates
    const subscription = supabase
      .channel(`messages-${channel.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channel.id}`,
        },
        async (payload) => {
          const newMsg = payload.new as any;
          
          // Fetch profile if user_id exists
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
            profiles: profile,
          };

          setMessages((prev) => [...prev, message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [channel.id]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || sending) return;

    setSending(true);
    try {
      const { error } = await supabase.from('messages').insert({
        channel_id: channel.id,
        user_id: user.id,
        content: newMessage.trim(),
      });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar mensagem',
        description: 'Tente novamente.',
      });
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'HH:mm', { locale: ptBR });
    } catch {
      return '';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "dd 'de' MMMM", { locale: ptBR });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Channel header */}
      <div className="px-4 py-3 border-b border-border">
        <h2 className="font-semibold">{channel.name}</h2>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4">
        <div className="py-4 space-y-4">
          {messages.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              Nenhuma mensagem ainda. Seja o primeiro a enviar!
            </p>
          ) : (
            messages.map((message, index) => {
              const showDate = index === 0 || 
                formatDate(messages[index - 1].created_at) !== formatDate(message.created_at);
              
              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="flex items-center gap-2 my-4">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-muted-foreground">
                        {formatDate(message.created_at)}
                      </span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
                      {message.is_bot_message 
                        ? '🤖' 
                        : (message.profiles?.display_name?.[0] || '?').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium text-sm">
                          {message.is_bot_message 
                            ? 'CORE Bot' 
                            : message.profiles?.display_name || 'Usuário'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(message.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/90 break-words">
                        {message.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      {canSendMessages ? (
        <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Mensagem em #${channel.name.toLowerCase()}`}
              className="flex-1"
              disabled={sending}
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim() || sending}>
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      ) : (
        <div className="p-4 border-t border-border text-center text-sm text-muted-foreground">
          {channel.is_bot_only 
            ? 'Este canal é apenas para postagens automáticas.' 
            : 'Este canal é apenas para administradores.'}
        </div>
      )}
    </div>
  );
}
