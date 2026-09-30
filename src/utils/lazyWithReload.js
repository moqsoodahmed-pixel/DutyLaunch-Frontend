import { lazy } from 'react';

const KEY = 'dl:chunk-reload-at';
const WINDOW_MS = 4_000;

/**
 * Reload the page once to pick up the current deploy. Guarded so a genuinely
 * broken chunk can't cause an endless reload loop: if we already reloaded in
 * the last 4 seconds, return false and let the error surface instead.
 *
 * Uses cache-busting URL navigation (window.location.replace) to force the
 * browser to bypass its local HTML cache and fetch the latest deployment.
 */
export function reloadOnceForNewDeploy() {
  try {
    const last = Number(sessionStorage.getItem(KEY) || 0);
    if (Date.now() - last < WINDOW_MS) return false;
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    // sessionStorage unavailable (private mode etc.) — still try one reload.
  }

  try {
    const url = new URL(window.location.href);
    url.searchParams.set('_v', String(Date.now()));
    window.location.replace(url.toString());
  } catch {
    window.location.reload();
  }
  return true;
}

/**
 * Drop-in replacement for React.lazy().
 *
 * After a new deploy, a tab opened before it still asks for the OLD hashed
 * chunk names (e.g. Login-D0l55H_A.js), which no longer exist. Cloudflare
 * Pages answers with index.html, the import fails ("Failed to fetch
 * dynamically imported module") and React renders a white page.
 *
 * This catches that failure and reloads once, which fetches the current
 * index.html and the current chunk names — the user just sees the page load.
 */
export function lazyWithReload(factory) {
  return lazy(() =>
    factory().catch((error) => {
      if (reloadOnceForNewDeploy()) {
        // Keep Suspense showing its fallback while the reload happens.
        return new Promise(() => {});
      }
      throw error;
    })
  );
}