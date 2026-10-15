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
      const scrollToEl = () => {
        const target = document.getElementById(id);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return true;
        }
        return false;
      };

      if (scrollToEl()) return undefined;

      const t1 = setTimeout(scrollToEl, 150);
      const t2 = setTimeout(scrollToEl, 400);
      const t3 = setTimeout(scrollToEl, 800);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
    window.scrollTo(0, 0);
    return undefined;
  }, [pathname, hash]);

  return null;
}
