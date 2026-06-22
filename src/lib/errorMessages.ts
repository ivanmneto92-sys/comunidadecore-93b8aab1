/**
 * Tradução central de erros para mensagens detalhadas em PT-BR.
 * Cada mensagem deve indicar: causa raiz, contexto e ação corretiva.
 */

export interface TranslatedError {
  title: string;
  description: string;
}

export interface ErrorContext {
  /** Ex.: "fazer check-in", "salvar tutorial", "enviar mensagem" */
  action?: string;
  /** Ex.: "E-mail", "Senha", "Valor do saque" */
  field?: string;
  /** Ex.: "tutorial", "canal", "perfil" */
  resource?: string;
}

type AnyErr = {
  message?: string;
  code?: string | number;
  status?: number;
  name?: string;
  details?: string;
  hint?: string;
  error?: { message?: string; code?: string };
};

const has = (msg: string, ...needles: string[]) =>
  needles.some((n) => msg.toLowerCase().includes(n.toLowerCase()));

/** Mapeia mensagens conhecidas vindas de RPCs/edge functions. */
function matchKnownMessage(raw: string, ctx: ErrorContext): TranslatedError | null {
  const m = raw.toLowerCase();

  // Auth Supabase
  if (has(m, 'invalid login credentials'))
    return { title: 'Credenciais inválidas', description: 'E-mail ou senha incorretos. Verifique os dados e tente novamente. Se esqueceu a senha, use "Esqueci minha senha".' };
  if (has(m, 'email not confirmed'))
    return { title: 'E-mail não confirmado', description: 'Confirme seu e-mail clicando no link enviado para sua caixa de entrada antes de entrar.' };
  if (has(m, 'user already registered') || has(m, 'already registered'))
    return { title: 'E-mail já cadastrado', description: 'Este e-mail já possui uma conta. Faça login ou recupere sua senha.' };
  if (has(m, 'password should be at least'))
    return { title: 'Senha muito curta', description: 'A senha precisa ter pelo menos 8 caracteres, com letras e números.' };
  if (has(m, 'email rate limit exceeded') || has(m, 'over_email_send_rate_limit'))
    return { title: 'Muitos envios de e-mail', description: 'Aguarde alguns minutos antes de solicitar um novo e-mail.' };
  if (has(m, 'invalid email'))
    return { title: 'E-mail inválido', description: 'Informe um endereço no formato usuario@dominio.com.' };
  if (has(m, 'jwt expired') || has(m, 'token expired') || has(m, 'invalid jwt'))
    return { title: 'Sessão expirada', description: 'Sua sessão expirou. Faça login novamente para continuar.' };
  if (has(m, 'not authenticated'))
    return { title: 'Você precisa estar logado', description: `Faça login para ${ctx.action ?? 'continuar'}.` };

  // RPC add_xp / caps
  if (has(m, 'invalid xp source'))
    return { title: 'Origem de XP inválida', description: 'Esta ação não está mapeada para ganho de XP. Recarregue a página e tente novamente.' };
  if (has(m, 'invalid xp amount'))
    return { title: 'Valor de XP inválido', description: 'O valor de XP está fora do permitido. Recarregue a página.' };

  // Quiz
  if (has(m, 'quiz not found'))
    return { title: 'Quiz não encontrado', description: 'Este quiz foi removido ou está indisponível. Recarregue a lista de tutoriais.' };
  if (has(m, 'quiz has no questions'))
    return { title: 'Quiz sem perguntas', description: 'O quiz ainda não possui perguntas cadastradas. Volte mais tarde.' };

  // Achievements / Season
  if (has(m, 'achievement not found') || has(m, 'season achievement not found'))
    return { title: 'Conquista indisponível', description: 'Esta conquista não existe ou foi removida. Atualize a página.' };
  if (has(m, 'achievement is not from the active season'))
    return { title: 'Conquista de outra temporada', description: 'Só é possível resgatar conquistas da temporada ativa.' };

  // Affiliate
  if (has(m, 'user already has an affiliate account'))
    return { title: 'Conta de afiliado já existe', description: 'Você já possui uma conta de afiliado. Acesse a área de afiliados para ver seu link.' };

  // Storage / upload
  if (has(m, 'payload too large') || has(m, 'request entity too large'))
    return { title: 'Arquivo muito grande', description: 'O arquivo excede o tamanho máximo permitido. Reduza o tamanho e tente novamente.' };
  if (has(m, 'mime type') && has(m, 'not allowed'))
    return { title: 'Tipo de arquivo não permitido', description: 'Use apenas formatos suportados (ex.: PNG, JPG, PDF).' };
  if (has(m, 'duplicate') && has(m, 'object'))
    return { title: 'Arquivo já existe', description: 'Já existe um arquivo com este nome. Renomeie e tente novamente.' };

  // Rede
  if (has(m, 'failed to fetch') || has(m, 'networkerror') || has(m, 'load failed'))
    return { title: 'Sem conexão com o servidor', description: 'Verifique sua conexão com a internet e tente novamente. Se o problema persistir, contate o suporte.' };

  return null;
}

