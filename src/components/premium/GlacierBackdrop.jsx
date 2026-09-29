import { cn } from '../../utils/cn.js';
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery.js';

/**
 * The signature Glacier ambient background. Pure CSS (no canvas, no JS
 * animation loop), so it's essentially free to render and safe to use
 * behind any number of sections.
 *
 * `tone="light"` (default) sits behind a glacier-white section; `tone="dark"`
 * sits behind an ink/navy section (tuned to glow rather than tint).
 *
 * This CSS layer is the premium background on its own — it needs no WebGL,
 * so it has no fallback-mode problem. (The only three.js scene on the Home
 * page is the globe in GlobalSpotlight, which sits over its own background.)
 */
export function GlacierBackdrop({ tone = 'light', className, dense = false }) {
  const reduceMotion = usePrefersReducedMotion();
  const dark = tone === 'dark';

  // Fade the whole layer out toward the section's top and bottom edges, so
  // no glow is ever cut off in a visible line where one section meets the
  // next (the section background itself fades to a shared seam colour too).
  const edgeFade = 'linear-gradient(to bottom, transparent 0, #000 7rem, #000 calc(100% - 7rem), transparent 100%)';

  return (
    <div
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      style={{ maskImage: edgeFade, WebkitMaskImage: edgeFade }}
      aria-hidden
    >
      {/* Base mesh — always present, does the majority of the work. */}
      <div
        className={cn(
          'absolute inset-0',
          dark ? 'bg-glacier-mesh-dark' : 'bg-glacier-mesh',
          !reduceMotion && 'animate-aurora-drift'
        )}
      />

      {/* A few soft, individually-blurred glow shapes for extra depth in the
          areas the flat mesh doesn't reach. Optional via `dense` for
          sections that want a quieter background (e.g. dense content pages). */}
      {dense && (
        <>
          <div
            className={cn(
              'absolute -left-24 top-[-4rem] h-[22rem] w-[22rem] rounded-full blur-3xl',
              'bg-frost-blob',
              dark ? 'opacity-40' : 'opacity-70',
              !reduceMotion && 'animate-float'
            )}
          />
          <div
            className={cn(
              'absolute -right-20 top-1/3 h-[18rem] w-[18rem] rounded-full blur-3xl',
              'bg-aurora-blob',
              dark ? 'opacity-30' : 'opacity-60',
              !reduceMotion && 'animate-float'
            )}
            style={{ animationDelay: '1.4s' }}
          />
          <div
            className={cn(
              'absolute bottom-[-5rem] left-1/3 h-[20rem] w-[20rem] rounded-full blur-3xl',
              'bg-cream-blob',
              dark ? 'opacity-20' : 'opacity-70',
              !reduceMotion && 'animate-float'
            )}
            style={{ animationDelay: '2.8s' }}
          />
        </>
      )}
    </div>
  );
}