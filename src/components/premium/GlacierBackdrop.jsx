import { cn } from '../../utils/cn.js';
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery.js';

/**
 * The signature Glacier ambient background. Pure CSS (no canvas, no JS
 * animation loop), so it's essentially free to render behind any number of
 * sections.
 *
 * `tone="light"` (default) sits behind a glacier-white section; `tone="dark"`
 * sits behind an indigo section.
 *
 * VISIBILITY PASS: the previous version
 *   - faded the layer out to transparent over 7rem at the top and bottom of
 *     every section (the grey/white "smoky" band at section edges), and
 *   - added big blurred blob shapes (`dense`) that washed over content.
 * Both are gone. Dark sections now get a clean, solid theme colour with a
 * small, low-opacity accent glow and a crisp edge; light sections keep a very
 * soft mesh (which blends into the light page colour anyway).
 */
export function GlacierBackdrop({ tone = 'light', className }) {
  const reduceMotion = usePrefersReducedMotion();
  const dark = tone === 'dark';

  // Light sections only: soften the mesh toward the edges (it is light-on-light,
  // so this is invisible). Dark sections get no mask => no hazy edge.
  const lightEdgeFade = 'linear-gradient(to bottom, transparent 0, #000 3rem, #000 calc(100% - 3rem), transparent 100%)';

  return (
    <div
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      style={dark ? undefined : { maskImage: lightEdgeFade, WebkitMaskImage: lightEdgeFade }}
      aria-hidden
    >
      <div
        className={cn(
          'absolute inset-0',
          dark ? 'bg-glacier-mesh-dark opacity-60' : 'bg-glacier-mesh',
          !reduceMotion && !dark && 'animate-aurora-drift'
        )}
      />
    </div>
  );
}
