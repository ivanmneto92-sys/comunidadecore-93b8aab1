import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, Loader2, User, Shield } from 'lucide-react';
import { useSupportMessages, SupportTicket } from '@/hooks/useSupportTickets';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TicketConversationProps {
  ticket: SupportTicket;
  onBack: () => void;
  isAdmin?: boolean;
  onStatusChange?: (status: string) => void;
}

const statusConfig = {
  open: { label: 'Aberto', variant: 'default' as const, className: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
  in_progress: { label: 'Em Andamento', variant: 'default' as const, className: 'bg-blue-500/20 text-blue-500 border-blue-500/30' },
  resolved: { label: 'Resolvido', variant: 'default' as const, className: 'bg-green-500/20 text-green-500 border-green-500/30' },
};

const priorityConfig = {
  low: { label: 'Baixa', className: 'text-muted-foreground' },
  normal: { label: 'Normal', className: 'text-foreground' },
  high: { label: 'Alta', className: 'text-destructive' },
};

export function TicketConversation({ ticket, onBack, isAdmin = false, onStatusChange }: TicketConversationProps) {
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useSupportMessages(ticket.id);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;

    setSending(true);
    await sendMessage(newMessage.trim(), user.id, isAdmin);
    setNewMessage('');
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const status = statusConfig[ticket.status as keyof typeof statusConfig] || statusConfig.open;
  const priority = priorityConfig[ticket.priority as keyof typeof priorityConfig] || priorityConfig.normal;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border p-4 space-y-2">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold truncate">{ticket.subject}</h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Ticket #{ticket.id.slice(0, 8)}</span>
              <span>•</span>
              <span className={priority.className}>Prioridade {priority.label}</span>
            </div>
          </div>
          <Badge className={cn('shrink-0', status.className)}>
            {status.label}
          </Badge>
        </div>
        
        {isAdmin && ticket.status !== 'resolved' && (
          <div className="flex gap-2 ml-11">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange?.('in_progress')}
              disabled={ticket.status === 'in_progress'}
              className="text-xs"
            >
              Marcar Em Andamento
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange?.('resolved')}
              className="text-xs text-green-500 border-green-500/30 hover:bg-green-500/10"
            >
              Resolver Ticket
            </Button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma mensagem ainda
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender_id === user?.id;
            const displayName = message.profiles?.display_name || 'Usuário';
            
            return (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  isOwnMessage && !isAdmin ? 'flex-row-reverse' : ''
                )}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={message.profiles?.avatar_url || ''} />
                  <AvatarFallback className={message.is_admin_reply ? 'bg-primary/20 text-primary' : ''}>
                    {message.is_admin_reply ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className={cn('flex-1 max-w-[80%]', isOwnMessage && !isAdmin ? 'flex flex-col items-end' : '')}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn('text-sm font-medium', message.is_admin_reply && 'text-primary')}>
                      {message.is_admin_reply ? 'Suporte CORE' : displayName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(message.created_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  <div
                    className={cn(
                      'rounded-lg px-4 py-2',
                      message.is_admin_reply
                        ? 'bg-primary/10 border border-primary/20'
                        : 'bg-muted'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {ticket.status !== 'resolved' && (
        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem..."
              rows={2}
              className="resize-none"
              disabled={sending}
            />
            <Button onClick={handleSend} disabled={sending || !newMessage.trim()} className="shrink-0">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}

      {ticket.status === 'resolved' && (
        <div className="border-t border-border p-4 text-center text-muted-foreground bg-muted/30">
          Este ticket foi resolvido e está fechado para novas mensagens.
        </div>
      )}
    </div>
  );
}
