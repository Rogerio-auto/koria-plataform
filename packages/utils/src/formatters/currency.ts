/**
 * Format a number as currency.
 *
 * @param amount - The numeric amount
 * @param currency - ISO currency code (default: 'BRL')
 * @param locale - Locale string (default: 'pt-BR')
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(1500) // "R$ 1.500,00"
 * formatCurrency(300, 'USD', 'en-US') // "$300.00"
 */
export function formatCurrency(
  amount: number,
  currency = 'BRL',
  locale = 'pt-BR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}
