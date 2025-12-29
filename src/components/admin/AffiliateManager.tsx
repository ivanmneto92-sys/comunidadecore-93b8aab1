import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Affiliate {
  id: string;
  user_id: string;
  affiliate_code: string;
  total_earnings: number;
  available_balance: number;
  status: string;
  created_at: string;
  profile?: {
    display_name: string | null;
    username: string | null;
  };
}

interface PayoutRequest {
  id: string;
  affiliate_id: string;
  amount: number;
  status: string;
  payment_method: string;
  payment_details: Record<string, unknown> | null;
  created_at: string;
  affiliate?: {
    affiliate_code: string;
    profile?: {
      display_name: string | null;
    };
  };
}

export function AffiliateManager() {
  const { toast } = useToast();
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch affiliates with profiles
      const { data: affiliatesData } = await supabase
        .from('affiliates')
        .select(`
          *,
          profile:profiles!affiliates_user_id_fkey(display_name, username)
        `)
        .order('created_at', { ascending: false });

      setAffiliates((affiliatesData as unknown as Affiliate[]) || []);

      // Fetch pending payout requests
      const { data: payoutsData } = await supabase
        .from('payout_requests')
        .select(`
          *,
          affiliate:affiliates!payout_requests_affiliate_id_fkey(
            affiliate_code,
            profile:profiles!affiliates_user_id_fkey(display_name)
          )
        `)
        .order('created_at', { ascending: false });

      setPayouts((payoutsData as unknown as PayoutRequest[]) || []);
    } catch (error) {
      console.error('Error fetching affiliate data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updatePayoutStatus = async (payoutId: string, status: 'completed' | 'rejected') => {
    setProcessingId(payoutId);
    try {
      const { error } = await supabase
        .from('payout_requests')
        .update({
          status,
          processed_at: new Date().toISOString(),
        })
        .eq('id', payoutId);

      if (error) throw error;

      // If completed, update affiliate balance
      if (status === 'completed') {
        const payout = payouts.find(p => p.id === payoutId);
        if (payout) {
          const affiliate = affiliates.find(a => a.id === payout.affiliate_id);
          if (affiliate) {
            await supabase
              .from('affiliates')
              .update({
                available_balance: Number(affiliate.available_balance) - Number(payout.amount),
              })
              .eq('id', affiliate.id);
          }
        }
      }

      toast({
        title: status === 'completed' ? 'Pagamento concluído!' : 'Solicitação rejeitada',
        description: status === 'completed' 
          ? 'O saque foi processado com sucesso.'
          : 'A solicitação foi rejeitada.',
      });

      await fetchData();
    } catch (error) {
      console.error('Error updating payout:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const updateAffiliateStatus = async (affiliateId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('affiliates')
        .update({ status })
        .eq('id', affiliateId);

      if (error) throw error;

      toast({
        title: 'Status atualizado',
        description: `Afiliado ${status === 'active' ? 'ativado' : status === 'suspended' ? 'suspenso' : 'pendente'}.`,
      });

      await fetchData();
    } catch (error) {
      console.error('Error updating affiliate:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive',
      });
    }
  };

  const pendingPayouts = payouts.filter(p => p.status === 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statusBadges: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pending: { label: 'Pendente', variant: 'secondary' },
    processing: { label: 'Processando', variant: 'outline' },
    completed: { label: 'Concluído', variant: 'default' },
    rejected: { label: 'Rejeitado', variant: 'destructive' },
    active: { label: 'Ativo', variant: 'default' },
    suspended: { label: 'Suspenso', variant: 'destructive' },
  };

  return (
    <div className="space-y-6">
      {/* Pending Payouts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Solicitações de Saque Pendentes
            {pendingPayouts.length > 0 && (
              <Badge variant="destructive">{pendingPayouts.length}</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Aprove ou rejeite solicitações de saque dos afiliados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingPayouts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma solicitação pendente</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Afiliado</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingPayouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {payout.affiliate?.profile?.display_name || 'N/A'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {payout.affiliate?.affiliate_code}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-primary">
                      R$ {Number(payout.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {payout.payment_method === 'pix' ? 'Pix' : 'PayPal'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(payout.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updatePayoutStatus(payout.id, 'completed')}
                          disabled={processingId === payout.id}
                        >
                          {processingId === payout.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updatePayoutStatus(payout.id, 'rejected')}
                          disabled={processingId === payout.id}
                        >
                          <XCircle className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* All Affiliates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Afiliados ({affiliates.length})
          </CardTitle>
          <CardDescription>
            Gerencie o status e visualize os dados dos afiliados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {affiliates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum afiliado cadastrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Afiliado</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead>Total Ganho</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {affiliates.map((affiliate) => {
                  const status = statusBadges[affiliate.status] || statusBadges.pending;
                  return (
                    <TableRow key={affiliate.id}>
                      <TableCell>
                        <p className="font-medium">
                          {affiliate.profile?.display_name || affiliate.profile?.username || 'N/A'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {affiliate.affiliate_code}
                        </code>
                      </TableCell>
                      <TableCell className="text-primary font-medium">
                        R$ {Number(affiliate.available_balance).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        R$ {Number(affiliate.total_earnings).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Select
                          value={affiliate.status}
                          onValueChange={(value) => updateAffiliateStatus(affiliate.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Ativo</SelectItem>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="suspended">Suspenso</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Saques</CardTitle>
          <CardDescription>
            Todas as solicitações de saque processadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Afiliado</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.filter(p => p.status !== 'pending').map((payout) => {
                const status = statusBadges[payout.status] || statusBadges.pending;
                return (
                  <TableRow key={payout.id}>
                    <TableCell>
                      {payout.affiliate?.profile?.display_name || payout.affiliate?.affiliate_code}
                    </TableCell>
                    <TableCell className="font-medium">
                      R$ {Number(payout.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {payout.payment_method === 'pix' ? 'Pix' : 'PayPal'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(payout.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
