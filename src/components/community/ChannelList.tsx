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

export function ChannelList({ channels, selectedChannel, onSelectChannel }: ChannelListProps) {
  return (
    <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hidden border-b border-border bg-card/50">
      {channels.map((channel) => (
        <button
          key={channel.id}
          onClick={() => onSelectChannel(channel)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors shrink-0',
            selectedChannel?.id === channel.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
          )}
        >
          <span>{channel.icon || '#'}</span>
          <span>{channel.name}</span>
        </button>
      ))}
    </div>
  );
}
