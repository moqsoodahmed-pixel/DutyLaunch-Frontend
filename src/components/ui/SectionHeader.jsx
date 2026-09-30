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
  const labelClass = dark
    ? 'inline-flex items-center gap-1.5 rounded-full border border-cyan-400/35 bg-cyan-950/70 px-3.5 py-1 text-[11.5px] font-bold uppercase tracking-wider text-cyan-300 backdrop-blur shadow-xs'
    : 'inline-flex items-center gap-1.5 rounded-full border border-azure-200/90 bg-azure-50/90 px-3.5 py-1 text-[11.5px] font-bold uppercase tracking-wider text-azure-700 backdrop-blur shadow-xs';
  const center = align === 'center';

  return (
    <div className={cn('min-w-0', center ? 'mx-auto max-w-2xl text-center' : 'max-w-3xl', className)}>
      {label && <p className={cn('mb-3 inline-flex', labelClass)}>{label}</p>}
      <h2 className={cn('text-2xl sm:text-3xl font-extrabold tracking-tight', !center && 'max-w-[32ch]', dark ? 'text-white' : 'text-ink')}>{title}</h2>
      {lead && <p className={cn('mt-2 text-base leading-relaxed', center && 'mx-auto max-w-2xl', muted)}>{lead}</p>}
      {aside && <div className={cn('mt-4', center && 'flex justify-center')}>{aside}</div>}
    </div>
  );
}
