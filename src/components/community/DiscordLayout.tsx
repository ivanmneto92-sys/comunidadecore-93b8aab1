import { useState, useEffect, memo } from 'react';
import { ListSkeleton } from '@/components/skeletons';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCommunityPresence } from '@/hooks/useOnlinePresence';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { Loader2 } from 'lucide-react';
import { ServerSidebar } from './ServerSidebar';
import { ChannelListPanel } from './ChannelListPanel';
import { ChatView } from './ChatView';
import { ThreadView } from './ThreadView';
import { NewsChannelView } from './NewsChannelView';
import { CommunityNewsPanel } from './CommunityNewsPanel';
import { SupportView } from '@/components/support/SupportView';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { CommunityWelcomeTour } from './CommunityWelcomeTour';

// Memoize NewsPanel to prevent re-renders on parent state changes
const MemoizedNewsPanel = memo(CommunityNewsPanel);

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
  parent_id?: string | null;
  reply_count?: number;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
    avatar_id: string | null;
  } | null;
}

type MobileView = 'channels' | 'chat' | 'support';

export function DiscordLayout() {
  const { user } = useAuth();
  const { onlineCount, onlineUsers } = useCommunityPresence();
  const { unreadCounts, totalUnread } = useUnreadMessages();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [threadMessage, setThreadMessage] = useState<Message | null>(null);
  const [showSupport, setShowSupport] = useState(false);
  const [showNews, setShowNews] = useState(false);
  
  // Mobile navigation state
  const [mobileView, setMobileView] = useState<MobileView>('channels');
  // Desktop: collapse channel list panel
  const [channelListCollapsed, setChannelListCollapsed] = useState(false);

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
      <div className="h-full bg-background p-3">
        <ListSkeleton count={8} />
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
    setShowSupport(channel.icon === '🔧' || channel.slug === 'suporte');
    setMobileView(channel.icon === '🔧' || channel.slug === 'suporte' ? 'support' : 'chat');
  };

  const handleGoBack = () => {
    setMobileView('channels');
    setShowSupport(false);
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      <CommunityWelcomeTour channels={channels} currentChannelSlug={selectedChannel?.slug ?? null} />

      {/* ===== MOBILE LAYOUT ===== */}
      <div className="flex h-full w-full md:hidden">
        {/* ServerSidebar - ALWAYS visible, compact */}
        <div className="w-[52px] shrink-0 h-full">
          <ServerSidebar
            channels={channels}
            selectedChannel={selectedChannel}
            onSelectChannel={handleSelectChannel}
            compact={true}
            onOpenNews={() => setShowNews(true)}
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
          ) : mobileView === 'support' ? (
            <SupportView onGoBack={handleGoBack} />
          ) : selectedChannel?.slug === 'noticias-mercado' ? (
            <NewsChannelView
              channel={selectedChannel}
              onGoBack={handleGoBack}
              onlineCount={onlineCount}
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
            channelName={selectedChannel.name}
            onClose={() => setThreadMessage(null)}
          />
        </div>
      )}

      {/* Mobile News Sheet */}
      <Sheet open={showNews} onOpenChange={setShowNews}>
        <SheetContent side="right" className="p-0 w-[85vw] max-w-sm md:hidden">
          <CommunityNewsPanel onClose={() => setShowNews(false)} showCloseButton />
        </SheetContent>
      </Sheet>

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
              setShowSupport(channel.icon === '🔧' || channel.slug === 'suporte');
            }}
          />
        </div>

        {/* Channel List Panel (collapsible) */}
        {!channelListCollapsed && (
          <div className="w-[240px] shrink-0 h-full border-r border-border relative">
            <ChannelListPanel
              channels={channels}
              selectedChannel={selectedChannel}
              onSelectChannel={(channel) => {
                setSelectedChannel(channel);
                setThreadMessage(null);
                setShowSupport(channel.icon === '🔧' || channel.slug === 'suporte');
              }}
              unreadCounts={unreadCounts}
            />
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setChannelListCollapsed(true)}
              className="absolute top-3 right-2 h-7 w-7 z-10"
              aria-label="Recolher menu de canais"
              title="Recolher menu"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {channelListCollapsed && (
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setChannelListCollapsed(false)}
              className="absolute top-3 left-2 h-7 w-7 z-20 shadow-md"
              aria-label="Expandir menu de canais"
              title="Mostrar menu"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          )}
          {showSupport ? (
            <SupportView />
          ) : selectedChannel?.slug === 'noticias-mercado' ? (
            <NewsChannelView
              channel={selectedChannel}
              onlineCount={onlineCount}
            />
          ) : selectedChannel && (
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
              channelName={selectedChannel.name}
              onClose={() => setThreadMessage(null)}
            />
          </div>
        )}

        {/* News Panel - Desktop (Memoized) */}
        <div className="w-[280px] shrink-0 h-full border-l border-border">
          <MemoizedNewsPanel />
        </div>
      </div>
    </div>
  );
}
