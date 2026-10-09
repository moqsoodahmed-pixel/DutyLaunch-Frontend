import { lazy } from 'react';

const KEY = 'dl:chunk-reloads';
const WINDOW_MS = 60_000; // count automatic reloads within one minute…
const MAX_RELOADS = 2; // …and stop after two, whatever the page load time

function readGuard() {
  try {
    const g = JSON.parse(sessionStorage.getItem(KEY) || 'null');
    if (g && Date.now() - g.first < WINDOW_MS) return g;
  } catch {
    /* ignore */
  }
  return { first: Date.now(), count: 0 };
}

/** True while an automatic reload is still allowed (no endless loops). */
export function canAutoReload() {
  return readGuard().count < MAX_RELOADS;
}

/**
 * Reload the page to pick up the current deploy. Guarded so a genuinely
 * broken or missing file can't cause an endless reload loop: at most
 * MAX_RELOADS automatic reloads per minute — even when the page takes
 * longer than a few seconds to load. Returns false when the limit is hit.
 *
 * Uses a cache-busting URL (window.location.replace) so the browser fetches
 * the latest index.html instead of a cached one.
 */
export function reloadOnceForNewDeploy({ manual = false } = {}) {
  const guard = manual ? { first: Date.now(), count: 0 } : readGuard();
  if (!manual && guard.count >= MAX_RELOADS) return false;
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ first: guard.first, count: guard.count + 1 }));
  } catch {
    // sessionStorage unavailable (private mode etc.) — still try the reload.
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

// After a cache-busting reload, take "_v=…" back out of the address bar so
// it isn't bookmarked or shared.
try {
  const url = new URL(window.location.href);
  if (url.searchParams.has('_v')) {
    url.searchParams.delete('_v');
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  }
} catch {
  /* ignore */
}

/**
 * Drop-in replacement for React.lazy().
 *
 * After a new deploy, a tab opened before it still asks for the OLD hashed
 * chunk names (e.g. Login-D0l55H_A.js), which no longer exist. Cloudflare
 * Pages answers with index.html, the import fails ("Failed to fetch
 * dynamically imported module") and React renders a white page.
 *
 * This catches that failure and reloads (at most twice a minute), which
 * fetches the current index.html and chunk names. If that does not help,
 * the error reaches ChunkErrorBoundary, which offers a manual reload.
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
