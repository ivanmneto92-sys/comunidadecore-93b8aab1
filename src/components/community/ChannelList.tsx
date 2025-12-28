import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

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

interface ChannelListProps {
  channels: Channel[];
  selectedChannel: Channel | null;
  onSelectChannel: (channel: Channel) => void;
}

const categoryLabels: Record<string, string> = {
  oficial: 'Oficial',
  educacao: 'Educação',
  suporte: 'Suporte',
  comunidade: 'Comunidade',
  general: 'Geral',
};

export function ChannelList({ channels, selectedChannel, onSelectChannel }: ChannelListProps) {
  // Group channels by category
  const groupedChannels = channels.reduce((acc, channel) => {
    const category = channel.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(channel);
    return acc;
  }, {} as Record<string, Channel[]>);

  const categoryOrder = ['oficial', 'educacao', 'suporte', 'comunidade', 'general'];
  const sortedCategories = Object.keys(groupedChannels).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );

  return (
    <ScrollArea className="w-64 border-r border-border bg-sidebar hidden md:block">
      <div className="p-3 space-y-4">
        {sortedCategories.map((category) => (
          <div key={category}>
            <h3 className="px-2 mb-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              {categoryLabels[category] || category}
            </h3>
            <div className="space-y-0.5">
              {groupedChannels[category].map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => onSelectChannel(channel)}
                  className={cn(
                    'flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm transition-colors',
                    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    selectedChannel?.id === channel.id
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground'
                  )}
                >
                  <span>{channel.icon || '#'}</span>
                  <span className="truncate">{channel.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
