/**
 * Validate a URL format.
 *
 * @param url - URL string to validate
 * @returns true if valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate an Instagram handle or URL.
 *
 * @param input - Instagram handle (@user) or URL
 * @returns true if valid Instagram reference
 */
export function isValidInstagram(input: string): boolean {
  const handleRegex = /^@?[a-zA-Z0-9._]{1,30}$/;
  if (handleRegex.test(input)) return true;

  try {
    const url = new URL(input);
    return url.hostname === 'instagram.com' || url.hostname === 'www.instagram.com';
  } catch {
    return false;
  }
}
