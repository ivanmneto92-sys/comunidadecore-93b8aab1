import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Send, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const reportSchema = z.object({
  date: z.string().min(1, 'Data é obrigatória'),
  trades_count: z.coerce.number().min(0, 'Deve ser >= 0'),
  win_rate: z.coerce.number().min(0).max(100, 'Entre 0 e 100'),
  pnl_percent: z.coerce.number(),
  drawdown_percent: z.coerce.number().min(0, 'Deve ser >= 0'),
  status: z.enum(['success', 'warning', 'danger']),
  profile_type: z.string().optional(),
  ai_comment: z.string().optional(),
});

type ReportFormData = z.infer<typeof reportSchema>;

interface DailyReport {
  id: string;
  date: string;
  trades_count: number;
  win_rate: number;
  pnl_percent: number;
  drawdown_percent: number;
  status: 'success' | 'warning' | 'danger';
  published_at: string | null;
  ai_comment: string | null;
}

export function DailyReportForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      trades_count: 0,
      win_rate: 0,
      pnl_percent: 0,
      drawdown_percent: 0,
      status: 'success',
      profile_type: '',
      ai_comment: '',
    },
  });

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from('reports_daily')
      .select('*')
      .order('date', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching reports:', error);
    } else {
      setReports(data as DailyReport[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const onSubmit = async (data: ReportFormData) => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from('reports_daily').insert({
        date: data.date,
        trades_count: data.trades_count,
        win_rate: data.win_rate,
        pnl_percent: data.pnl_percent,
        drawdown_percent: data.drawdown_percent,
        status: data.status,
        profile_type: data.profile_type || null,
        ai_comment: data.ai_comment || null,
        created_by: user?.id,
      });

      if (error) throw error;

      toast({ title: 'Relatório criado com sucesso!' });
      form.reset();
      fetchReports();
    } catch (error) {
      console.error('Error creating report:', error);
      toast({ title: 'Erro ao criar relatório', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const publishReport = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reports_daily')
        .update({ published_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      toast({ title: 'Relatório publicado!' });
      fetchReports();
    } catch (error) {
      console.error('Error publishing report:', error);
      toast({ title: 'Erro ao publicar', variant: 'destructive' });
    }
  };

  const deleteReport = async (id: string) => {
    try {
      const { error } = await supabase.from('reports_daily').delete().eq('id', id);

      if (error) throw error;

      toast({ title: 'Relatório excluído!' });
      fetchReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({ title: 'Erro ao excluir', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Novo Relatório Diário
          </CardTitle>
          <CardDescription>Adicione os resultados do dia</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="success">Sucesso</SelectItem>
                          <SelectItem value="warning">Alerta</SelectItem>
                          <SelectItem value="danger">Perigo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="trades_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trades</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="win_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Win Rate (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="pnl_percent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>P&L (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="drawdown_percent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Drawdown (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="profile_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Perfil (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Conservador, Agressivo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ai_comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comentário IA (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Resumo ou análise do dia..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Criar Relatório
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Relatórios Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : reports.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Nenhum relatório</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>P&L</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{format(new Date(report.date), 'dd/MM')}</TableCell>
                    <TableCell className={Number(report.pnl_percent) >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {Number(report.pnl_percent) >= 0 ? '+' : ''}{Number(report.pnl_percent).toFixed(2)}%
                    </TableCell>
                    <TableCell>
                      {report.published_at ? (
                        <Badge variant="default">Publicado</Badge>
                      ) : (
                        <Badge variant="secondary">Rascunho</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {!report.published_at && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => publishReport(report.id)}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteReport(report.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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
    </div>
  );
}
