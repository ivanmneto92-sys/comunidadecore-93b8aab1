import { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Pin, ChevronLeft, Hash, Users, ChevronUp, ChevronDown, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageItem } from './MessageItem';
import { MessageComposer } from './MessageComposer';
import { PollCard } from './PollCard';
import { CreatePollModal } from './CreatePollModal';
import { ThreadView } from './ThreadView';
import { TypingIndicator } from './TypingIndicator';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { MessageSearch } from './MessageSearch';
import { OnlineMembersList } from './OnlineMembersList';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

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
  image_url?: string | null;
  status?: 'sending' | 'sent' | 'failed';
  _retryPayload?: { content: string; imageUrl: string | null };
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
    avatar_id: string | null;
  } | null;
  reactions?: Reaction[];
  author_role?: 'admin' | 'moderator' | null;
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

interface OnlineUser {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
}

interface ChatViewProps {
  channel: Channel;
  onOpenThread?: (message: Message) => void;
  isAdmin?: boolean;
  onGoBack?: () => void;
  onlineCount?: number;
  onlineUsers?: OnlineUser[];
}

const MESSAGES_PER_PAGE = 50;

export function ChatView({ 
  channel, 
  onOpenThread, 
  isAdmin = false, 
  onGoBack,
  onlineCount = 0,
  onlineUsers = []
}: ChatViewProps) {
  const { user } = useAuth();
  const { markAsRead } = useUnreadMessages();
  const [messages, setMessages] = useState<Message[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showPollModal, setShowPollModal] = useState(false);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isInitialLoad = useRef(true);

  // Admins podem postar em canais admin-only, mas não em bot-only
  const canSendMessages = isAdmin 
    ? !channel.is_bot_only 
    : (!channel.is_admin_only && !channel.is_bot_only);

  // Marcar canal como lido ao abrir
  useEffect(() => {
    if (channel.id && user) {
      markAsRead(channel.id);
    }
  }, [channel.id, user, markAsRead]);

  const enrichMessages = useCallback(async (messagesData: any[]) => {
    if (!messagesData || messagesData.length === 0) return [];

    // Get unique user IDs
    const userIds = [...new Set(messagesData.map(m => m.user_id).filter(Boolean))] as string[];
    const messageIds = messagesData.map(m => m.id);

    // Fetch profiles
    let profilesMap: Record<string, { display_name: string | null; avatar_url: string | null; avatar_id: string | null }> = {};
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, avatar_id')
        .in('id', userIds);

      if (profilesData) {
        profilesMap = profilesData.reduce((acc, profile) => {
          acc[profile.id] = { display_name: profile.display_name, avatar_url: profile.avatar_url, avatar_id: profile.avatar_id };
          return acc;
        }, {} as Record<string, { display_name: string | null; avatar_url: string | null; avatar_id: string | null }>);
      }
    }

    // Fetch user roles (admin/moderator)
    let rolesMap: Record<string, 'admin' | 'moderator'> = {};
    if (userIds.length > 0) {
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds)
        .in('role', ['admin', 'moderator']);

      if (rolesData) {
        rolesData.forEach(r => {
          // Priorizar admin sobre moderator
          if (!rolesMap[r.user_id] || r.role === 'admin') {
            rolesMap[r.user_id] = r.role as 'admin' | 'moderator';
          }
        });
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
    return messagesData.map(msg => ({
      ...msg,
      profiles: msg.user_id ? profilesMap[msg.user_id] || null : null,
      reply_count: replyCounts[msg.id] || 0,
      reactions: reactionsMap[msg.id] || [],
      author_role: msg.user_id ? rolesMap[msg.user_id] || null : null,
    })) as Message[];
  }, [user]);

  const fetchMessages = useCallback(async (beforeDate?: string) => {
    try {
      let query = supabase
        .from('messages')
        .select('id, content, created_at, user_id, is_bot_message, is_pinned, image_url')
        .eq('channel_id', channel.id)
        .is('parent_id', null)
        .order('created_at', { ascending: false })
        .limit(MESSAGES_PER_PAGE);

      if (beforeDate) {
        query = query.lt('created_at', beforeDate);
      }

      const { data: messagesData, error: messagesError } = await query;

      if (messagesError) throw messagesError;

      // Check if there are more messages
      if (!messagesData || messagesData.length < MESSAGES_PER_PAGE) {
        setHasMore(false);
      }

      // Reverse to show oldest first
      const orderedMessages = (messagesData || []).reverse();
      const enrichedMessages = await enrichMessages(orderedMessages);

      return enrichedMessages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }, [channel.id, enrichMessages]);

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

  const loadMoreMessages = useCallback(async () => {
    if (loadingMore || !hasMore || messages.length === 0) return;

    setLoadingMore(true);
    
    // Get the oldest message date
    const oldestMessage = messages[0];
    const olderMessages = await fetchMessages(oldestMessage.created_at);
    
    if (olderMessages.length > 0) {
      // Preserve scroll position
      const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
      const previousScrollHeight = scrollContainer?.scrollHeight || 0;
      
      setMessages(prev => [...olderMessages, ...prev]);
      
      // Restore scroll position after render
      requestAnimationFrame(() => {
        if (scrollContainer) {
          const newScrollHeight = scrollContainer.scrollHeight;
          scrollContainer.scrollTop = newScrollHeight - previousScrollHeight;
        }
      });
    }
    
    setLoadingMore(false);
  }, [loadingMore, hasMore, messages, fetchMessages]);

  // Scroll to bottom and clear new messages indicator
  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    setNewMessagesCount(0);
  }, []);

  // Scroll to a specific message by ID
  const scrollToMessage = useCallback(async (messageId: string) => {
    // First check if message is already loaded
    const messageElement = messageRefs.current.get(messageId);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMessageId(messageId);
      // Remove highlight after 3 seconds
      setTimeout(() => setHighlightedMessageId(null), 3000);
      return;
    }

    // Message not in current view - need to fetch it and surrounding messages
    try {
      // Get the target message to find its position
      const { data: targetMessage, error: targetError } = await supabase
        .from('messages')
        .select('id, created_at')
        .eq('id', messageId)
        .eq('channel_id', channel.id)
        .maybeSingle();

      if (targetError || !targetMessage) {
        console.error('Message not found:', targetError);
        return;
      }

      // Fetch messages around the target message
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('id, content, created_at, user_id, is_bot_message, is_pinned, image_url')
        .eq('channel_id', channel.id)
        .is('parent_id', null)
        .gte('created_at', targetMessage.created_at)
        .order('created_at', { ascending: true })
        .limit(MESSAGES_PER_PAGE);

      if (messagesError) throw messagesError;

      // Also fetch some messages before the target
      const { data: beforeMessages } = await supabase
        .from('messages')
        .select('id, content, created_at, user_id, is_bot_message, is_pinned, image_url')
        .eq('channel_id', channel.id)
        .is('parent_id', null)
        .lt('created_at', targetMessage.created_at)
        .order('created_at', { ascending: false })
        .limit(25);

      // Combine and sort messages
      const allMessages = [
        ...((beforeMessages || []).reverse()),
        ...(messagesData || [])
      ];

      const enrichedMessages = await enrichMessages(allMessages);
      setMessages(enrichedMessages);
      setHasMore(beforeMessages && beforeMessages.length >= 25);

      // Wait for render, then scroll to message
      requestAnimationFrame(() => {
        setTimeout(() => {
          const element = messageRefs.current.get(messageId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setHighlightedMessageId(messageId);
            setTimeout(() => setHighlightedMessageId(null), 3000);
          }
        }, 100);
      });
    } catch (error) {
      console.error('Error scrolling to message:', error);
    }
  }, [channel.id, enrichMessages]);

  // Handle scroll to detect when user scrolls near top or bottom
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    
    // Load more when scrolled to top (within 100px threshold)
    if (target.scrollTop < 100 && !loadingMore && hasMore) {
      loadMoreMessages();
    }
    
    // Track if user is near bottom (within 200px)
    const nearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 200;
    setIsNearBottom(nearBottom);
    
    // Clear new messages count when scrolled to bottom
    if (nearBottom && newMessagesCount > 0) {
      setNewMessagesCount(0);
    }
  }, [loadMoreMessages, loadingMore, hasMore, newMessagesCount]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      isInitialLoad.current = true;
      setHasMore(true);
      
      const [initialMessages] = await Promise.all([fetchMessages(), fetchPolls()]);
      setMessages(initialMessages);
      setLoading(false);
    };

    loadData();

    // Realtime subscriptions - only for new messages
    const messagesChannel = supabase
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
          // Only handle new root messages
          if (payload.new && !payload.new.parent_id) {
            const enriched = await enrichMessages([payload.new]);
            if (enriched.length > 0) {
              setMessages(prev => [...prev, enriched[0]]);
              
              // Increment new messages count if not near bottom and not own message
              const isOwnMessage = payload.new.user_id === user?.id;
              if (!isOwnMessage) {
                setNewMessagesCount(prev => {
                  // Check if near bottom at the time of receiving the message
                  const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
                  if (scrollContainer) {
                    const nearBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight < 200;
                    if (!nearBottom) {
                      return prev + 1;
                    }
                  }
                  return prev;
                });
              }
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channel.id}`,
        },
        async (payload) => {
          if (payload.new) {
            const enriched = await enrichMessages([payload.new]);
            if (enriched.length > 0) {
              setMessages(prev => prev.map(m => m.id === payload.new.id ? enriched[0] : m));
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channel.id}`,
        },
        (payload) => {
          if (payload.old) {
            setMessages(prev => prev.filter(m => m.id !== payload.old.id));
          }
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
        async (payload) => {
          // Refresh only the affected message
          const newData = payload.new as { message_id?: string } | null;
          const oldData = payload.old as { message_id?: string } | null;
          const messageId = newData?.message_id || oldData?.message_id;
          if (messageId) {
            const { data: reactionsData } = await supabase
              .from('message_reactions')
              .select('emoji, user_id')
              .eq('message_id', messageId);

            if (reactionsData) {
              const grouped: Record<string, { count: number; userIds: string[] }> = {};
              reactionsData.forEach(r => {
                if (!grouped[r.emoji]) {
                  grouped[r.emoji] = { count: 0, userIds: [] };
                }
                grouped[r.emoji].count++;
                grouped[r.emoji].userIds.push(r.user_id);
              });

              const reactions = Object.entries(grouped).map(([emoji, data]) => ({
                emoji,
                count: data.count,
                hasReacted: user ? data.userIds.includes(user.id) : false,
              }));

              setMessages(prev => prev.map(m => 
                m.id === messageId ? { ...m, reactions } : m
              ));
            }
          }
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
  }, [channel.id, fetchMessages, fetchPolls, enrichMessages, user]);

  // Scroll to bottom on initial load and when new messages arrive
  useEffect(() => {
    if (isInitialLoad.current && messages.length > 0) {
      isInitialLoad.current = false;
      requestAnimationFrame(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'auto' });
      });
    }
  }, [messages]);

  // Auto-scroll to bottom when a new message is added (not loading old messages)
  useEffect(() => {
    if (!loading && !loadingMore && messages.length > 0) {
      const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        // Only auto-scroll if near bottom (within 200px)
        const isNearBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight < 200;
        if (isNearBottom) {
          scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [messages.length, loading, loadingMore]);

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
    <div className="flex flex-col h-full relative">
      {/* Channel header - Discord style */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border shrink-0 bg-background">
        {/* Mobile back button */}
        {onGoBack && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 md:hidden"
            onClick={onGoBack}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        
        <Hash className="h-5 w-5 text-muted-foreground" />
        <h2 className="font-semibold text-base">{channel.name}</h2>
        
        <div className="flex-1" />
        
        {/* Online indicator */}
        {onlineCount > 0 && (
          <div className="flex items-center gap-1.5 mr-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">
              {onlineCount} online
            </span>
          </div>
        )}
        
        {/* Search button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={() => setShowSearch(!showSearch)}
        >
          {showSearch ? (
            <X className="h-5 w-5 text-primary" />
          ) : (
            <Search className="h-5 w-5 text-muted-foreground" />
          )}
        </Button>
        
        {/* Members button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={() => setShowMembers(true)}
        >
          <Users className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>

      {/* Search panel */}
      {showSearch && (
        <div className="border-b border-border h-80 shrink-0">
          <MessageSearch
            channelId={channel.id}
            onResultClick={(messageId) => {
              setShowSearch(false);
              scrollToMessage(messageId);
            }}
            onClose={() => setShowSearch(false)}
          />
        </div>
      )}

      {/* Members Sheet */}
      <Sheet open={showMembers} onOpenChange={setShowMembers}>
        <SheetContent side="right" className="p-0 w-64">
          <SheetHeader className="px-3 py-3 border-b border-border">
            <SheetTitle className="text-sm">Membros Online</SheetTitle>
          </SheetHeader>
          <OnlineMembersList 
            users={onlineUsers.map(u => ({
              id: u.user_id,
              displayName: u.display_name,
              avatarUrl: u.avatar_url,
            }))}
            className="h-full"
          />
        </SheetContent>
      </Sheet>

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
      <ScrollArea 
        className="flex-1" 
        ref={scrollAreaRef}
        onScrollCapture={handleScroll}
      >
        <div className="py-3 px-1">
          {/* Load more indicator */}
          {loadingMore && (
            <div className="flex items-center justify-center py-3">
              <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
              <span className="text-xs text-muted-foreground">Carregando mensagens...</span>
            </div>
          )}
          
          {/* Load more button (fallback) */}
          {hasMore && !loadingMore && messages.length > 0 && (
            <div className="flex justify-center py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadMoreMessages}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                <ChevronUp className="h-4 w-4 mr-1" />
                Carregar mensagens anteriores
              </Button>
            </div>
          )}

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
                <div 
                  key={message.id}
                  ref={(el) => {
                    if (el) messageRefs.current.set(message.id, el);
                    else messageRefs.current.delete(message.id);
                  }}
                  className={highlightedMessageId === message.id ? 'animate-pulse bg-primary/10 rounded-lg transition-colors duration-300' : ''}
                >
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
                    authorRole={message.author_role}
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

      {/* New messages indicator */}
      {newMessagesCount > 0 && !isNearBottom && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10">
          <Button
            onClick={scrollToBottom}
            size="sm"
            className="rounded-full shadow-lg gap-1.5 px-4 animate-in slide-in-from-bottom-2"
          >
            <ChevronDown className="h-4 w-4" />
            {newMessagesCount} {newMessagesCount === 1 ? 'nova mensagem' : 'novas mensagens'}
          </Button>
        </div>
      )}

      {/* Typing indicator */}
      {canSendMessages && <TypingIndicator channelId={channel.id} />}

      {/* Composer */}
      {canSendMessages ? (
        <MessageComposer
          channelId={channel.id}
          channelName={channel.name}
          onOpenPollModal={() => setShowPollModal(true)}
          onlineUserIds={onlineUsers.map(u => u.user_id)}
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
