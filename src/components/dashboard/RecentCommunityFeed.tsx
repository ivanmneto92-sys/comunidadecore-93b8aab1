import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Message {
  id: string;
  content: string;
  created_at: string;
  channel_id: string;
  user_id: string | null;
  is_bot_message: boolean;
  channel: {
    name: string;
    slug: string;
    icon: string | null;
  };
  profile: {
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
}

export function RecentCommunityFeed() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessageWithProfile = useCallback(async (messageData: any): Promise<Message | null> => {
    try {
      // Fetch channel info
      const { data: channelData } = await supabase
        .from('channels')
        .select('name, slug, icon')
        .eq('id', messageData.channel_id)
        .single();

      if (!channelData) return null;

      // Fetch profile if user_id exists
      let profile = null;
      if (messageData.user_id) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('display_name, username, avatar_url')
          .eq('id', messageData.user_id)
          .single();
        profile = profileData;
      }

      return {
        id: messageData.id,
        content: messageData.content,
        created_at: messageData.created_at,
        channel_id: messageData.channel_id,
        user_id: messageData.user_id,
        is_bot_message: messageData.is_bot_message,
        channel: channelData,
        profile
      };
    } catch (error) {
      console.error('Error fetching message details:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchRecentMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select(`
            id,
            content,
            created_at,
            channel_id,
            user_id,
            is_bot_message,
            channel:channels!inner(name, slug, icon, is_admin_only)
          `)
          .eq('channels.is_admin_only', false)
          .order('created_at', { ascending: false })
          .limit(15);

        if (error) throw error;

        // Fetch profiles for each message
        const messagesWithProfiles = await Promise.all(
          (data || []).map(async (msg) => {
            let profile = null;
            if (msg.user_id) {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('display_name, username, avatar_url')
                .eq('id', msg.user_id)
                .single();
              profile = profileData;
            }
            return {
              ...msg,
              channel: Array.isArray(msg.channel) ? msg.channel[0] : msg.channel,
              profile
            } as Message;
          })
        );

        setMessages(messagesWithProfiles);
      } catch (error) {
        console.error('Error fetching recent messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentMessages();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('home-feed-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          const newMessage = await fetchMessageWithProfile(payload.new);
          if (newMessage) {
            setMessages((prev) => [newMessage, ...prev.slice(0, 14)]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMessageWithProfile]);

  const getAuthorName = (message: Message) => {
    if (message.is_bot_message) return 'CORE Bot';
    if (message.profile?.display_name) return message.profile.display_name;
    if (message.profile?.username) return message.profile.username;
    return 'Usuário';
  };

  const getAuthorInitials = (message: Message) => {
    const name = getAuthorName(message);
    return name.slice(0, 2).toUpperCase();
  };

  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ptBR
    });
  };

  const truncateContent = (content: string, maxLength = 120) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength).trim() + '...';
  };

  const handleMessageClick = (channelSlug: string) => {
    navigate(`/community?channel=${channelSlug}`);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-3 p-4 rounded-xl border border-border/50 bg-card">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
        <p className="text-muted-foreground mb-2">Nenhuma conversa ainda.</p>
        <p className="text-sm text-muted-foreground/70 mb-4">Seja o primeiro a iniciar uma discussão!</p>
        <Button 
          variant="outline" 
          onClick={() => navigate('/community')}
        >
          Ir para Comunidade
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((message, index) => (
        <div
          key={message.id}
          onClick={() => handleMessageClick(message.channel.slug)}
          className="flex gap-3 p-4 rounded-xl border border-border/50 bg-card hover:bg-accent/50 cursor-pointer transition-all duration-200 animate-in fade-in slide-in-from-top-2"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={message.profile?.avatar_url || undefined} />
            <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
              {getAuthorInitials(message)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm opacity-80">
                  {message.channel.icon || '💬'}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {message.channel.name}
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                {formatTime(message.created_at)}
              </span>
            </div>
            <p className="text-sm font-semibold mb-0.5">
              {getAuthorName(message)}
            </p>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {truncateContent(message.content)}
            </p>
          </div>
        </div>
      ))}
      
      <Button 
        variant="outline" 
        className="w-full mt-2"
        onClick={() => navigate('/community')}
      >
        Ver mais na comunidade
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
