/**
 * Truncate a string to a maximum length with ellipsis.
 *
 * @param str - Input string
 * @param maxLength - Maximum length (default: 50)
 * @returns Truncated string
 */
export function truncate(str: string, maxLength = 50): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}

/**
 * Convert a string to slug format.
 *
 * @param str - Input string
 * @returns Slugified string
 *
 * @example
 * slugify('Hello World') // "hello-world"
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Capitalize the first letter of a string.
 *
 * @param str - Input string
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
