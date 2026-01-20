import { useSeasonAchievements, SeasonAchievementWithProgress } from '@/hooks/useSeasonAchievements';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Lock, Check, Star, Flame, Shield, Trophy, Calendar, Crown, TrendingUp, Zap, RefreshCw, Activity, BookOpen, Target, Crosshair, BarChart, Award, Users, Heart, Medal } from 'lucide-react';
import { RARITY_COLORS, RARITY_LABELS, CATEGORY_LABELS } from '@/lib/seasonDefinitions';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Star, Flame, Shield, Trophy, Calendar, Crown, TrendingUp, Zap, RefreshCw, Activity, BookOpen, Target, Crosshair, BarChart, Award, Users, Heart, Medal, CalendarCheck: Calendar, Hammer: Shield, Sunrise: Star,
};

interface AchievementCardProps {
  achievement: SeasonAchievementWithProgress;
}

function AchievementCard({ achievement }: AchievementCardProps) {
  const rarityStyle = RARITY_COLORS[achievement.rarity] || RARITY_COLORS.common;
  const IconComponent = ICON_MAP[achievement.icon] || Star;
  
  return (
    <Card className={cn(
      'transition-all duration-200',
      achievement.isUnlocked 
        ? 'border-primary/50 bg-primary/5' 
        : 'opacity-80 hover:opacity-100'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Ícone */}
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            achievement.isUnlocked 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground'
          )}>
            {achievement.isUnlocked ? (
              <IconComponent className="w-6 h-6" />
            ) : (
              <Lock className="w-5 h-5" />
            )}
          </div>
          
          {/* Conteúdo */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm truncate">{achievement.name}</h3>
              {achievement.isUnlocked && (
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
              )}
            </div>
            
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
              {achievement.description}
            </p>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={cn('text-xs', rarityStyle.text, rarityStyle.border)}>
                {RARITY_LABELS[achievement.rarity]}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                +{achievement.xp_reward} XP
              </Badge>
            </div>
            
            {/* Barra de progresso se não desbloqueada */}
            {!achievement.isUnlocked && (
              <div className="mt-2">
                <Progress value={achievement.progress} className="h-1.5" />
                <span className="text-xs text-muted-foreground">{achievement.progress}%</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SeasonAchievementsList() {
  const { achievements, isLoading, stats } = useSeasonAchievements();
  
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }
  
  // Agrupar por categoria
  const byCategory = achievements.reduce((acc, ach) => {
    const cat = ach.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ach);
    return acc;
  }, {} as Record<string, SeasonAchievementWithProgress[]>);
  
  const categories = Object.keys(byCategory);
  
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-primary">{stats.unlocked}</p>
            <p className="text-xs text-muted-foreground">Desbloqueadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-500">{stats.xpEarned}</p>
            <p className="text-xs text-muted-foreground">XP Ganho</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Conquistas por categoria */}
      {categories.map(category => (
        <div key={category}>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            {CATEGORY_LABELS[category] || category}
          </h3>
          <div className="space-y-3">
            {byCategory[category].map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
