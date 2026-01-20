// =============================================
// DEFINIÇÕES DE TEMPORADAS
// =============================================

export interface SeasonDefinition {
  quarter: 1 | 2 | 3 | 4;
  name: string;
  theme: string;
  themeEmoji: string;
  description: string;
  objectivePsychological: string;
  colorPrimary: string;
  colorSecondary: string;
  achievements: SeasonAchievementDef[];
  titleReward: {
    code: string;
    name: string;
    emoji: string;
  };
  badgeDescription: string;
}

export interface SeasonAchievementDef {
  code: string;
  name: string;
  description: string;
  icon: string;
  category: 'consistency' | 'performance' | 'community' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  requirementType: string;
  requirementValue: number;
}

// Temporada I - Janeiro a Março
export const SEASON_1_FORGE: SeasonDefinition = {
  quarter: 1,
  name: 'A Forja',
  theme: 'forge',
  themeEmoji: '🔥',
  description: 'Construção, disciplina, base sólida. Crie hábito e identidade.',
  objectivePsychological: 'Criar hábito e identidade',
  colorPrimary: 'hsl(24, 100%, 50%)', // Laranja fogo
  colorSecondary: 'hsl(0, 100%, 40%)', // Vermelho brasa
  titleReward: {
    code: 'fundador_forja',
    name: 'Fundador da Forja',
    emoji: '🔥',
  },
  badgeDescription: 'Metal incandescente',
  achievements: [
    { code: 'forja_fogo', name: 'Forjado no Fogo', description: '45 dias ativos na temporada', icon: 'Flame', category: 'consistency', rarity: 'epic', xpReward: 350, requirementType: 'active_days', requirementValue: 45 },
    { code: 'forja_base', name: 'Base Sólida', description: '30 dias sem quebrar streak', icon: 'Shield', category: 'consistency', rarity: 'rare', xpReward: 280, requirementType: 'streak_unbroken', requirementValue: 30 },
    { code: 'forja_construtor', name: 'Construtor', description: '15 dias positivos', icon: 'Hammer', category: 'performance', rarity: 'common', xpReward: 150, requirementType: 'positive_days', requirementValue: 15 },
    { code: 'forja_fundador', name: 'Fundador da Forja', description: 'Alcançar nível 50 da temporada', icon: 'Crown', category: 'special', rarity: 'legendary', xpReward: 700, requirementType: 'season_level', requirementValue: 50 },
    { code: 'forja_semana', name: 'Semana de Fogo', description: '7 dias consecutivos de check-in', icon: 'Calendar', category: 'consistency', rarity: 'common', xpReward: 80, requirementType: 'streak', requirementValue: 7 },
    { code: 'forja_quinzena', name: 'Quinzena Forte', description: '15 dias consecutivos de check-in', icon: 'CalendarCheck', category: 'consistency', rarity: 'rare', xpReward: 180, requirementType: 'streak', requirementValue: 15 },
    { code: 'forja_mes', name: 'Mês de Ferro', description: '30 dias consecutivos de check-in', icon: 'Trophy', category: 'consistency', rarity: 'epic', xpReward: 350, requirementType: 'streak', requirementValue: 30 },
  ],
};

