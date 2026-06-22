import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Plus, Ticket, Loader2, ChevronRight, ArrowLeft } from 'lucide-react';
import { useSupportTickets, SupportTicket } from '@/hooks/useSupportTickets';
import { CreateTicketModal } from './CreateTicketModal';
import { TicketConversation } from './TicketConversation';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SupportViewProps {
  onGoBack?: () => void;
}

const statusConfig = {
  open: { label: 'Aberto', className: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
  in_progress: { label: 'Em Andamento', className: 'bg-blue-500/20 text-blue-500 border-blue-500/30' },
  resolved: { label: 'Resolvido', className: 'bg-green-500/20 text-green-500 border-green-500/30' },
};

export function SupportView({ onGoBack }: SupportViewProps) {
  const { tickets, loading, createTicket } = useSupportTickets();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  const handleCreateTicket = async (subject: string, description: string, priority: string) => {
    const ticket = await createTicket(subject, description, priority);
    if (ticket) {
      setSelectedTicket(ticket as SupportTicket);
    }
  };

  if (selectedTicket) {
    return (
      <TicketConversation
        ticket={selectedTicket}
        onBack={() => setSelectedTicket(null)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onGoBack && (
              <Button aria-label="Voltar" variant="ghost" size="icon" onClick={onGoBack} className="md:hidden">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Ticket className="h-5 w-5 text-primary" />
                Suporte
              </h1>
              <p className="text-sm text-muted-foreground">
                Abra um ticket para falar com nossa equipe
              </p>
            </div>
          </div>
          <Button onClick={() => setShowCreateModal(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Ticket
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Ticket className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">Nenhum ticket</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Você ainda não abriu nenhum ticket de suporte
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Abrir Primeiro Ticket
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => {
              const status = statusConfig[ticket.status as keyof typeof statusConfig] || statusConfig.open;
              
              return (
                <Card
                  key={ticket.id}
                  className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{ticket.subject}</h3>
                        <Badge className={cn('shrink-0 text-xs', status.className)}>
                          {status.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>#{ticket.id.slice(0, 8)}</span>
                        <span>•</span>
                        <span>
                          {format(new Date(ticket.created_at), "dd 'de' MMMM", { locale: ptBR })}
                        </span>
                        {ticket.updated_at !== ticket.created_at && (
                          <>
                            <span>•</span>
                            <span>
                              Atualizado {format(new Date(ticket.updated_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <CreateTicketModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateTicket}
      />
    </div>
  );
}
