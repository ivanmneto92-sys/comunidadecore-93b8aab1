import { useAvatar, renderAvatarSvg } from '@/hooks/useAvatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface OnlineUser {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
  avatarId?: string | null;
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
        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-card" />
      </div>
      <span className="text-sm text-foreground/90 truncate flex-1">
        {user.displayName}
      </span>
    </button>
  );
}

export function OnlineMembersList({ users, onUserClick, className }: OnlineMembersListProps) {
  if (users.length === 0) {
    return (
      <div className={cn('p-4 text-center', className)}>
        <p className="text-xs text-muted-foreground">
          Nenhum membro online
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="px-3 py-2 border-b border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Online — {users.length}
        </h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {users.map((user) => (
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
