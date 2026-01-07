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
  affiliateLevel: number;
  memberSince: Date | null;
  totalXp: number;
}

export const achievementDefinitions: AchievementDefinition[] = [
  // Consistência - Check-in streak
  {
    code: 'checkin_7',
    category: 'consistency',
    checkProgress: (data) => ({ current: data.checkinStreak, target: 7 }),
  },
  {
    code: 'checkin_14',
    category: 'consistency',
    checkProgress: (data) => ({ current: data.checkinStreak, target: 14 }),
  },
  {
    code: 'checkin_30',
    category: 'consistency',
    checkProgress: (data) => ({ current: data.checkinStreak, target: 30 }),
  },
  {
    code: 'checkin_60',
    category: 'consistency',
    checkProgress: (data) => ({ current: data.checkinStreak, target: 60 }),
  },
  {
    code: 'checkin_90',
    category: 'consistency',
    checkProgress: (data) => ({ current: data.checkinStreak, target: 90 }),
  },

  // Aprendizado - Tutoriais
  {
    code: 'tutorial_1',
    category: 'learning',
    checkProgress: (data) => ({ current: data.tutorialsCompleted, target: 1 }),
  },
  {
    code: 'tutorial_5',
    category: 'learning',
    checkProgress: (data) => ({ current: data.tutorialsCompleted, target: 5 }),
  },
  {
    code: 'tutorial_all',
    category: 'learning',
    checkProgress: (data) => ({ current: data.tutorialsCompleted, target: data.totalTutorials || 10 }),
  },

  // Comunidade - Mensagens
  {
    code: 'message_1',
    category: 'community',
    checkProgress: (data) => ({ current: data.messagesCount, target: 1 }),
  },
  {
    code: 'message_10',
    category: 'community',
    checkProgress: (data) => ({ current: data.messagesCount, target: 10 }),
  },
  {
    code: 'message_50',
    category: 'community',
    checkProgress: (data) => ({ current: data.messagesCount, target: 50 }),
  },
  {
    code: 'message_100',
    category: 'community',
    checkProgress: (data) => ({ current: data.messagesCount, target: 100 }),
  },

  // Performance - Streak verde
  {
    code: 'streak_3',
    category: 'performance',
    checkProgress: (data) => ({ current: data.performanceStreak, target: 3 }),
  },
  {
    code: 'streak_7',
    category: 'performance',
    checkProgress: (data) => ({ current: data.performanceStreak, target: 7 }),
  },
  {
    code: 'streak_14',
    category: 'performance',
    checkProgress: (data) => ({ current: data.performanceStreak, target: 14 }),
  },
  {
    code: 'streak_30',
    category: 'performance',
    checkProgress: (data) => ({ current: data.performanceStreak, target: 30 }),
  },

  // Afiliados
  {
    code: 'affiliate_bronze',
    category: 'affiliates',
    checkProgress: (data) => ({ current: data.affiliateLevel, target: 1 }),
  },
  {
    code: 'affiliate_silver',
    category: 'affiliates',
    checkProgress: (data) => ({ current: data.affiliateLevel, target: 2 }),
  },
  {
    code: 'affiliate_gold',
    category: 'affiliates',
    checkProgress: (data) => ({ current: data.affiliateLevel, target: 3 }),
  },
  {
    code: 'affiliate_diamond',
    category: 'affiliates',
    checkProgress: (data) => ({ current: data.affiliateLevel, target: 4 }),
  },

  // Especiais
  {
    code: 'early_adopter',
    category: 'special',
    checkProgress: (data) => {
      const cutoffDate = new Date('2026-03-01');
      const isEarlyAdopter = data.memberSince && data.memberSince < cutoffDate;
      return { current: isEarlyAdopter ? 1 : 0, target: 1 };
    },
  },
  {
    code: 'veteran_1y',
    category: 'special',
    checkProgress: (data) => {
      if (!data.memberSince) return { current: 0, target: 365 };
      const daysSinceMember = Math.floor((Date.now() - data.memberSince.getTime()) / (1000 * 60 * 60 * 24));
      return { current: daysSinceMember, target: 365 };
    },
  },
  {
    code: 'xp_1000',
    category: 'special',
    checkProgress: (data) => ({ current: data.totalXp, target: 1000 }),
  },
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

export const rarityColors: Record<string, { bg: string; text: string; border: string }> = {
  common: { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' },
  rare: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  epic: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  legendary: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
};
