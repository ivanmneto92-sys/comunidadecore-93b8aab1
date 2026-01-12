import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2, Smile, Meh, Frown, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { JournalEntry, JournalEntryInput } from '@/hooks/useJournal';

interface JournalEntryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  entry?: JournalEntry;
  onSave: (input: JournalEntryInput) => Promise<boolean>;
  onDelete?: (id: string) => Promise<boolean>;
}

type EmotionalState = 'good' | 'neutral' | 'stressed';

export function JournalEntryDrawer({
  open,
  onOpenChange,
  date,
  entry,
  onSave,
  onDelete,
}: JournalEntryDrawerProps) {
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [pnlPercent, setPnlPercent] = useState('');
  const [emotionalState, setEmotionalState] = useState<EmotionalState | null>(null);
  const [followedPlan, setFollowedPlan] = useState(true);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Reset form when entry changes
  useEffect(() => {
    if (entry) {
      setWins(entry.wins);
      setLosses(entry.losses);
      setPnlPercent(String(entry.pnl_percent));
      setEmotionalState(entry.emotional_state as EmotionalState | null);
      setFollowedPlan(entry.followed_plan);
      setNotes(entry.notes || '');
    } else {
      setWins(0);
      setLosses(0);
      setPnlPercent('');
      setEmotionalState(null);
      setFollowedPlan(true);
      setNotes('');
    }
  }, [entry, date]);

  const formattedDate = date 
    ? format(parseISO(date), "EEEE, d 'de' MMMM", { locale: ptBR })
    : '';

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await onSave({
        date,
        trades_count: wins + losses,
        wins,
        losses,
        pnl_percent: parseFloat(pnlPercent) || 0,
        notes: notes || undefined,
        emotional_state: emotionalState || undefined,
        followed_plan: followedPlan,
      });
      
      if (success) {
        onOpenChange(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!entry || !onDelete) return;
    
    const success = await onDelete(entry.id);
    if (success) {
      setShowDeleteDialog(false);
      onOpenChange(false);
    }
  };

  const adjustValue = (setter: (v: number) => void, current: number, delta: number) => {
    const newValue = current + delta;
    if (newValue >= 0) setter(newValue);
  };

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle>{entry ? 'Editar Registro' : 'Novo Registro'}</DrawerTitle>
            <DrawerDescription className="capitalize">{formattedDate}</DrawerDescription>
          </DrawerHeader>

          <div className="px-4 py-2 space-y-6 overflow-y-auto flex-1">
            {/* Wins and Losses */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Gains</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => adjustValue(setWins, wins, -1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 text-center">
                    <span className="text-2xl font-bold text-success">{wins}</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => adjustValue(setWins, wins, 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Losses</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => adjustValue(setLosses, losses, -1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 text-center">
                    <span className="text-2xl font-bold text-destructive">{losses}</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => adjustValue(setLosses, losses, 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* PnL Percent */}
            <div className="space-y-2">
              <Label className="text-sm">Resultado do Dia (%)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Ex: 1.5 ou -0.8"
                value={pnlPercent}
                onChange={(e) => setPnlPercent(e.target.value)}
                className="text-lg h-12"
              />
            </div>

            {/* Emotional State */}
            <div className="space-y-2">
              <Label className="text-sm">Como você se sentiu?</Label>
              <div className="flex gap-2">
                {[
                  { value: 'good' as const, icon: Smile, label: 'Bem' },
                  { value: 'neutral' as const, icon: Meh, label: 'Neutro' },
                  { value: 'stressed' as const, icon: Frown, label: 'Estressado' },
                ].map(({ value, icon: Icon, label }) => (
                  <Button
                    key={value}
                    type="button"
                    variant={emotionalState === value ? 'default' : 'outline'}
                    className={cn(
                      "flex-1 flex-col gap-1 h-auto py-3",
                      emotionalState === value && value === 'good' && "bg-success hover:bg-success/90",
                      emotionalState === value && value === 'stressed' && "bg-destructive hover:bg-destructive/90"
                    )}
                    onClick={() => setEmotionalState(emotionalState === value ? null : value)}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs">{label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Followed Plan */}
            <div className="flex items-center justify-between">
              <Label className="text-sm">Seguiu o plano?</Label>
              <Switch
                checked={followedPlan}
                onCheckedChange={setFollowedPlan}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-sm">Observações (opcional)</Label>
              <Textarea
                placeholder="Anote insights, erros, aprendizados..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DrawerFooter className="pt-4">
            <div className="flex gap-2">
              {entry && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <DrawerClose asChild>
                <Button variant="outline" className="flex-1">Cancelar</Button>
              </DrawerClose>
              <Button 
                onClick={handleSave} 
                className="flex-1"
                disabled={isSaving}
              >
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir registro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O registro deste dia será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
