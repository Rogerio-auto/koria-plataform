/**
 * Format a date string or Date object.
 *
 * @param date - ISO date string or Date object
 * @param locale - Locale string (default: 'pt-BR')
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 *
 * @example
 * formatDate('2025-03-04T12:00:00Z') // "04/03/2025"
 */
export function formatDate(
  date: string | Date,
  locale = 'pt-BR',
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options,
  }).format(d);
}

/**
 * Format a date with time.
 *
 * @param date - ISO date string or Date object
 * @param locale - Locale string (default: 'pt-BR')
 * @returns Formatted date-time string
 *
 * @example
 * formatDateTime('2025-03-04T12:00:00Z') // "04/03/2025 12:00"
 */
export function formatDateTime(
  date: string | Date,
  locale = 'pt-BR'
): string {
  return formatDate(date, locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get relative time string (e.g., "2 hours ago").
 *
 * @param date - ISO date string or Date object
 * @param locale - Locale for Intl.RelativeTimeFormat (default: 'pt-BR')
 * @returns Relative time string
 */
export function formatRelativeTime(
  date: string | Date,
  locale = 'pt-BR'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffDays) >= 1) return rtf.format(diffDays, 'day');
  if (Math.abs(diffHours) >= 1) return rtf.format(diffHours, 'hour');
  if (Math.abs(diffMinutes) >= 1) return rtf.format(diffMinutes, 'minute');
  return rtf.format(diffSeconds, 'second');
}
