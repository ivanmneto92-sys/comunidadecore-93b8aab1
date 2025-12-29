import { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Pin, Menu, Hash, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageItem } from './MessageItem';
import { MessageComposer } from './MessageComposer';
import { PollCard } from './PollCard';
import { CreatePollModal } from './CreatePollModal';
import { ThreadView } from './ThreadView';

interface Channel {
  id: string;
  name: string;
  slug: string;
  is_admin_only: boolean;
  is_bot_only: boolean;
}

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
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  reactions?: Reaction[];
}

interface Poll {
  id: string;
  question: string;
  is_multiple_choice: boolean;
  closes_at: string | null;
  created_at: string;
  user_id: string;
  options: { id: string; option_text: string; vote_count: number }[];
  total_votes: number;
  user_votes: string[];
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface ChatViewProps {
  channel: Channel;
  onOpenThread?: (message: Message) => void;
  isAdmin?: boolean;
  onOpenSidebar?: () => void;
}

export function ChatView({ channel, onOpenThread, isAdmin = false, onOpenSidebar }: ChatViewProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPollModal, setShowPollModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const canSendMessages = !channel.is_admin_only && !channel.is_bot_only;

  const fetchMessages = useCallback(async () => {
    try {
      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('id, content, created_at, user_id, is_bot_message, is_pinned')
        .eq('channel_id', channel.id)
        .is('parent_id', null)
        .order('created_at', { ascending: true })
        .limit(100);

      if (messagesError) throw messagesError;

      // Get unique user IDs
      const userIds = [...new Set((messagesData || []).map(m => m.user_id).filter(Boolean))] as string[];
      const messageIds = (messagesData || []).map(m => m.id);

      // Fetch profiles
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

      // Fetch reply counts
      let replyCounts: Record<string, number> = {};
      if (messageIds.length > 0) {
        const { data: replyData } = await supabase
          .from('messages')
          .select('parent_id')
          .in('parent_id', messageIds);

        if (replyData) {
          replyCounts = replyData.reduce((acc, r) => {
            acc[r.parent_id!] = (acc[r.parent_id!] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
        }
      }

      // Fetch reactions
      let reactionsMap: Record<string, Reaction[]> = {};
      if (messageIds.length > 0) {
        const { data: reactionsData } = await supabase
          .from('message_reactions')
          .select('message_id, emoji, user_id')
          .in('message_id', messageIds);

        if (reactionsData) {
          const grouped: Record<string, Record<string, { count: number; userIds: string[] }>> = {};
          
          reactionsData.forEach(r => {
            if (!grouped[r.message_id]) grouped[r.message_id] = {};
            if (!grouped[r.message_id][r.emoji]) {
              grouped[r.message_id][r.emoji] = { count: 0, userIds: [] };
            }
            grouped[r.message_id][r.emoji].count++;
            grouped[r.message_id][r.emoji].userIds.push(r.user_id);
          });

          Object.keys(grouped).forEach(msgId => {
            reactionsMap[msgId] = Object.entries(grouped[msgId]).map(([emoji, data]) => ({
              emoji,
              count: data.count,
              hasReacted: user ? data.userIds.includes(user.id) : false,
            }));
          });
        }
      }

      // Combine all data
      const messagesWithData = (messagesData || []).map(msg => ({
        ...msg,
        profiles: msg.user_id ? profilesMap[msg.user_id] || null : null,
        reply_count: replyCounts[msg.id] || 0,
        reactions: reactionsMap[msg.id] || [],
      }));

      setMessages(messagesWithData as Message[]);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [channel.id, user]);

  const fetchPolls = useCallback(async () => {
    try {
      const { data: pollsData, error } = await supabase
        .from('polls')
        .select(`
          id, question, is_multiple_choice, closes_at, created_at, user_id
        `)
        .eq('channel_id', channel.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      if (!pollsData) return;

      // Fetch options and votes for each poll
      const pollsWithData = await Promise.all(pollsData.map(async (poll) => {
        // Get options
        const { data: optionsData } = await supabase
          .from('poll_options')
          .select('id, option_text, sort_order')
          .eq('poll_id', poll.id)
          .order('sort_order', { ascending: true });

        // Get all votes
        const { data: votesData } = await supabase
          .from('poll_votes')
          .select('option_id, user_id')
          .eq('poll_id', poll.id);

        // Get profile
        let profile = null;
        if (poll.user_id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('id', poll.user_id)
            .maybeSingle();
          profile = profileData;
        }

        // Calculate vote counts
        const options = (optionsData || []).map(opt => ({
          ...opt,
          vote_count: (votesData || []).filter(v => v.option_id === opt.id).length,
        }));

        const userVotes = user
          ? (votesData || []).filter(v => v.user_id === user.id).map(v => v.option_id)
          : [];

        return {
          ...poll,
          options,
          total_votes: (votesData || []).length,
          user_votes: userVotes,
          profiles: profile,
        };
      }));

      setPolls(pollsWithData);
    } catch (error) {
      console.error('Error fetching polls:', error);
    }
  }, [channel.id, user]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchMessages(), fetchPolls()]);
      setLoading(false);
    };

    loadData();

    // Realtime subscriptions
    const messagesChannel = supabase
      .channel(`messages-${channel.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channel.id}`,
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    const reactionsChannel = supabase
      .channel(`reactions-${channel.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    const pollsChannel = supabase
      .channel(`polls-${channel.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'polls',
          filter: `channel_id=eq.${channel.id}`,
        },
        () => {
          fetchPolls();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'poll_votes',
        },
        () => {
          fetchPolls();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(reactionsChannel);
      supabase.removeChannel(pollsChannel);
    };
  }, [channel.id, fetchMessages, fetchPolls]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "dd 'de' MMMM", { locale: ptBR });
    } catch {
      return '';
    }
  };

  // Get pinned messages
  const pinnedMessages = messages.filter(m => m.is_pinned);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Channel header - Discord style */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border shrink-0 bg-background">
        {/* Mobile menu button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 md:hidden"
          onClick={onOpenSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <Hash className="h-5 w-5 text-muted-foreground" />
        <h2 className="font-semibold text-base">{channel.name}</h2>
        
        <div className="flex-1" />
        
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Users className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>

      {/* Pinned messages */}
      {pinnedMessages.length > 0 && (
        <div className="px-3 py-2 border-b border-border bg-primary/5">
          <div className="flex items-center gap-1.5 text-xs text-primary mb-1.5">
            <Pin className="h-3 w-3" />
            <span className="font-medium">Mensagens Fixadas</span>
          </div>
          <div className="space-y-1">
            {pinnedMessages.slice(0, 2).map(msg => (
              <p key={msg.id} className="text-xs text-muted-foreground truncate">
                <span className="font-medium text-foreground">
                  {msg.profiles?.display_name || 'Usuário'}:
                </span>{' '}
                {msg.content}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Content area */}
      <ScrollArea className="flex-1">
        <div className="py-3 px-1">
          {/* Recent polls */}
          {polls.length > 0 && (
            <div className="px-2 mb-4 space-y-3">
              {polls.slice(0, 2).map((poll) => (
                <PollCard 
                  key={poll.id} 
                  poll={poll} 
                  onVoteUpdate={fetchPolls}
                />
              ))}
            </div>
          )}

          {/* Messages */}
          {messages.length === 0 && polls.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-6">
              Nenhuma mensagem ainda. Seja o primeiro a enviar!
            </p>
          ) : (
            messages.map((message, index) => {
              const showDate = index === 0 ||
                formatDate(messages[index - 1].created_at) !== formatDate(message.created_at);

              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="flex items-center gap-2 my-3 px-2">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(message.created_at)}
                      </span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                  )}

                  <MessageItem
                    message={message}
                    isAdmin={isAdmin}
                    onReply={() => onOpenThread?.(message)}
                    onOpenThread={() => onOpenThread?.(message)}
                  />
                </div>
              );
            })
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Composer */}
      {canSendMessages ? (
        <MessageComposer
          channelId={channel.id}
          channelName={channel.name}
          onOpenPollModal={() => setShowPollModal(true)}
        />
      ) : (
        <div className="p-3 border-t border-border text-center text-xs text-muted-foreground shrink-0">
          {channel.is_bot_only
            ? 'Canal apenas para postagens automáticas.'
            : 'Canal apenas para administradores.'}
        </div>
      )}

      {/* Poll modal */}
      <CreatePollModal
        open={showPollModal}
        onOpenChange={setShowPollModal}
        channelId={channel.id}
        onCreated={fetchPolls}
      />
    </div>
  );
}
