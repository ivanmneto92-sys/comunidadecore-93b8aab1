import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Settings, DollarSign, Calendar, Save } from 'lucide-react';
import { format } from 'date-fns';

interface TradingConfig {
  id: string;
  initial_balance: number;
  start_date: string;
  currency: string;
  total_deposits: number;
  total_withdrawals: number;
  max_drawdown_override: number | null;
}

export function TradingConfigForm() {
  const { toast } = useToast();
  const [config, setConfig] = useState<TradingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [initialBalance, setInitialBalance] = useState('100000');
  const [startDate, setStartDate] = useState('2024-06-01');
  const [totalDeposits, setTotalDeposits] = useState('0');
  const [totalWithdrawals, setTotalWithdrawals] = useState('0');
  const [maxDrawdownOverride, setMaxDrawdownOverride] = useState('');
  const [currency, setCurrency] = useState('USD');

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('trading_config')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setConfig(data);
        setInitialBalance(String(data.initial_balance));
        setStartDate(data.start_date);
        setCurrency(data.currency);
        setTotalDeposits(String(data.total_deposits || 0));
        setTotalWithdrawals(String(data.total_withdrawals || 0));
        setMaxDrawdownOverride(data.max_drawdown_override ? String(data.max_drawdown_override) : '');
      }
    } catch (err) {
      console.error('Error fetching trading config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const configData = {
        initial_balance: parseFloat(initialBalance) || 100000,
        start_date: startDate,
        currency,
        total_deposits: parseFloat(totalDeposits) || 0,
        total_withdrawals: parseFloat(totalWithdrawals) || 0,
        max_drawdown_override: maxDrawdownOverride ? parseFloat(maxDrawdownOverride) : null,
      };

      if (config?.id) {
        // Update existing config
        const { error } = await supabase
          .from('trading_config')
          .update(configData)
          .eq('id', config.id);

        if (error) throw error;
      } else {
        // Insert new config
        const { error } = await supabase
          .from('trading_config')
          .insert(configData);

        if (error) throw error;
      }

      toast({ title: 'Configurações salvas com sucesso!' });
      fetchConfig();
    } catch (err) {
      console.error('Error saving config:', err);
      toast({ title: 'Erro ao salvar configurações', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
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
          <Settings className="h-5 w-5" />
          Configurações da Banca
        </CardTitle>
        <CardDescription>
          Configure o valor inicial da banca e outras configurações globais. Esses valores são usados para calcular métricas como Lucro Total.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Initial Balance */}
        <div className="space-y-2">
          <Label htmlFor="initial_balance" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Valor Inicial da Banca
          </Label>
          <div className="flex gap-2">
            <Input
              id="initial_balance"
              type="number"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              placeholder="100000"
              className="max-w-xs"
            />
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="BRL">BRL</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">
            Este valor será usado para calcular o lucro absoluto em {currency}
          </p>
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <Label htmlFor="start_date" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Data de Início do Copy
          </Label>
          <Input
            id="start_date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            Data em que o copy trading começou
          </p>
        </div>

        {/* Total Deposits */}
        <div className="space-y-2">
          <Label htmlFor="total_deposits" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-status-success" />
            Total de Depósitos
          </Label>
          <Input
            id="total_deposits"
            type="number"
            value={totalDeposits}
            onChange={(e) => setTotalDeposits(e.target.value)}
            placeholder="0"
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            Valor total de aportes realizados na banca
          </p>
        </div>

        {/* Total Withdrawals */}
        <div className="space-y-2">
          <Label htmlFor="total_withdrawals" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-status-danger" />
            Total de Retiradas
          </Label>
          <Input
            id="total_withdrawals"
            type="number"
            value={totalWithdrawals}
            onChange={(e) => setTotalWithdrawals(e.target.value)}
            placeholder="0"
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            Valor total de saques realizados da banca
          </p>
        </div>

        {/* Max Drawdown Override */}
        <div className="space-y-2">
          <Label htmlFor="max_drawdown_override" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-status-warning" />
            DD Máximo Histórico (%)
          </Label>
          <Input
            id="max_drawdown_override"
            type="number"
            step="0.01"
            value={maxDrawdownOverride}
            onChange={(e) => setMaxDrawdownOverride(e.target.value)}
            placeholder="Ex: 19.9"
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            Valor máximo de drawdown já registrado historicamente (override)
          </p>
        </div>

        {/* Current Config Summary */}
        {config && (
          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <p className="text-sm font-medium">Configuração Atual:</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <span>Banca Inicial:</span>
              <span className="font-medium text-foreground">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: config.currency }).format(config.initial_balance)}
              </span>
              <span>Data de Início:</span>
              <span className="font-medium text-foreground">
                {format(new Date(config.start_date), 'dd/MM/yyyy')}
              </span>
              <span>Moeda:</span>
              <span className="font-medium text-foreground">{config.currency}</span>
            </div>
          </div>
        )}

        {/* Save Button */}
        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Salvar Configurações
        </Button>
      </CardContent>
    </Card>
  );
}
