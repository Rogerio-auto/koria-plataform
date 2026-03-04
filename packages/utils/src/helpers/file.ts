/**
 * Allowed MIME types for file uploads.
 */
export const ALLOWED_MIME_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  video: ['video/mp4', 'video/quicktime', 'video/webm'],
  document: ['application/pdf'],
} as const;

/**
 * All allowed MIME types flattened.
 */
export const ALL_ALLOWED_MIME_TYPES = [
  ...ALLOWED_MIME_TYPES.image,
  ...ALLOWED_MIME_TYPES.video,
  ...ALLOWED_MIME_TYPES.document,
] as const;

/**
 * Maximum file sizes in bytes.
 */
export const MAX_FILE_SIZES = {
  image: 10 * 1024 * 1024,      // 10 MB
  video: 500 * 1024 * 1024,     // 500 MB
  document: 20 * 1024 * 1024,   // 20 MB
  logo: 5 * 1024 * 1024,        // 5 MB
} as const;

/**
 * Get file type category from MIME type.
 *
 * @param mimeType - MIME type string
 * @returns 'image' | 'video' | 'document' | 'unknown'
 */
export function getFileCategory(mimeType: string): 'image' | 'video' | 'document' | 'unknown' {
  if (ALLOWED_MIME_TYPES.image.includes(mimeType as (typeof ALLOWED_MIME_TYPES.image)[number])) return 'image';
  if (ALLOWED_MIME_TYPES.video.includes(mimeType as (typeof ALLOWED_MIME_TYPES.video)[number])) return 'video';
  if (ALLOWED_MIME_TYPES.document.includes(mimeType as (typeof ALLOWED_MIME_TYPES.document)[number])) return 'document';
  return 'unknown';
}

/**
 * Format file size to human readable format.
 *
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
  return `${size} ${sizes[i]}`;
}

/**
 * Get file extension from filename.
 *
 * @param filename - File name string
 * @returns Extension without dot, lowercase
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? (parts.pop() ?? '').toLowerCase() : '';
}
