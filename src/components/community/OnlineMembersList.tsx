import { useAvatar, renderAvatarSvg } from '@/hooks/useAvatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StatusIndicator } from './StatusSelector';
import { cn } from '@/lib/utils';
import type { PresenceStatus } from '@/hooks/useUserStatus';

interface OnlineUser {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
  avatarId?: string | null;
  presenceStatus?: PresenceStatus;
}

interface OnlineMembersListProps {
  users: OnlineUser[];
  onUserClick?: (userId: string, displayName: string) => void;
  className?: string;
}

function OnlineMemberItem({ 
  user, 
  onClick 
}: { 
  user: OnlineUser; 
  onClick?: () => void;
}) {
  const { svg: avatarSvg } = useAvatar(user.avatarId, user.displayName);
  const status = user.presenceStatus || 'online';

  // Don't show invisible users
  if (status === 'invisible') return null;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors',
        'hover:bg-muted/50 focus:bg-muted/50 focus:outline-none text-left'
      )}
    >
      <div className="relative">
        <div className="w-7 h-7 rounded-full bg-muted overflow-hidden">
          {renderAvatarSvg(avatarSvg, 'w-full h-full')}
        </div>
        <div className="absolute -bottom-0.5 -right-0.5">
          <StatusIndicator status={status} size="sm" />
        </div>
      </div>
      <span className="text-sm text-foreground/90 truncate flex-1">
        {user.displayName}
      </span>
    </button>
  );
}

export function OnlineMembersList({ users, onUserClick, className }: OnlineMembersListProps) {
  // Filter out invisible users from the count
  const visibleUsers = users.filter(u => u.presenceStatus !== 'invisible');
  
  if (visibleUsers.length === 0) {
    return (
      <div className={cn('p-4 text-center', className)}>
        <p className="text-xs text-muted-foreground">
          Nenhum membro online
        </p>
      </div>
    );
  }

  // Group users by status
  const groupedUsers = {
    online: visibleUsers.filter(u => !u.presenceStatus || u.presenceStatus === 'online'),
    idle: visibleUsers.filter(u => u.presenceStatus === 'idle'),
    dnd: visibleUsers.filter(u => u.presenceStatus === 'dnd'),
  };

  return (
    <div className={className}>
      <div className="px-3 py-2 border-b border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Online — {visibleUsers.length}
        </h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {/* Online users first */}
          {groupedUsers.online.map((user) => (
            <OnlineMemberItem
              key={user.id}
              user={user}
              onClick={() => onUserClick?.(user.id, user.displayName)}
            />
          ))}
          {/* Idle users */}
          {groupedUsers.idle.map((user) => (
            <OnlineMemberItem
              key={user.id}
              user={user}
              onClick={() => onUserClick?.(user.id, user.displayName)}
            />
          ))}
          {/* DND users */}
          {groupedUsers.dnd.map((user) => (
            <OnlineMemberItem
              key={user.id}
              user={user}
              onClick={() => onUserClick?.(user.id, user.displayName)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
