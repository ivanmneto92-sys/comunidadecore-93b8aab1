import { useState } from 'react';
import { Search, Hash, Megaphone, BarChart3, HelpCircle, Newspaper, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UnreadBadge } from './UnreadBadge';
import logoCORE from '@/assets/logo-core.png';

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

interface ChannelListPanelProps {
  channels: Channel[];
  selectedChannel: Channel | null;
  onSelectChannel: (channel: Channel) => void;
  unreadCounts?: Record<string, number>;
  onlineCount?: number;
  showFullHeader?: boolean;
}

const getChannelIcon = (channel: Channel) => {
  const iconClass = "h-5 w-5 shrink-0";
  
  if (channel.is_bot_only) {
    return <Megaphone className={cn(iconClass, "text-primary")} />;
  }
  
  switch (channel.slug) {
    case 'announcements':
    case 'anuncios':
      return <Megaphone className={cn(iconClass, "text-primary")} />;
    case 'noticias-mercado':
      return <Newspaper className={cn(iconClass, "text-blue-400")} />;
    case 'daily-results':
    case 'resultados':
      return <BarChart3 className={cn(iconClass, "text-status-success")} />;
    case 'beginner-questions':
    case 'duvidas':
      return <HelpCircle className={cn(iconClass, "text-accent")} />;
    default:
      return <Hash className={iconClass} />;
  }
};

export function ChannelListPanel({ 
  channels, 
  selectedChannel, 
  onSelectChannel,
  unreadCounts = {},
  onlineCount = 0,
  showFullHeader = false
}: ChannelListPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group channels by category
  const groupedChannels = filteredChannels.reduce((acc, channel) => {
    const category = channel.category || 'general';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(channel);
    return acc;
  }, {} as Record<string, Channel[]>);

  const categoryLabels: Record<string, string> = {
    'announcements': 'Anúncios',
    'general': 'Geral',
    'trading': 'Trading',
    'support': 'Suporte',
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Header - Enhanced for mobile fullscreen */}
      <div className={cn(
        "border-b border-border shrink-0",
        showFullHeader ? "p-4" : "p-3"
      )}>
        {showFullHeader ? (
          // Full header for mobile fullscreen mode
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
              <img 
                src={logoCORE} 
                alt="CORE" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <div className="flex-1">
              <h1 className="font-bold text-lg text-foreground">Comunidade</h1>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>{onlineCount} online</span>
              </div>
            </div>
          </div>
        ) : (
          // Compact header for desktop sidebar
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">CORE Community</h2>
          </div>
        )}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar canal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 bg-secondary/50 border-border/50 text-sm"
          />
        </div>
      </div>

      {/* Channel List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {Object.entries(groupedChannels).map(([category, categoryChannels]) => (
            <div key={category} className="mb-4">
              <h3 className="px-2 mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {categoryLabels[category] || category}
              </h3>
              <div className="space-y-0.5">
                {categoryChannels.map((channel) => {
                  const unreadCount = unreadCounts[channel.id] || 0;
                  
                  return (
                    <button
                      key={channel.id}
                      onClick={() => onSelectChannel(channel)}
                      className={cn(
                        "w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-colors",
                        selectedChannel?.id === channel.id
                          ? "bg-primary/20 text-foreground"
                          : unreadCount > 0
                          ? "text-foreground hover:bg-secondary/60 font-medium"
                          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                      )}
                    >
                      <div className="relative">
                        {getChannelIcon(channel)}
                        {unreadCount > 0 && selectedChannel?.id !== channel.id && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-sm truncate",
                            unreadCount > 0 && selectedChannel?.id !== channel.id && "font-semibold"
                          )}>
                            {channel.name}
                          </span>
                          {unreadCount > 0 && selectedChannel?.id !== channel.id && (
                            <UnreadBadge count={unreadCount} />
                          )}
                        </div>
                        {channel.description && (
                          <div className="text-xs text-muted-foreground truncate mt-0.5">
                            {channel.description}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
