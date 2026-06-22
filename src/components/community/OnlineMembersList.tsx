import { useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useAvatar, renderAvatarSvg } from '@/hooks/useAvatar';
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

const ROW_HEIGHT = 40; // px — matches py-1.5 + h-7 avatar row

function OnlineMemberItem({
  user,
  onClick,
}: {
  user: OnlineUser;
  onClick?: () => void;
}) {
  const { svg: avatarSvg } = useAvatar(user.avatarId, user.displayName);
  const status = user.presenceStatus || 'online';

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
  const parentRef = useRef<HTMLDivElement>(null);

  // Sort: online → idle → dnd, drop invisible
  const sorted = useMemo(() => {
    const order: Record<string, number> = { online: 0, idle: 1, dnd: 2 };
    return users
      .filter(u => u.presenceStatus !== 'invisible')
      .sort((a, b) => (order[a.presenceStatus || 'online'] ?? 0) - (order[b.presenceStatus || 'online'] ?? 0));
  }, [users]);

  const virtualizer = useVirtualizer({
    count: sorted.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  });

  if (sorted.length === 0) {
    return (
      <div className={cn('p-4 text-center', className)}>
        <p className="text-xs text-muted-foreground">Nenhum membro online</p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col min-h-0', className)}>
      <div className="px-3 py-2 border-b border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Online — {sorted.length}
        </h3>
      </div>
      <div ref={parentRef} className="flex-1 overflow-y-auto p-2">
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((vi) => {
            const user = sorted[vi.index];
            return (
              <div
                key={user.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${vi.size}px`,
                  transform: `translateY(${vi.start}px)`,
                }}
              >
                <OnlineMemberItem
                  user={user}
                  onClick={() => onUserClick?.(user.id, user.displayName)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
