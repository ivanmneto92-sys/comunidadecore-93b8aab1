import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCommunityPresence } from '@/hooks/useOnlinePresence';
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
  } | null;
}

type ChannelState = Channel | null;

export function DiscordLayout() {
  const { user } = useAuth();
  const { onlineCount, onlineUsers } = useCommunityPresence();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<ChannelState>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [threadMessage, setThreadMessage] = useState<Message | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Nenhum canal disponível
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Drawer - Only Channel List */}
      {sidebarOpen && (
        <div className="fixed inset-y-0 left-0 z-50 w-[280px] bg-background shadow-xl md:hidden">
          <ChannelListPanel
            channels={channels}
            selectedChannel={selectedChannel}
            onSelectChannel={(channel) => {
              setSelectedChannel(channel);
              setSidebarOpen(false);
              setThreadMessage(null);
            }}
            showCloseButton
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Desktop: Server Sidebar */}
      <div className="hidden md:block w-[72px] shrink-0 h-full">
        <ServerSidebar
          channels={channels}
          selectedChannel={selectedChannel}
          onSelectChannel={(channel) => {
            setSelectedChannel(channel);
            setThreadMessage(null);
          }}
        />
      </div>

      {/* Desktop: Channel List Panel */}
      <div className="hidden md:block w-[240px] shrink-0 h-full border-r border-border">
        <ChannelListPanel
          channels={channels}
          selectedChannel={selectedChannel}
          onSelectChannel={(channel) => {
            setSelectedChannel(channel);
            setThreadMessage(null);
          }}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {selectedChannel && (
          <ChatView
            channel={selectedChannel}
            isAdmin={isAdmin}
            onOpenThread={(message) => setThreadMessage(message)}
            onOpenSidebar={() => setSidebarOpen(true)}
            onlineCount={onlineCount}
            onlineUsers={onlineUsers}
          />
        )}
      </div>

      {/* Thread Panel - Desktop */}
      {threadMessage && selectedChannel && (
        <div className="hidden md:block w-80 border-l border-border shrink-0 h-full overflow-hidden">
          <ThreadView
            parentMessage={threadMessage}
            channelId={selectedChannel.id}
            onClose={() => setThreadMessage(null)}
          />
        </div>
      )}

      {/* Mobile Thread Modal */}
      {threadMessage && selectedChannel && (
        <div className="fixed inset-0 z-50 md:hidden bg-background">
          <ThreadView
            parentMessage={threadMessage}
            channelId={selectedChannel.id}
            onClose={() => setThreadMessage(null)}
          />
        </div>
      )}
    </div>
  );
}
