import { useState, useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Send, Trash2, TrendingUp, TrendingDown, Zap, Target, Pencil, X } from 'lucide-react';
import { format, subMonths, addMonths, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { DailyReportPreview } from './DailyReportPreview';
import { ReportsCalendar } from './ReportsCalendar';

const reportSchema = z.object({
  date: z.string().min(1, 'Data é obrigatória'),
  hasOperations: z.boolean(),
  wins: z.coerce.number().min(0, 'Deve ser >= 0'),
  losses: z.coerce.number().min(0, 'Deve ser >= 0'),
  pnl_percent: z.coerce.number(),
  drawdown_percent: z.coerce.number().min(0, 'Deve ser >= 0'),
  status: z.enum(['success', 'warning', 'danger']),
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
  
  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Edit mode state
  const [editingReport, setEditingReport] = useState<DailyReport | null>(null);
  const isEditMode = editingReport !== null;

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      hasOperations: true,
      wins: 0,
      losses: 0,
      pnl_percent: 0,
      drawdown_percent: 0,
      status: 'success',
      ai_comment: '',
    },
  });

  // Watch form values for real-time preview
  const watchedValues = useWatch({ control: form.control });
  
  // Calculate derived values
  const tradesCount = useMemo(() => {
    return (watchedValues.wins || 0) + (watchedValues.losses || 0);
  }, [watchedValues.wins, watchedValues.losses]);

  const winRate = useMemo(() => {
    if (tradesCount === 0) return 0;
    return ((watchedValues.wins || 0) / tradesCount) * 100;
  }, [watchedValues.wins, tradesCount]);

  // Auto-suggest status based on data
  const suggestedStatus = useMemo(() => {
    const pnl = watchedValues.pnl_percent || 0;
    if (pnl > 0 && winRate >= 50) return 'success';
    if (pnl < 0 || winRate < 40) return 'danger';
    return 'warning';
  }, [watchedValues.pnl_percent, winRate]);

  const fetchReports = async () => {
    // Fetch reports for 3 months range (for calendar navigation)
    const startDate = format(startOfMonth(subMonths(calendarMonth, 1)), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(addMonths(calendarMonth, 1)), 'yyyy-MM-dd');
    
    const { data, error } = await supabase
      .from('reports_daily')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching reports:', error);
    } else {
      setReports(data as DailyReport[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, [calendarMonth]);

  // Handle calendar date selection
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    
    if (!date) {
      cancelEdit();
      return;
    }
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const existingReport = reports.find(r => r.date === dateStr);
    
    if (existingReport) {
      // Enter edit mode with existing report
      setEditingReport(existingReport);
      
      // Calculate wins/losses from trades_count and win_rate
      const wins = Math.round(existingReport.trades_count * (existingReport.win_rate / 100));
      const losses = existingReport.trades_count - wins;
      
      form.reset({
        date: existingReport.date,
        hasOperations: existingReport.trades_count > 0,
        wins,
        losses,
        pnl_percent: Number(existingReport.pnl_percent),
        drawdown_percent: Number(existingReport.drawdown_percent),
        status: existingReport.status,
        ai_comment: existingReport.ai_comment || '',
      });
    } else {
      // New report mode
      cancelEdit();
      form.setValue('date', dateStr);
    }
  };

  const cancelEdit = () => {
    setEditingReport(null);
    form.reset({
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      hasOperations: true,
      wins: 0,
      losses: 0,
      pnl_percent: 0,
      drawdown_percent: 0,
      status: 'success',
      ai_comment: '',
    });
  };

  const applyTemplate = (template: 'green' | 'neutral' | 'red') => {
    switch (template) {
      case 'green':
        form.setValue('hasOperations', true);
        form.setValue('wins', 6);
        form.setValue('losses', 2);
        form.setValue('pnl_percent', 1.5);
        form.setValue('drawdown_percent', 0.3);
        form.setValue('status', 'success');
        break;
      case 'neutral':
        form.setValue('hasOperations', false);
        form.setValue('wins', 0);
        form.setValue('losses', 0);
        form.setValue('pnl_percent', 0);
        form.setValue('drawdown_percent', 0);
        form.setValue('status', 'success');
        break;
      case 'red':
        form.setValue('hasOperations', true);
        form.setValue('wins', 2);
        form.setValue('losses', 4);
        form.setValue('pnl_percent', -0.8);
        form.setValue('drawdown_percent', 1.2);
        form.setValue('status', 'warning');
        break;
    }
  };

  const onSubmit = async (data: ReportFormData, shouldPublish = false) => {
    setSubmitting(true);
    try {
      const tradesTotal = data.hasOperations ? data.wins + data.losses : 0;
      const calculatedWinRate = tradesTotal > 0 ? (data.wins / tradesTotal) * 100 : 0;

      const reportData = {
        date: data.date,
        trades_count: tradesTotal,
        win_rate: calculatedWinRate,
        pnl_percent: data.hasOperations ? data.pnl_percent : 0,
        drawdown_percent: data.hasOperations ? data.drawdown_percent : 0,
        status: data.status,
        ai_comment: data.ai_comment || null,
        created_by: user?.id,
        ...(shouldPublish && { published_at: new Date().toISOString() }),
      };

      if (isEditMode && editingReport) {
        // Update existing report
        const { error } = await supabase
          .from('reports_daily')
          .update(reportData)
          .eq('id', editingReport.id);

        if (error) throw error;
        toast({ title: shouldPublish ? 'Relatório atualizado e publicado!' : 'Relatório atualizado!' });
      } else {
        // Create new report
        const { error } = await supabase.from('reports_daily').insert(reportData);
        if (error) throw error;
        toast({ title: shouldPublish ? 'Relatório publicado com sucesso!' : 'Relatório criado com sucesso!' });
      }

      cancelEdit();
      fetchReports();
    } catch (error) {
      console.error('Error saving report:', error);
      toast({ title: 'Erro ao salvar relatório', variant: 'destructive' });
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
      
      // If we were editing this report, cancel edit mode
      if (editingReport?.id === id) {
        cancelEdit();
      }
      
      fetchReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({ title: 'Erro ao excluir', variant: 'destructive' });
    }
  };

  const hasOperations = watchedValues.hasOperations ?? true;

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <ReportsCalendar
        reports={reports}
        selectedDate={selectedDate}
        onSelectDate={handleDateSelect}
        month={calendarMonth}
        onMonthChange={setCalendarMonth}
      />

      {/* Form */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isEditMode ? (
              <>
                <Pencil className="h-5 w-5" />
                Editar Resultado
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                Novo Resultado Diário
              </>
            )}
          </CardTitle>
          <CardDescription>
            {isEditMode 
              ? `Editando resultado de ${format(parseISO(editingReport.date), 'dd/MM/yyyy')}`
              : 'Adicione os resultados do dia de forma simples'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Edit Mode Banner */}
          {isEditMode && (
            <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between">
              <span className="text-sm text-primary">
                Modo de edição ativo
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={cancelEdit}
                className="h-8"
              >
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
            </div>
          )}

          {/* Quick Templates - Hide in edit mode */}
          {!isEditMode && (
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">Templates rápidos:</p>
              <div className="flex gap-2 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyTemplate('green')}
                  className="border-status-success/50 text-status-success hover:bg-status-success/10"
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Dia Verde
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyTemplate('neutral')}
                  className="border-muted-foreground/50"
                >
                  <Target className="h-4 w-4 mr-1" />
                  Sem Operações
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyTemplate('red')}
                  className="border-status-danger/50 text-status-danger hover:bg-status-danger/10"
                >
                  <TrendingDown className="h-4 w-4 mr-1" />
                  Dia Vermelho
                </Button>
              </div>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => onSubmit(data, false))} className="space-y-6">
              {/* Date and Operation Toggle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>📅 Data</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled={isEditMode} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hasOperations"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Houve operações?</FormLabel>
                      <div className="flex items-center gap-3 h-10">
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className="text-sm text-muted-foreground">
                          {field.value ? 'Sim, houve trades' : 'Não, dia de preservação'}
                        </span>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Conditional Fields - Only show if hasOperations */}
              {hasOperations && (
                <>
                  {/* Wins and Losses */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="wins"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-status-success">✓ Wins</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0"
                              {...field} 
                              className="text-center text-lg font-medium"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="losses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-status-danger">✗ Losses</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0"
                              {...field} 
                              className="text-center text-lg font-medium"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium mb-2">Total Trades</span>
                      <div className="h-10 flex items-center justify-center bg-muted rounded-md text-lg font-medium">
                        {tradesCount}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium mb-2">Win Rate</span>
                      <div className="h-10 flex items-center justify-center bg-muted rounded-md text-lg font-medium">
                        {winRate.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* P&L and Drawdown */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="pnl_percent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>💰 P&L (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              {...field} 
                              placeholder="+1.50 ou -0.80"
                            />
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
                          <FormLabel>📉 Drawdown (%)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}

              {/* Status with Auto-suggestion */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Status
                      {hasOperations && field.value !== suggestedStatus && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs text-muted-foreground"
                          onClick={() => form.setValue('status', suggestedStatus)}
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          Sugestão: {suggestedStatus === 'success' ? 'Sucesso' : suggestedStatus === 'warning' ? 'Alerta' : 'Perigo'}
                        </Button>
                      )}
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="success">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-status-success" />
                            Sucesso
                          </span>
                        </SelectItem>
                        <SelectItem value="warning">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-status-warning" />
                            Alerta
                          </span>
                        </SelectItem>
                        <SelectItem value="danger">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-status-danger" />
                            Perigo
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* AI Comment */}
              <FormField
                control={form.control}
                name="ai_comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>💬 Comentário (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Análise do dia, observações importantes..."
                        className="min-h-[80px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Real-time Preview */}
              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground mb-3">Prévia (como aparecerá no app):</p>
                <DailyReportPreview
                  pnlPercent={watchedValues.pnl_percent || 0}
                  tradesCount={tradesCount}
                  wins={watchedValues.wins || 0}
                  losses={watchedValues.losses || 0}
                  hasOperations={hasOperations}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3">
                <Button 
                  type="submit" 
                  disabled={submitting} 
                  variant="outline"
                  className="flex-1"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : isEditMode ? (
                    <Pencil className="h-4 w-4 mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {isEditMode ? 'Atualizar Rascunho' : 'Criar Rascunho'}
                </Button>
                <Button 
                  type="button" 
                  disabled={submitting} 
                  className="flex-1"
                  onClick={async () => {
                    const isValid = await form.trigger();
                    if (isValid) {
                      const data = form.getValues();
                      onSubmit(data, true);
                    }
                  }}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isEditMode ? 'Atualizar e Publicar' : 'Publicar Agora'}
                </Button>
              </div>
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
                  <TableHead>Trades</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow 
                    key={report.id}
                    className={editingReport?.id === report.id ? 'bg-primary/10' : ''}
                  >
                    <TableCell>{format(new Date(report.date), 'dd/MM')}</TableCell>
                    <TableCell className={Number(report.pnl_percent) >= 0 ? 'text-status-success' : 'text-status-danger'}>
                      {Number(report.pnl_percent) >= 0 ? '+' : ''}{Number(report.pnl_percent).toFixed(2)}%
                    </TableCell>
                    <TableCell>{report.trades_count}</TableCell>
                    <TableCell>
                      {report.published_at ? (
                        <Badge variant="default">Publicado</Badge>
                      ) : (
                        <Badge variant="secondary">Rascunho</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDateSelect(parseISO(report.date))}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {!report.published_at && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => publishReport(report.id)}
                            title="Publicar"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteReport(report.id)}
                          title="Excluir"
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
