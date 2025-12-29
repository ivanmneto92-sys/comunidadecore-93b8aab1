import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ChannelList } from '@/components/community/ChannelList';
import { ChatView } from '@/components/community/ChatView';
import { ThreadView } from '@/components/community/ThreadView';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, MessageCircle } from 'lucide-react';

interface Channel {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  category: string;
  is_admin_only: boolean;
  is_bot_only: boolean;
}

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

export default function Community() {
  const { user } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [threadMessage, setThreadMessage] = useState<Message | null>(null);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const { data, error } = await supabase
          .from('channels')
          .select('*')
          .order('sort_order', { ascending: true });

        if (error) throw error;
        const channelsData = (data || []) as Channel[];
        setChannels(channelsData);
        
        if (channelsData.length > 0 && !selectedChannel) {
          setSelectedChannel(channelsData[0]);
        }
      } catch (error) {
        console.error('Error fetching channels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'moderator'])
        .maybeSingle();
      setIsAdmin(!!data);
    };
    checkAdmin();
  }, [user]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100dvh-3.5rem-env(safe-area-inset-bottom,0px))]">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <MessageCircle className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Comunidade</h1>
            <p className="text-xs text-muted-foreground">CORE HUB</p>
          </div>
        </div>

        {/* Channel list */}
        <ChannelList 
          channels={channels} 
          selectedChannel={selectedChannel} 
          onSelectChannel={(channel) => {
            setSelectedChannel(channel);
            setThreadMessage(null);
          }} 
        />

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat view */}
          <div className={`flex-1 ${threadMessage ? 'hidden md:flex' : 'flex'} flex-col overflow-hidden`}>
            {selectedChannel ? (
              <ChatView 
                channel={selectedChannel} 
                isAdmin={isAdmin}
                onOpenThread={(msg) => setThreadMessage(msg)}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Selecione um canal
              </div>
            )}
          </div>

          {/* Thread view */}
          {threadMessage && selectedChannel && (
            <div className="w-full md:w-80 lg:w-96 shrink-0">
              <ThreadView
                parentMessage={threadMessage}
                channelId={selectedChannel.id}
                onClose={() => setThreadMessage(null)}
              />
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}