// Temporada II - Abril a Junho
export const SEASON_2_ASCENSION: SeasonDefinition = {
  quarter: 2,
  name: 'Ascensão',
  theme: 'ascension',
  themeEmoji: '⚔️',
  description: 'Evolução, superação, crescimento. Saia da média.',
  objectivePsychological: 'Sair da média',
  colorPrimary: 'hsl(45, 100%, 50%)', // Dourado
  colorSecondary: 'hsl(35, 100%, 40%)', // Bronze
  titleReward: {
    code: 'mestre_ascensao',
    name: 'Mestre da Ascensão',
    emoji: '⚔️',
  },
  badgeDescription: 'Lâmina dourada',
  achievements: [
    { code: 'asc_evolucao', name: 'Em Ascensão', description: 'Subir 15 níveis na temporada', icon: 'TrendingUp', category: 'performance', rarity: 'rare', xpReward: 200, requirementType: 'levels_gained', requirementValue: 15 },
    { code: 'asc_evolutivo', name: 'Evolutivo', description: '20 dias positivos', icon: 'Zap', category: 'performance', rarity: 'rare', xpReward: 180, requirementType: 'positive_days', requirementValue: 20 },
    { code: 'asc_resiliente', name: 'Resiliente', description: 'Recuperar streak após quebra', icon: 'RefreshCw', category: 'consistency', rarity: 'common', xpReward: 150, requirementType: 'streak_recovered', requirementValue: 1 },
    { code: 'asc_mestre', name: 'Mestre da Ascensão', description: 'Alcançar nível 50 da temporada', icon: 'Crown', category: 'special', rarity: 'legendary', xpReward: 700, requirementType: 'season_level', requirementValue: 50 },
    { code: 'asc_constante', name: 'Constância', description: '45 dias de check-in', icon: 'Activity', category: 'consistency', rarity: 'epic', xpReward: 350, requirementType: 'active_days', requirementValue: 45 },
    { code: 'asc_dedicado', name: 'Dedicado', description: 'Completar 10 tutoriais', icon: 'BookOpen', category: 'performance', rarity: 'common', xpReward: 120, requirementType: 'tutorials_completed', requirementValue: 10 },
  ],
};

// Temporada III - Julho a Setembro
export const SEASON_3_MASTERY: SeasonDefinition = {
  quarter: 3,
  name: 'Domínio',
  theme: 'mastery',
  themeEmoji: '🧠',
  description: 'Controle, inteligência, precisão. Jogue melhor, não mais.',
  objectivePsychological: 'Jogar melhor, não mais',
  colorPrimary: 'hsl(280, 100%, 50%)', // Roxo
  colorSecondary: 'hsl(260, 100%, 40%)', // Índigo
  titleReward: {
    code: 'senhor_dominio',
    name: 'Senhor do Domínio',
    emoji: '🧠',
  },
  badgeDescription: 'Cristal púrpura',
  achievements: [
    { code: 'dom_estrategista', name: 'Estrategista', description: '20 dias com risco controlado', icon: 'Target', category: 'performance', rarity: 'rare', xpReward: 200, requirementType: 'low_risk_days', requirementValue: 20 },
    { code: 'dom_cirurgico', name: 'Cirúrgico', description: 'R/R médio acima do padrão', icon: 'Crosshair', category: 'performance', rarity: 'epic', xpReward: 250, requirementType: 'high_rr_average', requirementValue: 1 },
    { code: 'dom_analista', name: 'Analista', description: 'Uso recorrente dos dados do journal', icon: 'BarChart', category: 'performance', rarity: 'rare', xpReward: 180, requirementType: 'journal_entries', requirementValue: 30 },
    { code: 'dom_senhor', name: 'Senhor do Domínio', description: 'Alcançar nível 50 da temporada', icon: 'Crown', category: 'special', rarity: 'legendary', xpReward: 700, requirementType: 'season_level', requirementValue: 50 },
    { code: 'dom_disciplinado', name: 'Disciplinado', description: '60 dias de check-in', icon: 'Shield', category: 'consistency', rarity: 'epic', xpReward: 400, requirementType: 'active_days', requirementValue: 60 },
    { code: 'dom_mestre_comunidade', name: 'Voz da Comunidade', description: '50 interações de qualidade', icon: 'MessageCircle', category: 'community', rarity: 'rare', xpReward: 200, requirementType: 'quality_interactions', requirementValue: 50 },
  ],
};

