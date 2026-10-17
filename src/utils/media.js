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

  // If running in browser on a production domain (e.g. dutylaunch.com or Cloudflare Pages),
  // fallback to production Railway backend origin so relative media paths stream properly
  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
    if (!isLocal) {
      return `https://dutylaunch-backend-production.up.railway.app${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
    }
  }

  return trimmed;
}
