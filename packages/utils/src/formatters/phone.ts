/**
 * Format a phone number for display.
 * Basic formatting — assumes Brazilian or international format.
 *
 * @param phone - Raw phone number string
 * @returns Formatted phone number
 *
 * @example
 * formatPhone('+5511999999999') // "+55 (11) 99999-9999"
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  // Brazilian format: +55 (XX) XXXXX-XXXX
  if (digits.startsWith('55') && digits.length === 13) {
    return `+55 (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }

  // Brazilian without country code
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  // International fallback: +XX XXXXXXXXX
  if (digits.length > 10) {
    return `+${digits.slice(0, 2)} ${digits.slice(2)}`;
  }

  return phone;
}
