import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Flame, Sparkles, Star } from 'lucide-react';

interface CheckinSuccessModalProps {
  open: boolean;
  onClose: () => void;
  xpEarned: number;
  newStreak: number;
  totalXp: number;
}

export function CheckinSuccessModal({
  open,
  onClose,
  xpEarned,
  newStreak,
  totalXp,
}: CheckinSuccessModalProps) {
  const isWeekMilestone = newStreak === 7 || newStreak === 14 || newStreak === 21;
  const isMonthMilestone = newStreak === 30 || newStreak === 60 || newStreak === 100;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-primary/20 bg-gradient-to-b from-background to-primary/5">
        <div className="flex flex-col items-center text-center py-4 space-y-4">
          {/* Animated Icon */}
          <div className="relative">
            <div className="absolute inset-0 animate-ping bg-primary/20 rounded-full" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              {isMonthMilestone ? (
                <Star className="w-10 h-10 text-primary-foreground animate-pulse" fill="currentColor" />
              ) : (
                <Flame className="w-10 h-10 text-primary-foreground" fill="currentColor" />
              )}
            </div>
            <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-yellow-500 animate-bounce" />
          </div>

          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {isMonthMilestone ? '🎉 Marco Incrível!' : isWeekMilestone ? '🔥 Semana Completa!' : 'Check-in Feito!'}
            </h2>
            <p className="text-muted-foreground mt-1">
              Você está construindo consistência
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-6 py-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">+{xpEarned}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">XP Ganho</div>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground flex items-center gap-1">
                <Flame className="w-6 h-6 text-orange-500" />
                {newStreak}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Dias Seguidos</div>
            </div>
          </div>

          {/* Milestone Message */}
          {(isWeekMilestone || isMonthMilestone) && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-2 text-sm text-primary">
              {newStreak === 7 && '🏆 Primeira semana completa!'}
              {newStreak === 14 && '💪 Duas semanas de dedicação!'}
              {newStreak === 21 && '🌟 Três semanas! Hábito formado!'}
              {newStreak === 30 && '🏅 Um mês inteiro! Você é incrível!'}
              {newStreak === 60 && '🚀 60 dias! Disciplina de elite!'}
              {newStreak === 100 && '👑 100 dias! Lenda da comunidade!'}
            </div>
          )}

          {/* Total XP */}
          <p className="text-sm text-muted-foreground">
            XP Total: <span className="font-semibold text-foreground">{totalXp.toLocaleString()}</span>
          </p>

          {/* Close Button */}
          <Button onClick={onClose} className="w-full mt-2">
            Continuar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
