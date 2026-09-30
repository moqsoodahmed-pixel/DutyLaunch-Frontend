import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { reloadOnceForNewDeploy } from './utils/lazyWithReload.js';
import './index.css';

// Clean up cache-busting query parameter if redirected after a chunk reload
if (typeof window !== 'undefined' && window.location.search.includes('_v=')) {
  try {
    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete('_v');
    window.history.replaceState(null, '', cleanUrl.pathname + (cleanUrl.search ? cleanUrl.search : '') + cleanUrl.hash);
  } catch {
    // Ignore history replaceState failure
  }
}

// Vite fires this when a page's preloaded JS or CSS can't be fetched — the
// typical cause is a tab opened before the latest deploy asking for bundle
// names that no longer exist. Reload once to pick up the current deploy
// instead of leaving a blank or unstyled page. (Route-level failures are
// also handled by lazyWithReload in AppRoutes.)
window.addEventListener('vite:preloadError', (event) => {
  if (reloadOnceForNewDeploy()) event.preventDefault();
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);