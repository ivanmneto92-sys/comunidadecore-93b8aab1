import { useEffect, useRef } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { useMentions, MentionUser } from '@/hooks/useMentions';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface MentionPopoverProps {
  open: boolean;
  query: string;
  onlineUserIds: string[];
  onSelect: (user: MentionUser) => void;
  onClose: () => void;
  position?: { top: number; left: number };
}

export function MentionPopover({
  open,
  query,
  onlineUserIds,
  onSelect,
  onClose,
}: MentionPopoverProps) {
  const { users, loading } = useMentions(query, onlineUserIds);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={containerRef}
      className="absolute bottom-full left-0 mb-1 w-64 z-50 animate-in fade-in-0 slide-in-from-bottom-2 duration-200"
    >
      <Command className="border border-border rounded-lg shadow-lg bg-popover">
        <CommandList>
          {loading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
          {!loading && users.length === 0 && (
            <CommandEmpty className="py-4 text-center text-sm text-muted-foreground">
              Nenhum usuário encontrado
            </CommandEmpty>
          )}
          {!loading && users.length > 0 && (
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.display_name}
                  onSelect={() => onSelect(user)}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer"
                >
                  <div className="relative">
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium overflow-hidden">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (user.display_name?.[0] || '?').toUpperCase()
                      )}
                    </div>
                    {user.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-popover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm font-medium truncate',
                      user.isOnline && 'text-foreground'
                    )}>
                      {user.display_name}
                    </p>
                    {user.username && (
                      <p className="text-xs text-muted-foreground truncate">
                        @{user.username}
                      </p>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </div>
  );
}
