import { cn } from '../../utils/cn.js';

/**
 * Section heading used across the site.
 *
 * Default ('start'): label → heading → lead → aside, stacked in ONE column and
 * left-aligned. This replaced the old "rail" layout, which put the heading in
 * a narrow left column and the lead paragraph in a right column — that left a
 * large empty area under every heading and split one thought across the page.
 *
 * Widths are capped so lines stay readable: the heading at ~28 characters (so
 * long titles break into two balanced lines instead of running edge to edge),
 * the lead at a comfortable reading measure.
 *
 * `align="rail"` and `align="stack"` are kept as aliases of the default so
 * existing call sites keep working. `align="center"` centres everything.
 */
export function SectionHeader({ label, title, lead, aside, align = 'start', className, tone = 'light' }) {
  const dark = tone === 'dark';
  const muted = dark ? 'text-slate-300' : 'text-slate-600';
  const labelClass = dark ? 'eyebrow-dark' : 'eyebrow';
  const center = align === 'center';

  return (
    <div className={cn('min-w-0', center ? 'mx-auto max-w-2xl text-center' : 'max-w-3xl', className)}>
      {label && <p className={cn('mb-4 inline-flex', labelClass)}>{label}</p>}
      <h2 className={cn('text-h2 font-extrabold', !center && 'max-w-[28ch]', dark && 'text-white')}>{title}</h2>
      {lead && <p className={cn('mt-3 max-w-2xl text-lead', center && 'mx-auto', muted)}>{lead}</p>}
      {aside && <div className={cn(center && 'flex justify-center')}>{aside}</div>}
    </div>
  );
}