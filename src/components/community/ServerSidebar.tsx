import { Newspaper } from 'lucide-react';
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
  compact?: boolean;
  onOpenNews?: () => void;
}

export function ServerSidebar({ channels, selectedChannel, onSelectChannel, compact = false, onOpenNews }: ServerSidebarProps) {
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

  // Dynamic sizes based on compact mode
  const iconSize = compact ? 'w-8 h-8 text-sm' : 'w-12 h-12 text-lg';
  const logoSize = compact ? 'w-8 h-8 text-sm' : 'w-12 h-12 text-xl';
  const indicatorHeight = compact ? 'h-6' : 'h-10';
  const indicatorHoverHeight = compact ? 'group-hover:h-4' : 'group-hover:h-5';
  const containerPadding = compact ? 'py-2 px-1' : 'py-3 px-2';
  const dividerWidth = compact ? 'w-6' : 'w-8';

  return (
    <div className={cn('flex flex-col h-full bg-secondary/30', containerPadding)}>
      {/* Logo/Home */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button className={cn(
            'mx-auto mb-1.5 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold hover:rounded-xl transition-all',
            logoSize
          )}>
            C
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          CORE Community
        </TooltipContent>
      </Tooltip>

      <div className={cn('h-px bg-border mx-auto my-1.5', dividerWidth)} />

      {/* Channels */}
      <div className={cn('flex-1 overflow-y-auto scrollbar-hidden', compact ? 'space-y-1' : 'space-y-2')}>
        {Object.entries(groupedChannels).map(([category, categoryChannels]) => (
          <div key={category} className={compact ? 'space-y-0.5' : 'space-y-1'}>
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
                        isSelected ? indicatorHeight : cn('h-0', indicatorHoverHeight)
                      )} />
                      
                      {/* Channel icon */}
                      <div className={cn(
                        'rounded-full flex items-center justify-center transition-all',
                        iconSize,
                        isSelected 
                          ? 'bg-primary text-primary-foreground rounded-xl' 
                          : 'bg-muted/50 text-muted-foreground hover:bg-primary/80 hover:text-primary-foreground hover:rounded-xl'
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

      {/* News button - Mobile only */}
      {onOpenNews && (
        <>
          <div className={cn('h-px bg-border mx-auto my-1.5', dividerWidth)} />
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onOpenNews}
                className="relative w-full flex items-center justify-center group"
              >
                <div className={cn(
                  'rounded-full flex items-center justify-center transition-all',
                  iconSize,
                  'bg-muted/50 text-muted-foreground hover:bg-primary/80 hover:text-primary-foreground hover:rounded-xl'
                )}>
                  <Newspaper className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <span className="font-semibold">Notícias Forex</span>
            </TooltipContent>
          </Tooltip>
        </>
      )}
    </div>
  );
}
