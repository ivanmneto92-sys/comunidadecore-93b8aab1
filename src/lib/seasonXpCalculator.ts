// =============================================
// SISTEMA DE XP ANTI-FARM - SEASON CALCULATOR
// =============================================

// Caps diários por fonte de XP
export const XP_CAPS = {
  daily: {
    checkin: 20,
    performance: 25,
    community: 40,
    tutorial: 30,
    achievement: 100,
    affiliate: 50,
    bonus: 30,
  },
  weekly: {
    tutorials: 200,
    community: 200,
  },
  monthly: {
    affiliates: 600,
  },
  dailyTotal: 90,
} as const;

// Multiplicadores de streak (com cap em 1.6x)
export const STREAK_MULTIPLIERS: Record<string, number> = {
  '1-6': 1.0,
  '7-13': 1.2,
  '14-29': 1.35,
  '30-59': 1.45,
  '60-119': 1.55,
  '120+': 1.6, // CAP
};

// Conversão de XP de temporada para XP total (20%)
export const SEASON_TO_TOTAL_RATIO = 0.2;

// Penalty por quebra de streak (20% menos por 3 dias)
export const STREAK_BREAK_PENALTY = 0.8;
export const STREAK_PENALTY_DAYS = 3;

/**
 * Obtém o multiplicador de streak baseado na quantidade de dias
 */
export function getStreakMultiplier(streak: number): number {
  if (streak >= 120) return 1.6;
  if (streak >= 60) return 1.55;
  if (streak >= 30) return 1.45;
  if (streak >= 14) return 1.35;
  if (streak >= 7) return 1.2;
  return 1.0;
}

/**
 * Calcula XP de check-in diário
 * BASE = 10, multiplicado por streak e penalty se aplicável
 */
export function calculateCheckinXp(streak: number, hasBreakPenalty: boolean = false): number {
  const BASE = 10;
  const mult = getStreakMultiplier(streak);
  const penalty = hasBreakPenalty ? STREAK_BREAK_PENALTY : 1.0;
  const raw = BASE * mult * penalty;
  return Math.min(Math.round(raw), XP_CAPS.daily.checkin);
}

/**
 * Calcula XP de performance do dia
 * Baseado em qualidade e risco, não em quantidade
 */
export function calculatePerformanceXp(
  isPositive: boolean,
  qualityScore: number = 1.0, // 0.8 a 1.4
  riskPercent: number = 1.0 // % do capital
): number {
  if (!isPositive) return 0;
  
  const BASE = 10;
  
  // Multiplicador de risco: baixo risco = mais XP
  const riskMult = riskPercent <= 1 ? 1.2 : riskPercent <= 2 ? 1.0 : 0.7;
  
  const raw = BASE * qualityScore * riskMult;
  return Math.min(Math.round(raw), XP_CAPS.daily.performance);
}

/**
 * Calcula XP de comunidade baseado em pontos de impacto
 * NÃO baseado em mensagens enviadas - anti-spam
 */
export function calculateCommunityXp(impactPoints: number): number {
  // impactPoints = curtidas (1) + respostas (2) + destaques (5) + "ajudou" (4)
  const raw = 5 + (2 * impactPoints);
  return Math.min(raw, XP_CAPS.daily.community);
}

/**
 * Calcula XP de tutorial com decaimento progressivo
 */
export function calculateTutorialXp(tutorialNumber: number): number {
  const BASE = 30;
  
  let multiplier = 1.0;
  if (tutorialNumber > 10) {
    multiplier = 0.6;
  } else if (tutorialNumber > 3) {
    multiplier = 0.8;
  }
  
  return Math.round(BASE * multiplier);
}

/**
 * Calcula XP de conquista baseado na raridade
 */
export function calculateAchievementXp(
  baseXp: number,
  difficultyMultiplier: number = 1.0 // 1.0 a 1.4
): number {
  return Math.round(baseXp * difficultyMultiplier);
}

/**
 * Calcula XP de afiliados (anti-golpe)
 */
export function calculateAffiliateXp(
  type: 'activation' | 'recurrence',
  isValid: boolean = true
): number {
  if (!isValid) return 0;
  
  if (type === 'activation') {
    return 50; // XP por indicado que vira cliente válido
  }
  return 10; // XP por mês ativo do indicado
}

/**
 * Converte XP de temporada para XP total (permanente)
 */
export function calculateTotalXp(seasonXp: number): number {
  return Math.round(seasonXp * SEASON_TO_TOTAL_RATIO);
}

/**
 * Calcula o XP necessário para um determinado nível
 */
export function getXpForLevel(level: number): number {
  if (level <= 1) return 0;
  if (level <= 10) return level * 50;
  if (level <= 25) return 500 + (level - 10) * 100;
  if (level <= 40) return 2000 + (level - 25) * 200;
  return 5000 + (level - 40) * 400;
}

/**
 * Calcula o XP total acumulado para atingir um nível
 */
export function getTotalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += getXpForLevel(i + 1);
  }
  return total;
}

/**
 * Calcula o nível baseado no XP total
 */
export function calculateLevelFromXp(xp: number): number {
  let level = 1;
  let remaining = xp;
  
  while (level < 50) {
    const needed = getXpForLevel(level + 1);
    if (remaining >= needed) {
      remaining -= needed;
      level++;
    } else {
      break;
    }
  }
  
  return Math.min(level, 50);
}

/**
 * Calcula progresso dentro do nível atual (0-100%)
 */
export function getLevelProgress(xp: number): { 
  currentLevel: number; 
  currentXp: number; 
  nextLevelXp: number; 
  progress: number;
} {
  const currentLevel = calculateLevelFromXp(xp);
  const totalForCurrent = getTotalXpForLevel(currentLevel);
  const currentXp = xp - totalForCurrent;
  const nextLevelXp = getXpForLevel(currentLevel + 1);
  const progress = currentLevel >= 50 ? 100 : Math.round((currentXp / nextLevelXp) * 100);
  
  return {
    currentLevel,
    currentXp,
    nextLevelXp,
    progress,
  };
}

// XP total para completar temporada (nível 50): ~15.000 XP
export const TOTAL_SEASON_XP = getTotalXpForLevel(50);

// Marcos de nível com recompensas
export const LEVEL_MILESTONES = [
  { level: 5, reward: 'badge', description: 'Badge da Temporada' },
  { level: 10, reward: 'theme', description: 'Tema visual exclusivo' },
  { level: 20, reward: 'achievement', description: 'Conquista temática' },
  { level: 30, reward: 'early_access', description: 'Acesso antecipado a recurso' },
  { level: 40, reward: 'elite_badge', description: 'Selo Elite' },
  { level: 50, reward: 'legendary_title', description: 'Título Lendário da Temporada' },
] as const;
