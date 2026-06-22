import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { JournalSettings, JournalSettingsInput } from '@/hooks/useJournalSettings';

interface JournalSettingsModalProps {
  settings: JournalSettings | null;
  onSave: (input: JournalSettingsInput) => Promise<JournalSettings | undefined>;
}

export function JournalSettingsModal({ settings, onSave }: JournalSettingsModalProps) {
  const [open, setOpen] = useState(false);
  const [initialBalance, setInitialBalance] = useState('');
  const [startDate, setStartDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setInitialBalance(settings.initial_balance.toString());
      setStartDate(settings.start_date);
    } else {
      // Default to today
      const today = new Date();
      setStartDate(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
      setInitialBalance('');
    }
  }, [settings, open]);

  const handleSave = async () => {
    const balance = parseFloat(initialBalance) || 0;
    
    if (!startDate) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        initial_balance: balance,
        start_date: startDate,
      });
      setOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button aria-label="Configurações" variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurações do Diário</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="initial-balance">Saldo Inicial da Conta</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                R$
              </span>
              <Input
                id="initial-balance"
                type="number"
                step="0.01"
                min="0"
                placeholder="10000.00"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Valor inicial para calcular o P&L em reais
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="start-date">Data de Início</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Data de início do acompanhamento do diário
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
