/**
 * Resolves a media URL (logo, cover banner, document) safely.
 * Handles full URLs (http/https/data:), relative API paths (/api/...), and fallback.
 */
export function getMediaUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  ) {
    return trimmed;
  }

  // In production, if VITE_API_URL is configured (e.g. on Railway/Vercel), resolve relative to backend host
  const apiUrl = import.meta.env.VITE_API_URL || '';
  if (apiUrl && (apiUrl.startsWith('http://') || apiUrl.startsWith('https://'))) {
    try {
      const origin = new URL(apiUrl).origin;
      return `${origin}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
    } catch {
      /* ignore invalid URL */
    }
  }

  return trimmed;
}
