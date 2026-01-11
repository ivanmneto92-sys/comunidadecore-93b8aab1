import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Ticket, ChevronRight, User, Clock } from 'lucide-react';
import { useAdminSupportTickets, SupportTicket } from '@/hooks/useSupportTickets';
import { TicketConversation } from '@/components/support/TicketConversation';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusConfig = {
  open: { label: 'Aberto', className: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
  in_progress: { label: 'Em Andamento', className: 'bg-blue-500/20 text-blue-500 border-blue-500/30' },
  resolved: { label: 'Resolvido', className: 'bg-green-500/20 text-green-500 border-green-500/30' },
};

const priorityConfig = {
  low: { label: 'Baixa', className: 'text-muted-foreground' },
  normal: { label: 'Normal', className: 'text-foreground' },
  high: { label: 'Alta', className: 'text-destructive font-medium' },
};

export function SupportManager() {
  const { tickets, loading, updateTicketStatus } = useAdminSupportTickets();
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');

  const filteredTickets = tickets.filter((ticket) => {
    if (filter === 'all') return true;
    return ticket.status === filter;
  });

  const openCount = tickets.filter((t) => t.status === 'open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved').length;

  if (selectedTicket) {
    return (
      <TicketConversation
        ticket={selectedTicket}
        onBack={() => setSelectedTicket(null)}
        isAdmin
        onStatusChange={(status) => {
          updateTicketStatus(selectedTicket.id, status);
          setSelectedTicket({ ...selectedTicket, status: status as SupportTicket['status'] });
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.length}</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-500">Abertos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{openCount}</div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-500">Em Andamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{inProgressCount}</div>
          </CardContent>
        </Card>
        <Card className="border-green-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-500">Resolvidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{resolvedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Tickets de Suporte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todos ({tickets.length})</TabsTrigger>
              <TabsTrigger value="open">Abertos ({openCount})</TabsTrigger>
              <TabsTrigger value="in_progress">Em Andamento ({inProgressCount})</TabsTrigger>
              <TabsTrigger value="resolved">Resolvidos ({resolvedCount})</TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="mt-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Nenhum ticket encontrado
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTickets.map((ticket) => {
                    const status = statusConfig[ticket.status as keyof typeof statusConfig] || statusConfig.open;
                    const priority = priorityConfig[ticket.priority as keyof typeof priorityConfig] || priorityConfig.normal;
                    const userName = ticket.profiles?.display_name || 'Usuário';
                    
                    return (
                      <div
                        key={ticket.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <User className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium truncate">{ticket.subject}</span>
                              <Badge className={cn('shrink-0 text-xs', status.className)}>
                                {status.label}
                              </Badge>
                              {ticket.priority === 'high' && (
                                <Badge variant="destructive" className="shrink-0 text-xs">
                                  Urgente
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{userName}</span>
                              <span>•</span>
                              <span>#{ticket.id.slice(0, 8)}</span>
                              <span>•</span>
                              <Clock className="h-3 w-3" />
                              <span>
                                {formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true, locale: ptBR })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
