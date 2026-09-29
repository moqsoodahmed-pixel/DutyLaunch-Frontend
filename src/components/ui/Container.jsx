import { cn } from '../../utils/cn.js';

export function Container({ as: Tag = 'div', size = 'shell', className, children, ...rest }) {
  const widths = { shell: 'max-w-shell', narrow: 'max-w-4xl', prose: 'max-w-prose' };
  return (
    <Tag className={cn('mx-auto w-full px-gutter', widths[size], className)} {...rest}>
      {children}
    </Tag>
  );
}

/* Full literal class names on purpose: Tailwind only keeps classes whose
   complete name appears in the source, so these must never be assembled
   from template strings (e.g. `seam-tone-${tone}`). */
const TONES = {
  white: 'seam seam-tone-white',
  paper: 'seam seam-tone-paper',
  glacier: 'seam seam-tone-glacier',
  sand: 'seam seam-tone-sand',
  ink: 'surface-dark seam seam-tone-ink',
};
const DARK_TONES = new Set(['ink']);

/**
 * Vertical rhythm wrapper. `tone` picks the surface.
 *
 * Every tone fades in from — and back out to — the light page colour at its
 * top and bottom edges (see `.seam` in index.css), so no boundary between
 * sections is ever visible: the colour changes gradually while scrolling.
 *
 * `seamTop` / `seamBottom="dark"`: use where this section touches another
 * dark section, so the shared edge stays dark instead of flashing light.
 * Dark sections automatically get extra padding on any edge that fades from
 * light, so content always sits on the fully dark part.
 *
 * `backdrop` (optional): an absolutely-positioned background layer, e.g.
 * `<GlacierBackdrop />`, rendered OUTSIDE the content wrapper so it fills
 * the entire section including its padding.
 */
export function Section({ tone = 'white', seamTop, seamBottom, backdrop, className, children, id, ...rest }) {
  const dark = DARK_TONES.has(tone);
  const topDark = seamTop === 'dark';
  const bottomDark = seamBottom === 'dark';
  // Only sections with a glow layer clip their overflow and wrap their
  // content (same rule as before this pass). Plain white/paper/sand
  // sections stay unclipped, because overflow-hidden would break the
  // `position: sticky` side panels on the job, course and Dubai pages.
  const layered = dark || tone === 'glacier' || Boolean(backdrop);

  return (
    <section
      id={id}
      className={cn(
        layered && 'relative overflow-hidden',
        TONES[tone] || TONES.white,
        topDark && 'seam-top-dark',
        bottomDark && 'seam-bottom-dark',
        dark && !topDark ? 'pt-section-dark' : 'pt-section',
        dark && !bottomDark ? 'pb-section-dark' : 'pb-section',
        className
      )}
      {...rest}
    >
      {backdrop}
      {layered ? <div className="relative z-[1]">{children}</div> : children}
    </section>
  );
}