import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Brain, 
  FileText, 
  CheckCircle2, 
  XCircle,
  BarChart3,
  Pencil
} from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { JournalEntry } from '@/hooks/useJournal';

interface JournalDayDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  entry?: JournalEntry;
  pnlInReais?: number;
  cumulativeBalance?: number;
  onEdit: () => void;
}

const EMOTIONAL_STATES: Record<string, { label: string; emoji: string }> = {
  focused: { label: 'Focado', emoji: '🎯' },
  calm: { label: 'Calmo', emoji: '😌' },
  confident: { label: 'Confiante', emoji: '💪' },
  anxious: { label: 'Ansioso', emoji: '😰' },
  frustrated: { label: 'Frustrado', emoji: '😤' },
  neutral: { label: 'Neutro', emoji: '😐' },
};

export function JournalDayDetailDrawer({
  open,
  onOpenChange,
  date,
  entry,
  pnlInReais,
  cumulativeBalance,
  onEdit,
}: JournalDayDetailDrawerProps) {
  if (!date) return null;

  const formattedDate = date 
    ? format(parseISO(date), "EEEE, d 'de' MMMM", { locale: ptBR })
    : '';

  const hasEntry = !!entry;
  const pnlPercent = entry?.pnl_percent ?? 0;
  const isPositive = pnlPercent > 0;
  const isNegative = pnlPercent < 0;
  const trades = entry?.trades_count ?? 0;
  const wins = entry?.wins ?? 0;
  const losses = entry?.losses ?? 0;
  const winRate = trades > 0 ? Math.round((wins / trades) * 100) : 0;

  const emotionalState = entry?.emotional_state 
    ? EMOTIONAL_STATES[entry.emotional_state] || { label: entry.emotional_state, emoji: '😐' }
    : null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="capitalize text-lg">{formattedDate}</DrawerTitle>
          <DrawerDescription>
            {hasEntry ? 'Detalhes do dia de trading' : 'Nenhum registro neste dia'}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-4 space-y-4 overflow-y-auto">
          {hasEntry ? (
            <>
              {/* P&L Card */}
              <div className={cn(
                "p-4 rounded-xl",
                isPositive && "bg-success/10 border border-success/20",
                isNegative && "bg-destructive/10 border border-destructive/20",
                !isPositive && !isNegative && "bg-muted border border-border"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isPositive ? (
                      <TrendingUp className="h-5 w-5 text-success" />
                    ) : isNegative ? (
                      <TrendingDown className="h-5 w-5 text-destructive" />
                    ) : (
                      <BarChart3 className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium text-muted-foreground">Resultado</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      isPositive && "border-success text-success",
                      isNegative && "border-destructive text-destructive"
                    )}
                  >
                    {isPositive ? 'Positivo' : isNegative ? 'Negativo' : 'Neutro'}
                  </Badge>
                </div>
                
                <div className="mt-3 space-y-1">
                  <p className={cn(
                    "text-3xl font-bold",
                    isPositive && "text-success",
                    isNegative && "text-destructive"
                  )}>
                    {isPositive ? '+' : ''}{pnlPercent.toFixed(2)}%
                  </p>
                  {pnlInReais !== undefined && (
                    <p className={cn(
                      "text-sm font-medium",
                      isPositive && "text-success/80",
                      isNegative && "text-destructive/80",
                      !isPositive && !isNegative && "text-muted-foreground"
                    )}>
                      {pnlInReais >= 0 ? '+' : ''}
                      {pnlInReais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  )}
                  {cumulativeBalance !== undefined && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Saldo após o dia: {cumulativeBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  )}
                </div>
              </div>

              {/* Trades Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-card border border-border rounded-lg p-3 text-center">
                  <Target className="h-4 w-4 mx-auto text-primary mb-1" />
                  <p className="text-lg font-bold">{trades}</p>
                  <p className="text-[10px] text-muted-foreground">Trades</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-3 text-center">
                  <div className="flex justify-center gap-1 mb-1">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-xs text-muted-foreground">/</span>
                    <XCircle className="h-4 w-4 text-destructive" />
                  </div>
                  <p className="text-lg font-bold">{wins}/{losses}</p>
                  <p className="text-[10px] text-muted-foreground">Wins/Losses</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-3 text-center">
                  <BarChart3 className="h-4 w-4 mx-auto text-primary mb-1" />
                  <p className="text-lg font-bold">{winRate}%</p>
                  <p className="text-[10px] text-muted-foreground">Win Rate</p>
                </div>
              </div>

              {/* Emotional State & Followed Plan */}
              <div className="grid grid-cols-2 gap-3">
                {emotionalState && (
                  <div className="bg-card border border-border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="h-4 w-4 text-primary" />
                      <span className="text-xs text-muted-foreground">Estado Emocional</span>
                    </div>
                    <p className="text-sm font-medium">
                      {emotionalState.emoji} {emotionalState.label}
                    </p>
                  </div>
                )}
                
                {entry.followed_plan !== null && (
                  <div className="bg-card border border-border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-xs text-muted-foreground">Seguiu o Plano</span>
                    </div>
                    <p className="text-sm font-medium flex items-center gap-1">
                      {entry.followed_plan ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          Sim
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-destructive" />
                          Não
                        </>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Notes */}
              {entry.notes && (
                <div className="bg-card border border-border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Notas</span>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {entry.notes}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Você não registrou nenhum resultado para este dia.
              </p>
            </div>
          )}
        </div>

        <DrawerFooter className="pt-2">
          <Button onClick={onEdit} className="w-full">
            <Pencil className="h-4 w-4 mr-2" />
            {hasEntry ? 'Editar Registro' : 'Adicionar Registro'}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
