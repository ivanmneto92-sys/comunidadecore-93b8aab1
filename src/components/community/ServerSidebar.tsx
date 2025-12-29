import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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

interface ServerSidebarProps {
  channels: Channel[];
  selectedChannel: Channel | null;
  onSelectChannel: (channel: Channel) => void;
}

export function ServerSidebar({ channels, selectedChannel, onSelectChannel }: ServerSidebarProps) {
  // Group channels by category
  const groupedChannels = channels.reduce((acc, channel) => {
    if (!acc[channel.category]) {
      acc[channel.category] = [];
    }
    acc[channel.category].push(channel);
    return acc;
  }, {} as Record<string, Channel[]>);

  const getChannelIcon = (channel: Channel) => {
    if (channel.icon) return channel.icon;
    if (channel.is_bot_only) return '🤖';
    if (channel.is_admin_only) return '🔒';
    return '#';
  };

  return (
    <div className="flex flex-col h-full bg-secondary/50 py-3 px-2">
      {/* Logo/Home */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl hover:rounded-xl transition-all">
            C
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          CORE Community
        </TooltipContent>
      </Tooltip>

      <div className="w-8 h-px bg-border mx-auto my-2" />

      {/* Channels */}
      <div className="flex-1 overflow-y-auto scrollbar-hidden space-y-2">
        {Object.entries(groupedChannels).map(([category, categoryChannels]) => (
          <div key={category} className="space-y-1">
            {categoryChannels.map((channel) => {
              const isSelected = selectedChannel?.id === channel.id;
              
              return (
                <Tooltip key={channel.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onSelectChannel(channel)}
                      className="relative w-full flex items-center justify-center group"
                    >
                      {/* Selection indicator */}
                      <div className={cn(
                        'absolute left-0 w-1 rounded-r-full bg-foreground transition-all',
                        isSelected ? 'h-10' : 'h-0 group-hover:h-5'
                      )} />
                      
                      {/* Channel icon */}
                      <div className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center text-lg transition-all',
                        isSelected 
                          ? 'bg-primary text-primary-foreground rounded-2xl' 
                          : 'bg-muted text-muted-foreground hover:bg-primary/80 hover:text-primary-foreground hover:rounded-2xl'
                      )}>
                        {getChannelIcon(channel)}
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="flex flex-col gap-0.5">
                    <span className="font-semibold">{channel.name}</span>
                    {channel.description && (
                      <span className="text-xs text-muted-foreground">{channel.description}</span>
                    )}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
