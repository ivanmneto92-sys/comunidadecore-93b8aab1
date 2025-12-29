import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ChannelList } from '@/components/community/ChannelList';
import { ChatView } from '@/components/community/ChatView';
import { supabase } from '@/integrations/supabase/client';
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

export default function Community() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);

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
        
        // Auto-select first channel
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

        {/* Channel list - horizontal scrollable pills */}
        <ChannelList 
          channels={channels} 
          selectedChannel={selectedChannel} 
          onSelectChannel={setSelectedChannel} 
        />

        {/* Chat view */}
        <div className="flex-1 overflow-hidden">
          {selectedChannel ? (
            <ChatView channel={selectedChannel} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Selecione um canal
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
