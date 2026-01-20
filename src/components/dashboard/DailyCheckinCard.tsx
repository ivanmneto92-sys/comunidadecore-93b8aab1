import { useState, memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Flame, Calendar, Check, Sparkles } from 'lucide-react';
import { useCheckin } from '@/hooks/useCheckin';
import { CheckinSuccessModal } from './CheckinSuccessModal';
import { Skeleton } from '@/components/ui/skeleton';

export const DailyCheckinCard = memo(function DailyCheckinCard() {
  const {
    hasCheckedInToday,
    currentStreak,
    totalXp,
    todayXpReward,
    nextMilestone,
    isLoading,
    performCheckin,
  } = useCheckin();

  const [isCheckinLoading, setIsCheckinLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [checkinResult, setCheckinResult] = useState({ xpEarned: 0, newStreak: 0 });

  const handleCheckin = async () => {
    setIsCheckinLoading(true);
    const result = await performCheckin();
    setIsCheckinLoading(false);

    if (result.success) {
      setCheckinResult({ xpEarned: result.xpEarned, newStreak: result.newStreak });
      setShowSuccessModal(true);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-10 w-28" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressToMilestone = nextMilestone > 0 ? (currentStreak / nextMilestone) * 100 : 0;

  return (
    <>
      <Card className={`border-primary/20 overflow-hidden ${!hasCheckedInToday ? 'ring-2 ring-primary/50 ring-offset-2 ring-offset-background' : ''}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent pointer-events-none" />
        <CardContent className="p-4 relative">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Streak Info */}
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                hasCheckedInToday 
                  ? 'bg-primary/20' 
                  : 'bg-gradient-to-br from-primary to-primary/60 animate-pulse'
              }`}>
                {hasCheckedInToday ? (
                  <Check className="w-6 h-6 text-primary" />
                ) : (
                  <Calendar className="w-6 h-6 text-primary-foreground" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">
                    {hasCheckedInToday ? 'Check-in Feito!' : 'Check-in Diário'}
                  </span>
                  {currentStreak > 0 && (
                    <span className="flex items-center gap-1 text-sm font-medium text-orange-500">
                      <Flame className="w-4 h-4" fill="currentColor" />
                      {currentStreak}
                    </span>
                  )}
                </div>
                {!hasCheckedInToday ? (
                  <p className="text-sm text-muted-foreground">
                    Ganhe <span className="text-primary font-semibold">+{todayXpReward} XP_S</span> hoje
                  </p>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={progressToMilestone} className="h-1.5 w-20" />
                    <span className="text-xs text-muted-foreground">
                      {currentStreak}/{nextMilestone} dias
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Action Button */}
            {!hasCheckedInToday && (
              <Button
                onClick={handleCheckin}
                disabled={isCheckinLoading}
                className="shrink-0 gap-2"
                size="sm"
              >
                {isCheckinLoading ? (
                  'Salvando...'
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Check-in
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <CheckinSuccessModal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        xpEarned={checkinResult.xpEarned}
        newStreak={checkinResult.newStreak}
        totalXp={totalXp}
      />
    </>
  );
});
