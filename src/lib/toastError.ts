import { toast } from 'sonner';
import { translateError, type ErrorContext } from './errorMessages';

/**
 * Exibe um toast de erro detalhado a partir de qualquer exceção.
 * Use no lugar de `toast({ title: 'Erro', description: 'Tente novamente' })`.
 *
 * @example
 * try { await doThing(); }
 * catch (err) { showError(err, { action: 'salvar perfil', field: 'Nome' }); }
 */
export function showError(error: unknown, ctx: ErrorContext = {}): void {
  const { title, description } = translateError(error, ctx);
  toast.error(title, { description });
}

/** Variante para o hook `useToast` legado. */
export function buildErrorToast(error: unknown, ctx: ErrorContext = {}) {
  const { title, description } = translateError(error, ctx);
  return { variant: 'destructive' as const, title, description };
}
