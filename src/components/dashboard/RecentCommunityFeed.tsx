import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
            channel:channels!inner(name, slug, icon)
          `)
          .eq('channels.is_admin_only', false)
          .order('created_at', { ascending: false })
          .limit(5);

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
  }, []);

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

  const truncateContent = (content: string, maxLength = 80) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength).trim() + '...';
  };

  const handleMessageClick = (channelSlug: string) => {
    navigate(`/community?channel=${channelSlug}`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-4 w-4" />
            Últimas da Comunidade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 p-3 rounded-lg border border-border/50">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (messages.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-4 w-4" />
            Últimas da Comunidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma conversa ainda.</p>
            <p className="text-xs">Seja o primeiro a iniciar uma discussão!</p>
          </div>
          <Button 
            variant="outline" 
            className="w-full mt-2"
            onClick={() => navigate('/community')}
          >
            Ir para Comunidade
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="h-4 w-4" />
          Últimas da Comunidade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {messages.map((message) => (
          <div
            key={message.id}
            onClick={() => handleMessageClick(message.channel.slug)}
            className="flex gap-3 p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-accent/50 cursor-pointer transition-colors"
          >
            <Avatar className="h-9 w-9 flex-shrink-0">
              <AvatarImage src={message.profile?.avatar_url || undefined} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {getAuthorInitials(message)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs opacity-70">
                    {message.channel.icon || '💬'}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {message.channel.name}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                  {formatTime(message.created_at)}
                </span>
              </div>
              <p className="text-xs font-medium truncate">
                {getAuthorName(message)}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                {truncateContent(message.content)}
              </p>
            </div>
          </div>
        ))}
        
        <Button 
          variant="ghost" 
          className="w-full mt-1 text-xs h-8"
          onClick={() => navigate('/community')}
        >
          Ver mais na comunidade
          <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
