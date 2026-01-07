// Affiliate Level System Configuration

export interface AffiliateLevel {
  id: string;
  name: string;
  minReferrals: number;
  maxReferrals: number | null;
  icon: string;
  color: string;
  benefits: string[];
  bonusMultiplier: number;
}

export const AFFILIATE_LEVELS: AffiliateLevel[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    minReferrals: 0,
    maxReferrals: 4,
    icon: '🥉',
    color: 'from-amber-700 to-amber-900',
    benefits: ['Comissões padrão', 'Suporte por email'],
    bonusMultiplier: 1.0,
  },
  {
    id: 'silver',
    name: 'Prata',
    minReferrals: 5,
    maxReferrals: 14,
    icon: '🥈',
    color: 'from-slate-400 to-slate-600',
    benefits: ['Comissões padrão', 'Suporte prioritário', 'Badge exclusiva'],
    bonusMultiplier: 1.0,
  },
  {
    id: 'gold',
    name: 'Ouro',
    minReferrals: 15,
    maxReferrals: 29,
    icon: '🥇',
    color: 'from-yellow-400 to-yellow-600',
    benefits: ['Bônus +10% em comissões', 'Suporte VIP', 'Badge exclusiva', 'Materiais premium'],
    bonusMultiplier: 1.1,
  },
  {
    id: 'diamond',
    name: 'Diamante',
    minReferrals: 30,
    maxReferrals: null,
    icon: '💎',
    color: 'from-cyan-400 to-blue-600',
    benefits: ['Bônus +20% em comissões', 'Gerente dedicado', 'Badge exclusiva', 'Materiais premium', 'Acesso antecipado'],
    bonusMultiplier: 1.2,
  },
];

export function getAffiliateLevel(referralCount: number): AffiliateLevel {
  for (let i = AFFILIATE_LEVELS.length - 1; i >= 0; i--) {
    if (referralCount >= AFFILIATE_LEVELS[i].minReferrals) {
      return AFFILIATE_LEVELS[i];
    }
  }
  return AFFILIATE_LEVELS[0];
}

export function getNextLevel(currentLevel: AffiliateLevel): AffiliateLevel | null {
  const currentIndex = AFFILIATE_LEVELS.findIndex((l) => l.id === currentLevel.id);
  if (currentIndex < AFFILIATE_LEVELS.length - 1) {
    return AFFILIATE_LEVELS[currentIndex + 1];
  }
  return null;
}

export function getLevelProgress(referralCount: number, currentLevel: AffiliateLevel, nextLevel: AffiliateLevel | null): number {
  if (!nextLevel) return 100;
  
  const currentMin = currentLevel.minReferrals;
  const nextMin = nextLevel.minReferrals;
  const progress = ((referralCount - currentMin) / (nextMin - currentMin)) * 100;
  
  return Math.min(Math.max(progress, 0), 100);
}
