/**
 * First-visit state for the homepage ATS experience.
 *
 * Two independent one-time flags, both stored only as the literal string '1'
 * (no identifiers, nothing sent anywhere):
 *
 *   WELCOME_KEY    — the welcome dialog has been shown.
 *   HIGHLIGHT_KEY  — the ATS panel has already had its one-off highlight.
 *
 * localStorage can throw (private mode, blocked storage, quota). When it does
 * we fall back to a module-level Set so the dialog still can't reopen on
 * route changes within the same page load — it just can't survive a reload,
 * which is the best that's possible without storage.
 */
export const WELCOME_KEY = 'dl.atsWelcome.v1';
export const HIGHLIGHT_KEY = 'dl.atsHighlight.v1';

/** Fired by the welcome dialog; the ATS panel listens and highlights itself. */
export const HIGHLIGHT_EVENT = 'dl:ats-highlight';

const memory = new Set();

export function hasFlag(key) {
  if (memory.has(key)) return true;
  try {
    return window.localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

export function setFlag(key) {
  memory.add(key);
  try {
    window.localStorage.setItem(key, '1');
  } catch {
    /* storage unavailable — the in-memory flag above still applies */
  }
}

export function requestAtsHighlight() {
  window.dispatchEvent(new CustomEvent(HIGHLIGHT_EVENT));
}