import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, Save, Calendar, TrendingUp, TrendingDown, Pencil, X, Check } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MonthlyReturn {
  id?: string;
  month: string;
  return_percent: number;
  calculated_from_daily?: boolean;
  daily_data_count?: number;
}

interface DailyReport {
  date: string;
  pnl_percent: number;
  published_at: string | null;
}

export function MonthlyReturnsManager() {
  const { toast } = useToast();
  const [monthlyReturns, setMonthlyReturns] = useState<MonthlyReturn[]>([]);
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingMonth, setEditingMonth] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch saved monthly returns
      const { data: monthlyData, error: monthlyError } = await supabase
        .from('monthly_returns')
        .select('*')
        .order('month', { ascending: false });

      if (monthlyError) throw monthlyError;

      // Fetch all published daily reports
      const { data: dailyData, error: dailyError } = await supabase
        .from('reports_daily')
        .select('date, pnl_percent, published_at')
        .not('published_at', 'is', null)
        .order('date', { ascending: true });

      if (dailyError) throw dailyError;

      setMonthlyReturns(monthlyData || []);
      setDailyReports(dailyData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      toast({ title: 'Erro ao carregar dados', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate returns from daily reports
  const calculatedMonthlyReturns = useMemo(() => {
    const monthlyMap: Record<string, { total: number; count: number }> = {};

    dailyReports.forEach(report => {
      const month = report.date.substring(0, 7); // "2024-12"
      if (!monthlyMap[month]) {
        monthlyMap[month] = { total: 0, count: 0 };
      }
      monthlyMap[month].total += Number(report.pnl_percent) || 0;
      monthlyMap[month].count += 1;
    });

    return monthlyMap;
  }, [dailyReports]);

  // Merge saved and calculated data
  const mergedData = useMemo(() => {
    const allMonths = new Set<string>();
    
    // Add months from saved data (normalize from "2024-06-01" to "2024-06")
    monthlyReturns.forEach(r => {
      const monthKey = r.month.substring(0, 7);
      allMonths.add(monthKey);
    });
    
    // Add months from calculated data
    Object.keys(calculatedMonthlyReturns).forEach(m => allMonths.add(m));

    // Generate months from Jun 2024 to current
    const startMonth = new Date(2024, 5, 1); // June 2024
    const endMonth = new Date();
    let current = startMonth;
    while (current <= endMonth) {
      const monthStr = format(current, 'yyyy-MM');
      allMonths.add(monthStr);
      current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    }

    return Array.from(allMonths)
      .sort((a, b) => b.localeCompare(a)) // Descending order
      .map(month => {
        // Find saved data by matching first 7 chars (handles both "2024-06" and "2024-06-01")
        const saved = monthlyReturns.find(r => r.month.substring(0, 7) === month);
        const calculated = calculatedMonthlyReturns[month];

        return {
          month,
          id: saved?.id,
          saved_return: saved?.return_percent,
          calculated_return: calculated?.total || 0,
          daily_count: calculated?.count || 0,
          has_saved: !!saved,
          has_daily_data: !!calculated,
        };
      });
  }, [monthlyReturns, calculatedMonthlyReturns]);

  const handleSaveMonthReturn = async (month: string, returnPercent: number) => {
    setSaving(month);
    try {
      // Find saved by normalized month key
      const existing = monthlyReturns.find(r => r.month.substring(0, 7) === month);
      
      if (existing) {
        const { error } = await supabase
          .from('monthly_returns')
          .update({ return_percent: returnPercent })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        // Insert with full date format "2024-06-01"
        const { error } = await supabase
          .from('monthly_returns')
          .insert({ month: `${month}-01`, return_percent: returnPercent });
        if (error) throw error;
      }

      toast({ title: 'Retorno mensal salvo!' });
      fetchData();
    } catch (err) {
      console.error('Error saving monthly return:', err);
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    } finally {
      setSaving(null);
      setEditingMonth(null);
    }
  };

  const handleSyncFromDaily = async (month: string) => {
    const calculated = calculatedMonthlyReturns[month];
    if (!calculated) {
      toast({ title: 'Sem dados diários para sincronizar', variant: 'destructive' });
      return;
    }

    await handleSaveMonthReturn(month, calculated.total);
  };

  const startEdit = (month: string, currentValue: number | undefined) => {
    setEditingMonth(month);
    setEditValue(String(currentValue || 0));
  };

  const cancelEdit = () => {
    setEditingMonth(null);
    setEditValue('');
  };

  const confirmEdit = async () => {
    if (!editingMonth) return;
    await handleSaveMonthReturn(editingMonth, parseFloat(editValue) || 0);
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Retornos Mensais
        </CardTitle>
        <CardDescription>
          Gerencie os retornos mensais. Você pode sincronizar a partir dos resultados diários ou inserir manualmente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mês</TableHead>
              <TableHead>Retorno Salvo</TableHead>
              <TableHead>Calculado (Diários)</TableHead>
              <TableHead>Dias Registrados</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mergedData.map((row) => (
              <TableRow key={row.month}>
                <TableCell className="font-medium">
                  {format(parseISO(`${row.month}-01`), 'MMMM yyyy', { locale: ptBR })}
                </TableCell>
                <TableCell>
                  {editingMonth === row.month ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-24 h-8"
                      autoFocus
                    />
                  ) : row.has_saved ? (
                    <span className={row.saved_return! >= 0 ? 'text-status-success' : 'text-status-danger'}>
                      {row.saved_return! >= 0 ? '+' : ''}{row.saved_return?.toFixed(2)}%
                    </span>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">Não definido</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {row.has_daily_data ? (
                    <span className={row.calculated_return >= 0 ? 'text-status-success' : 'text-status-danger'}>
                      {row.calculated_return >= 0 ? '+' : ''}{row.calculated_return.toFixed(2)}%
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {row.daily_count > 0 ? (
                    <Badge variant="secondary">{row.daily_count} dias</Badge>
                  ) : (
                    <span className="text-muted-foreground">0</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {editingMonth === row.month ? (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={confirmEdit}
                          disabled={saving === row.month}
                        >
                          {saving === row.month ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4 text-status-success" />
                          )}
                        </Button>
                        <Button size="icon" variant="ghost" onClick={cancelEdit}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => startEdit(row.month, row.saved_return)}
                          title="Editar manualmente"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {row.has_daily_data && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleSyncFromDaily(row.month)}
                            disabled={saving === row.month}
                            title="Sincronizar dos diários"
                          >
                            {saving === row.month ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Summary */}
        <div className="mt-6 p-4 rounded-lg bg-muted/50">
          <p className="text-sm font-medium mb-2">Resumo:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Retorno (Salvo):</span>
              <p className="font-medium text-lg">
                {monthlyReturns.reduce((sum, r) => sum + (Number(r.return_percent) || 0), 0).toFixed(2)}%
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Total Retorno (Calculado):</span>
              <p className="font-medium text-lg">
                {Object.values(calculatedMonthlyReturns).reduce((sum, r) => sum + r.total, 0).toFixed(2)}%
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Meses com Dados:</span>
              <p className="font-medium text-lg">{monthlyReturns.length}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Total Dias:</span>
              <p className="font-medium text-lg">{dailyReports.length}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
