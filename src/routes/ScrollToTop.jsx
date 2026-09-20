import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Restores the top of the page on navigation, and honours in-page anchors
 * (`/career-services#interview`) once the target has rendered.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return undefined;
      }
      // The section may still be loading — try once more after paint.
      const timer = setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 220);
      return () => clearTimeout(timer);
    }
    window.scrollTo(0, 0);
    return undefined;
  }, [pathname, hash]);

  return null;
}
