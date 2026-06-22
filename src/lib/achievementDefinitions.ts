export interface AchievementDefinition {
  code: string;
  category: 'consistency' | 'learning' | 'community' | 'performance' | 'affiliates' | 'special';
  checkProgress: (data: AchievementCheckData) => { current: number; target: number };
}

export interface AchievementCheckData {
  checkinStreak: number;
  tutorialsCompleted: number;
  totalTutorials: number;
  messagesCount: number;
  performanceStreak: number;
  affiliateEarnings: number;
  memberSince: Date | null;
  totalXp: number;
}

export const achievementDefinitions: AchievementDefinition[] = [
  // Consistência - Check-in streak
  { code: 'checkin_14',  category: 'consistency', checkProgress: d => ({ current: d.checkinStreak, target: 14 }) },
  { code: 'checkin_30',  category: 'consistency', checkProgress: d => ({ current: d.checkinStreak, target: 30 }) },
  { code: 'checkin_60',  category: 'consistency', checkProgress: d => ({ current: d.checkinStreak, target: 60 }) },
  { code: 'checkin_120', category: 'consistency', checkProgress: d => ({ current: d.checkinStreak, target: 120 }) },
  { code: 'checkin_180', category: 'consistency', checkProgress: d => ({ current: d.checkinStreak, target: 180 }) },

  // Aprendizado
  { code: 'tutorial_5',   category: 'learning', checkProgress: d => ({ current: d.tutorialsCompleted, target: 5 }) },
  { code: 'tutorial_15',  category: 'learning', checkProgress: d => ({ current: d.tutorialsCompleted, target: 15 }) },
  { code: 'tutorial_all', category: 'learning', checkProgress: d => ({ current: d.tutorialsCompleted, target: d.totalTutorials || 10 }) },

  // Comunidade
  { code: 'message_50',   category: 'community', checkProgress: d => ({ current: d.messagesCount, target: 50 }) },
  { code: 'message_100',  category: 'community', checkProgress: d => ({ current: d.messagesCount, target: 100 }) },
  { code: 'message_500',  category: 'community', checkProgress: d => ({ current: d.messagesCount, target: 500 }) },
  { code: 'message_1000', category: 'community', checkProgress: d => ({ current: d.messagesCount, target: 1000 }) },

  // Performance (MT5 pessoal)
  { code: 'streak_5',  category: 'performance', checkProgress: d => ({ current: d.performanceStreak, target: 5 }) },
  { code: 'streak_10', category: 'performance', checkProgress: d => ({ current: d.performanceStreak, target: 10 }) },
  { code: 'streak_20', category: 'performance', checkProgress: d => ({ current: d.performanceStreak, target: 20 }) },
  { code: 'streak_40', category: 'performance', checkProgress: d => ({ current: d.performanceStreak, target: 40 }) },

  // Afiliados (em R$)
  { code: 'affiliate_bronze',  category: 'affiliates', checkProgress: d => ({ current: Math.floor(d.affiliateEarnings), target: 500 }) },
  { code: 'affiliate_silver',  category: 'affiliates', checkProgress: d => ({ current: Math.floor(d.affiliateEarnings), target: 3000 }) },
  { code: 'affiliate_gold',    category: 'affiliates', checkProgress: d => ({ current: Math.floor(d.affiliateEarnings), target: 10000 }) },
  { code: 'affiliate_diamond', category: 'affiliates', checkProgress: d => ({ current: Math.floor(d.affiliateEarnings), target: 25000 }) },

  // Especiais
  {
    code: 'early_adopter',
    category: 'special',
    checkProgress: d => {
      const cutoff = new Date('2026-03-01');
      const ok = d.memberSince && d.memberSince < cutoff;
      return { current: ok ? 1 : 0, target: 1 };
    },
  },
  {
    code: 'veteran_1y',
    category: 'special',
    checkProgress: d => {
      if (!d.memberSince) return { current: 0, target: 365 };
      const days = Math.floor((Date.now() - d.memberSince.getTime()) / 86400000);
      return { current: days, target: 365 };
    },
  },
  { code: 'xp_5000',  category: 'special', checkProgress: d => ({ current: d.totalXp, target: 5000 }) },
  { code: 'xp_25000', category: 'special', checkProgress: d => ({ current: d.totalXp, target: 25000 }) },
];

export const categoryLabels: Record<string, string> = {
  all: 'Todas',
  consistency: 'Consistência',
  learning: 'Aprendizado',
  community: 'Comunidade',
  performance: 'Performance',
  affiliates: 'Afiliados',
  special: 'Especiais',
};

export const rarityLabels: Record<string, string> = {
  common: 'Comum',
  rare: 'Rara',
  epic: 'Épica',
  legendary: 'Lendária',
};

export const rarityColors: Record<string, { bg: string; text: string; border: string }> = {
  common: { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' },
  rare: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  epic: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  legendary: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
};