// Temporada IV - Outubro a Dezembro
export const SEASON_4_LEGACY: SeasonDefinition = {
  quarter: 4,
  name: 'Legado',
  theme: 'legacy',
  themeEmoji: '👑',
  description: 'Status, influência, liderança. Reconhecimento social.',
  objectivePsychological: 'Reconhecimento social',
  colorPrimary: 'hsl(45, 100%, 50%)', // Ouro
  colorSecondary: 'hsl(25, 100%, 40%)', // Bronze real
  titleReward: {
    code: 'lenda_ano',
    name: 'Lenda do Ano',
    emoji: '👑',
  },
  badgeDescription: 'Coroa dourada animada',
  achievements: [
    { code: 'leg_elite', name: 'Elite Anual', description: 'Top 10% do ranking da temporada', icon: 'Award', category: 'special', rarity: 'epic', xpReward: 400, requirementType: 'top_percent', requirementValue: 10 },
    { code: 'leg_referencia', name: 'Referência', description: 'Alto impacto na comunidade', icon: 'Star', category: 'community', rarity: 'epic', xpReward: 350, requirementType: 'community_impact', requirementValue: 100 },
    { code: 'leg_mentor', name: 'Mentor', description: 'Ajuda validada a outros usuários', icon: 'Users', category: 'community', rarity: 'rare', xpReward: 300, requirementType: 'helped_users', requirementValue: 5 },
    { code: 'leg_lenda', name: 'Lenda do Ano', description: 'Alcançar nível 50 da temporada', icon: 'Crown', category: 'special', rarity: 'legendary', xpReward: 1000, requirementType: 'season_level', requirementValue: 50 },
    { code: 'leg_veterano', name: 'Veterano', description: '75 dias de check-in no ano', icon: 'Medal', category: 'consistency', rarity: 'epic', xpReward: 500, requirementType: 'active_days', requirementValue: 75 },
    { code: 'leg_influencer', name: 'Influenciador', description: '100 curtidas recebidas', icon: 'Heart', category: 'community', rarity: 'rare', xpReward: 250, requirementType: 'likes_received', requirementValue: 100 },
  ],
};

// Mapa de todas as temporadas
export const SEASON_DEFINITIONS: Record<number, SeasonDefinition> = {
  1: SEASON_1_FORGE,
  2: SEASON_2_ASCENSION,
  3: SEASON_3_MASTERY,
  4: SEASON_4_LEGACY,
};

/**
 * Obtém a definição da temporada pelo quarter (1-4)
 */
export function getSeasonDefinition(quarter: number): SeasonDefinition | null {
  return SEASON_DEFINITIONS[quarter] || null;
}

/**
 * Obtém o quarter atual baseado na data
 */
export function getCurrentQuarter(date: Date = new Date()): number {
  const month = date.getMonth(); // 0-11
  if (month <= 2) return 1; // Jan-Mar
  if (month <= 5) return 2; // Apr-Jun
  if (month <= 8) return 3; // Jul-Sep
  return 4; // Oct-Dec
}

/**
 * Labels de categoria de conquista
 */
export const CATEGORY_LABELS: Record<string, string> = {
  consistency: 'Consistência',
  performance: 'Performance',
  community: 'Comunidade',
  special: 'Especial',
};

/**
 * Cores por raridade
 */
export const RARITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  common: { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-muted' },
  rare: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
  epic: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/50' },
  legendary: { bg: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
};

/**
 * Labels de raridade
 */
export const RARITY_LABELS: Record<string, string> = {
  common: 'Comum',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Lendário',
};

// Sistema de Prestígio
export const PRESTIGE_LEVELS = [
  { level: 1, requirement: 2, xpBonus: 1.15, badge: '⭐' },
  { level: 2, requirement: 4, xpBonus: 1.30, badge: '⭐⭐' },
  { level: 3, requirement: 6, xpBonus: 1.45, badge: '⭐⭐⭐' },
  { level: 4, requirement: 8, xpBonus: 1.60, badge: '🌟🌟' },
  { level: 5, requirement: 10, xpBonus: 1.75, badge: '💫' },
] as const;

/**
 * Calcula nível de prestígio baseado em temporadas completadas no nível 50
 */
export function calculatePrestigeLevel(seasonsAtMax: number): number {
  for (let i = PRESTIGE_LEVELS.length - 1; i >= 0; i--) {
    if (seasonsAtMax >= PRESTIGE_LEVELS[i].requirement) {
      return PRESTIGE_LEVELS[i].level;
    }
  }
  return 0;
}

/**
 * Obtém informações do nível de prestígio
 */
export function getPrestigeInfo(level: number) {
  return PRESTIGE_LEVELS.find(p => p.level === level) || null;
}
