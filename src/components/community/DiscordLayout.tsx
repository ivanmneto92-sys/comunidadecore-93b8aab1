import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCommunityPresence } from '@/hooks/useOnlinePresence';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { Loader2 } from 'lucide-react';
import { ServerSidebar } from './ServerSidebar';
import { ChannelListPanel } from './ChannelListPanel';
import { ChatView } from './ChatView';
import { ThreadView } from './ThreadView';

interface Channel {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  category: string;
  is_admin_only: boolean;
  is_bot_only: boolean;
  sort_order: number;
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
    avatar_id: string | null;
  } | null;
}

type MobileView = 'channels' | 'chat';

export function DiscordLayout() {
  const { user } = useAuth();
  const { onlineCount, onlineUsers } = useCommunityPresence();
  const { unreadCounts, totalUnread } = useUnreadMessages();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [threadMessage, setThreadMessage] = useState<Message | null>(null);
  
  // Mobile navigation state
  const [mobileView, setMobileView] = useState<MobileView>('channels');

  useEffect(() => {
    const initialize = async () => {
      // Fetch channels
      const { data: channelsData } = await supabase
        .from('channels')
        .select('*')
        .order('sort_order', { ascending: true });

      if (channelsData && channelsData.length > 0) {
        setChannels(channelsData);
        setSelectedChannel(channelsData[0]);
      }

      // Check admin status
      if (user) {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .in('role', ['admin', 'moderator'])
          .maybeSingle();
        setIsAdmin(!!data);
      }

      setLoading(false);
    };

    initialize();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground bg-background">
        Nenhum canal disponível
      </div>
    );
  }

  const handleSelectChannel = (channel: Channel) => {
    setSelectedChannel(channel);
    setThreadMessage(null);
    setMobileView('chat'); // Navigate to chat on mobile
  };

  const handleGoBack = () => {
    setMobileView('channels');
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      {/* ===== MOBILE LAYOUT ===== */}
      <div className="flex h-full w-full md:hidden">
        {/* ServerSidebar - ALWAYS visible, compact */}
        <div className="w-[52px] shrink-0 h-full">
          <ServerSidebar
            channels={channels}
            selectedChannel={selectedChannel}
            onSelectChannel={handleSelectChannel}
            compact={true}
          />
        </div>
        
        {/* Main content area - switches between channels and chat */}
        <div className="flex-1 h-full overflow-hidden">
          {mobileView === 'channels' ? (
            <ChannelListPanel
              channels={channels}
              selectedChannel={selectedChannel}
              onSelectChannel={handleSelectChannel}
              unreadCounts={unreadCounts}
            />
          ) : (
            selectedChannel && (
              <ChatView
                channel={selectedChannel}
                isAdmin={isAdmin}
                onOpenThread={(message) => setThreadMessage(message)}
                onGoBack={handleGoBack}
                onlineCount={onlineCount}
                onlineUsers={onlineUsers}
              />
            )
          )}
        </div>
      </div>

      {/* Mobile Thread Modal */}
      {mobileView === 'chat' && threadMessage && selectedChannel && (
        <div className="fixed inset-0 z-50 md:hidden bg-background">
          <ThreadView
            parentMessage={threadMessage}
            channelId={selectedChannel.id}
            onClose={() => setThreadMessage(null)}
          />
        </div>
      )}

      {/* ===== DESKTOP LAYOUT ===== */}
      <div className="hidden md:flex h-full w-full">
        {/* Server Sidebar */}
        <div className="w-[72px] shrink-0 h-full">
          <ServerSidebar
            channels={channels}
            selectedChannel={selectedChannel}
            onSelectChannel={(channel) => {
              setSelectedChannel(channel);
              setThreadMessage(null);
            }}
          />
        </div>

        {/* Channel List Panel */}
        <div className="w-[240px] shrink-0 h-full border-r border-border">
          <ChannelListPanel
            channels={channels}
            selectedChannel={selectedChannel}
            onSelectChannel={(channel) => {
              setSelectedChannel(channel);
              setThreadMessage(null);
            }}
            unreadCounts={unreadCounts}
          />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {selectedChannel && (
            <ChatView
              channel={selectedChannel}
              isAdmin={isAdmin}
              onOpenThread={(message) => setThreadMessage(message)}
              onlineCount={onlineCount}
              onlineUsers={onlineUsers}
            />
          )}
        </div>

        {/* Thread Panel - Desktop */}
        {threadMessage && selectedChannel && (
          <div className="w-80 border-l border-border shrink-0 h-full overflow-hidden">
            <ThreadView
              parentMessage={threadMessage}
              channelId={selectedChannel.id}
              onClose={() => setThreadMessage(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
