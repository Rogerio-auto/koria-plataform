/**
 * Validate a phone number (basic international format).
 *
 * @param phone - Phone string to validate
 * @returns true if valid phone format
 */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}
