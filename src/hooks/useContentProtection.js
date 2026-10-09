import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { paymentService } from '../services/paymentService.js';

/**
 * Paid Resume Builder templates are unlocked only by a real, server-verified
 * Razorpay payment. The list of owned templates comes from
 * GET /api/payments/entitlements — nothing is unlocked from the browser.
 */

// Older builds stored "unlocked" templates in localStorage without a
// payment. Those flags are ignored and removed.
try {
  localStorage.removeItem('dl_unlocked_templates');
} catch {
  /* storage unavailable */
}

let owned = new Set();
let ownedFor = null; // user id the cache belongs to
let pending = null;
// The one-time free-template allowance (see models/User.js on the backend).
// Once true, every id in FREE_TEMPLATE_IDS must be treated as locked for
// this account, same as an unpurchased paid template.
let freeTemplateUsed = false;
let freeTemplateUsedId = null;

/** Template id aliases (older "ats-…" ids) → canonical ids. */
const ALIASES = {
  'ats-classic': 'dl-elite',
  'ats-technology': 'dl-tech',
  'ats-sales': 'dl-professional',
  'ats-executive': 'dl-executive',
  'ats-modern': 'dl-modern',
  'ats-finance': 'dl-finance',
  'ats-international': 'dl-creative',
};
export const canonicalTemplateId = (id) => ALIASES[id] || id;

function announce() {
  window.dispatchEvent(new Event('dl-templates-unlocked'));
}

/** Reloads the signed-in user's owned templates from the server. */
export function refreshOwnedTemplates(userId) {
  if (!userId) {
    owned = new Set();
    ownedFor = null;
    freeTemplateUsed = false;
    freeTemplateUsedId = null;
    announce();
    return Promise.resolve(owned);
  }
  pending = paymentService
    .entitlements()
    .then((res) => {
      owned = new Set((res?.data?.templates || []).map(canonicalTemplateId));
      freeTemplateUsed = Boolean(res?.data?.freeTemplateUsed);
      freeTemplateUsedId = res?.data?.freeTemplateUsedId ? canonicalTemplateId(res.data.freeTemplateUsedId) : null;
      ownedFor = userId;
      announce();
      return owned;
    })
    .catch(() => owned)
    .finally(() => {
      pending = null;
    });
  return pending;
}

export function getUnlockedTemplates() {
  return new Set(owned);
}

export function getFreeTemplateStatus() {
  return { freeTemplateUsed, freeTemplateUsedId };
}

/**
 * High-grade content protection against inspecting, devtools shortcuts,
 * right-click, PrintScreen, and screen capture tool window-switching.
 */
export function useContentProtection({ enabled = true } = {}) {
  const { user } = useAuth();
  const userId = user?.id || user?._id || null;
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);
  const [unlocked, setUnlocked] = useState(() => getUnlockedTemplates());
  const [freeStatus, setFreeStatus] = useState(() => getFreeTemplateStatus());

  useEffect(() => {
    const updateUnlocked = () => {
      setUnlocked(getUnlockedTemplates());
      setFreeStatus(getFreeTemplateStatus());
    };
    window.addEventListener('dl-templates-unlocked', updateUnlocked);
    return () => window.removeEventListener('dl-templates-unlocked', updateUnlocked);
  }, []);

  // Load (or clear) owned templates whenever the signed-in user changes.
  useEffect(() => {
    if (userId === ownedFor && !pending) return;
    if (!pending) refreshOwnedTemplates(userId);
  }, [userId]);

  useEffect(() => {
    if (!enabled) return undefined;

    // 1. Block Keyboard Shortcuts (F12, Inspect, View Source, PrintScreen)
    const onKeyDown = (e) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+Shift+I / Cmd+Option+I (Inspect)
      // Ctrl+Shift+J / Cmd+Option+J (Console)
      // Ctrl+Shift+C / Cmd+Option+C (Inspect Element)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        ['i', 'j', 'c'].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+U / Cmd+U (View Source)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+S / Cmd+S (Save Page)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+P / Cmd+P (Browser Print shortcut)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // PrintScreen Key detection
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        setIsWindowBlurred(true);
        setTimeout(() => setIsWindowBlurred(false), 2500);
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText('');
          }
        } catch {}
      }
    };

    // 2. Window Blur / Focus Detection (blocks Snipping Tool / OS screen grabbers)
    const onWindowBlur = () => {
      setIsWindowBlurred(true);
    };

    const onWindowFocus = () => {
      setIsWindowBlurred(false);
    };

    // 3. Block Context Menu (right click inspect)
    const onContextMenu = (e) => {
      // If clicking inside protected areas
      if (e.target.closest('[data-resume-protect="true"]')) {
        e.preventDefault();
        return false;
      }
    };

    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('blur', onWindowBlur);
    window.addEventListener('focus', onWindowFocus);
    document.addEventListener('contextmenu', onContextMenu);

    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('blur', onWindowBlur);
      window.removeEventListener('focus', onWindowFocus);
      document.removeEventListener('contextmenu', onContextMenu);
    };
  }, [enabled]);

  const isUnlocked = (templateId) => {
    if (!templateId) return true;
    return unlocked.has(canonicalTemplateId(templateId));
  };

  /** Call after a verified payment: re-reads ownership from the server. */
  const unlock = async () => {
    await refreshOwnedTemplates(userId);
    setUnlocked(getUnlockedTemplates());
    setFreeStatus(getFreeTemplateStatus());
  };

  return {
    isWindowBlurred,
    isUnlocked,
    unlock,
    /** True once we know which templates this user owns (always true when signed out). */
    isReady: !userId || (ownedFor === userId && !pending),
    /** The account's one-time free-template allowance (see models/User.js).
     * Once freeTemplateUsed is true, treat every FREE template id as locked
     * — getTemplatePricing() in TemplateGallery.jsx already does this when
     * you pass it freeTemplateUsed. */
    freeTemplateUsed: freeStatus.freeTemplateUsed,
    freeTemplateUsedId: freeStatus.freeTemplateUsedId,
  };
}