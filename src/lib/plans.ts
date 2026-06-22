import type { MembershipTier } from '@/hooks/useUserProfile';

/**
 * Instituto Trader — definição comercial dos planos (PDF, página 3 + 4).
 *
 * Mapeamento para o enum interno `membership_tier` (free | plus | elite):
 *   Start    → free
 *   Academy  → plus
 *   Copy     → plus  (futuro: feature flag 'copy' separada)
 *   Pro      → elite
 *
 * Preços base são placeholders e devem ser ajustados no admin/banco.
 * "Conteúdo educacional — não há promessa de retorno."
 */

export type PlanId = 'start' | 'academy' | 'copy' | 'pro';

export interface PlanDefinition {
  id: PlanId;
  name: string;
  tagline: string;
  /** Tier interno mínimo que esse plano concede. */
  tier: MembershipTier;
  /** Preço base sugerido (placeholder editorial — ajustar via admin). */
  priceBRL: number;
  period: 'mês' | 'ano' | 'único';
  highlight?: boolean;
  features: string[];
  excluded?: string[];
  /** CTA da página de planos. */
  cta: string;
}

export const PLANS: PlanDefinition[] = [
  {
    id: 'start',
    name: 'Start',
    tagline: 'Comece a entender o mercado com base sólida.',
    tier: 'free',
    priceBRL: 0,
    period: 'mês',
    features: [
      'Acesso à comunidade Club (canais públicos)',
      'Conteúdo introdutório da Academy',
      'Calendário de lives abertas',
      'Notícias e contexto de mercado',
      'Aviso de risco e materiais de gestão',
    ],
    cta: 'Criar conta grátis',
  },
  {
    id: 'academy',
    name: 'Academy',
    tagline: 'Trilhas completas, quizzes e jornada estruturada.',
    tier: 'plus',
    priceBRL: 97,
    period: 'mês',
    features: [
      'Tudo do Start',
      'Trilhas completas da Academy',
      'Quizzes e progresso por módulo',
      'Replays e materiais de lives',
      'Journal pessoal de operações',
      'Conquistas e gamificação',
    ],
    cta: 'Quero o Academy',
  },
  {
    id: 'copy',
    name: 'Copy',
    tagline: 'Acompanhe estratégias com transparência e controle.',
    tier: 'plus',
    priceBRL: 197,
    period: 'mês',
    highlight: true,
    features: [
      'Tudo do Academy',
      'Acesso à área Copy com estratégias replicáveis',
      'Histórico, drawdown e métricas das estratégias',
      'Termo de consentimento com lote e ativo',
      'Relatórios operacionais por estratégia',
      'Suporte prioritário no Club',
    ],
    cta: 'Quero o Copy',
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Acompanhamento próximo, bastidores e benefícios premium.',
    tier: 'elite',
    priceBRL: 397,
    period: 'mês',
    features: [
      'Tudo do Copy',
      'Canais Pro fechados e bastidores',
      'Mentorias e encontros exclusivos',
      'Acesso antecipado a EAs e ferramentas',
      'Benefícios em parceiros e Store',
      'Atendimento dedicado',
    ],
    cta: 'Falar com o Pro',
  },
];

const TIER_RANK: Record<MembershipTier, number> = {
  free: 0,
  plus: 1,
  elite: 2,
};

/** True se `current` atende ou excede `required`. */
export function hasTierAccess(current: MembershipTier, required: MembershipTier): boolean {
  return TIER_RANK[current] >= TIER_RANK[required];
}

export function tierLabel(tier: MembershipTier): string {
  return tier === 'free' ? 'Start' : tier === 'plus' ? 'Academy/Copy' : 'Pro';
}

export function formatPriceBRL(value: number): string {
  if (value === 0) return 'Grátis';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });
}
