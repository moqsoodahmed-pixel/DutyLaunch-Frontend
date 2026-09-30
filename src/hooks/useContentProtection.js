import { useEffect, useState } from 'react';

const STORAGE_KEY = 'dl_unlocked_templates';

export function getUnlockedTemplates() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

export function saveUnlockedTemplate(templateId) {
  try {
    const set = getUnlockedTemplates();
    set.add(templateId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
    window.dispatchEvent(new Event('dl-templates-unlocked'));
  } catch (err) {
    console.error('Failed to save unlocked template', err);
  }
}

/**
 * High-grade content protection against inspecting, devtools shortcuts,
 * right-click, PrintScreen, and screen capture tool window-switching.
 */
export function useContentProtection({ enabled = true } = {}) {
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);
  const [unlocked, setUnlocked] = useState(() => getUnlockedTemplates());

  useEffect(() => {
    const updateUnlocked = () => setUnlocked(getUnlockedTemplates());
    window.addEventListener('dl-templates-unlocked', updateUnlocked);
    return () => window.removeEventListener('dl-templates-unlocked', updateUnlocked);
  }, []);

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
    return unlocked.has(templateId);
  };

  const unlock = (templateId) => {
    saveUnlockedTemplate(templateId);
    setUnlocked(getUnlockedTemplates());
  };

  return {
    isWindowBlurred,
    isUnlocked,
    unlock,
  };
}