/** Mapeia códigos Postgres / PostgREST. */
function matchPostgresCode(code: string, ctx: ErrorContext, raw: string): TranslatedError | null {
  switch (code) {
    case '23505':
      return {
        title: 'Registro duplicado',
        description: ctx.field
          ? `O valor informado em "${ctx.field}" já está em uso. Escolha outro.`
          : 'Já existe um registro com estes dados. Verifique os campos únicos (ex.: e-mail, nome de usuário).',
      };
    case '23503':
      return {
        title: 'Referência inválida',
        description: 'O item relacionado não existe mais ou foi removido. Atualize a página e tente novamente.',
      };
    case '23502':
      return {
        title: 'Campo obrigatório ausente',
        description: ctx.field
          ? `O campo "${ctx.field}" é obrigatório.`
          : 'Preencha todos os campos obrigatórios antes de salvar.',
      };
    case '23514':
      return {
        title: 'Dados fora do permitido',
        description: ctx.field
          ? `O valor de "${ctx.field}" não atende às regras de validação.`
          : 'Um dos campos contém um valor inválido. Revise o formulário.',
      };
    case '42501':
      return {
        title: 'Sem permissão',
        description: `Você não tem permissão para ${ctx.action ?? 'esta ação'}. Faça login novamente ou contate um administrador.`,
      };
    case 'PGRST116':
      return {
        title: 'Registro não encontrado',
        description: `Não encontramos o ${ctx.resource ?? 'item'} solicitado. Ele pode ter sido removido.`,
      };
    case 'PGRST301':
      return { title: 'Sessão expirada', description: 'Sua sessão expirou. Faça login novamente.' };
    case 'P0001':
      // RAISE EXCEPTION custom — usar a mensagem original sem o prefixo do Postgres
      return { title: 'Operação não permitida', description: raw.replace(/^.*?:\s*/, '') };
    default:
      return null;
  }
}

/** Mapeia status HTTP de edge functions. */
function matchHttpStatus(status: number, ctx: ErrorContext): TranslatedError | null {
  if (status === 401)
    return { title: 'Sessão expirada', description: 'Faça login novamente para continuar.' };
  if (status === 403)
    return { title: 'Sem permissão', description: `Você não tem permissão para ${ctx.action ?? 'esta ação'}.` };
  if (status === 404)
    return { title: 'Não encontrado', description: `O ${ctx.resource ?? 'recurso'} solicitado não existe.` };
  if (status === 409)
    return { title: 'Conflito', description: 'Já existe um registro com estes dados. Verifique e tente novamente.' };
  if (status === 413)
    return { title: 'Arquivo muito grande', description: 'O envio excede o limite. Reduza o tamanho e tente novamente.' };
  if (status === 429)
    return { title: 'Muitas tentativas', description: 'Aguarde alguns instantes antes de tentar novamente.' };
  if (status >= 500)
    return { title: 'Servidor indisponível', description: 'Nosso servidor está com problemas no momento. Tente novamente em alguns minutos.' };
  return null;
}

/**
 * Converte qualquer erro em {title, description} em PT-BR.
 * Sempre loga o erro original no console para debug.
 */
export function translateError(error: unknown, ctx: ErrorContext = {}): TranslatedError {
  // Sempre logar para debug
  // eslint-disable-next-line no-console
  console.error('[translateError]', { ctx, error });

  if (!error) {
    return {
      title: 'Falha inesperada',
      description: `Não foi possível ${ctx.action ?? 'concluir a operação'}. Recarregue a página e tente novamente.`,
    };
  }

  const e = (typeof error === 'object' ? (error as AnyErr) : { message: String(error) }) as AnyErr;
  const nested = e.error;
  const raw = String(e.message ?? nested?.message ?? e.details ?? '').trim();
  const code = String(e.code ?? nested?.code ?? '').trim();
  const status = typeof e.status === 'number' ? e.status : undefined;

  // 1. Mensagens conhecidas (RPC, auth, storage, rede)
  if (raw) {
    const byMsg = matchKnownMessage(raw, ctx);
    if (byMsg) return byMsg;
  }

  // 2. Códigos Postgres
  if (code) {
    const byCode = matchPostgresCode(code, ctx, raw);
    if (byCode) return byCode;
  }

  // 3. Status HTTP de edge functions
  if (typeof status === 'number') {
    const byStatus = matchHttpStatus(status, ctx);
    if (byStatus) return byStatus;
  }

  // 4. Fallback — preserva mensagem original para não esconder o problema
  return {
    title: ctx.action ? `Falha ao ${ctx.action}` : 'Falha na operação',
    description:
      raw && raw !== 'Error'
        ? `${raw}. Se o problema persistir, recarregue a página ou contate o suporte.`
        : `Não foi possível ${ctx.action ?? 'concluir a operação'}. Verifique sua conexão e tente novamente.`,
  };
}
