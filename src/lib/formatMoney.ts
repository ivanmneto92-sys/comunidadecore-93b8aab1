/**
 * Formata valor monetário usando o código ISO 4217 vindo do backend.
 * Fallback: USD (padrão MT5).
 */
export function formatMoney(
  value: number | null | undefined,
  currency: string | null | undefined = 'USD',
  locale = 'pt-BR',
): string {
  const safeCurrency = (currency || 'USD').toUpperCase();
  const safeValue = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: safeCurrency,
      maximumFractionDigits: 2,
    }).format(safeValue);
  } catch {
    // Código de moeda inválido → cai para USD
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(safeValue);
  }
}
