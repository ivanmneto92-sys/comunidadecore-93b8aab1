import { useTypingIndicator } from '@/hooks/useTypingIndicator';

interface TypingIndicatorProps {
  channelId: string;
}

export function TypingIndicator({ channelId }: TypingIndicatorProps) {
  const { typingUsers } = useTypingIndicator(channelId);

  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].displayName} está digitando...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].displayName} e ${typingUsers[1].displayName} estão digitando...`;
    } else {
      return `${typingUsers[0].displayName} e mais ${typingUsers.length - 1} estão digitando...`;
    }
  };

  return (
    <div className="px-4 py-1.5 text-xs text-muted-foreground flex items-center gap-2 animate-pulse">
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>{getTypingText()}</span>
    </div>
  );
}
