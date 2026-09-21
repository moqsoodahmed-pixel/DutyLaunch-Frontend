import { cn } from '../../utils/cn.js';

/**
 * The site's layout signature: the heading sits in a narrow left column with a
 * hairline running beside it, and the content is offset to the right. On small
 * screens it collapses to a normal stacked heading.
 */
export function SectionHeader({ label, title, lead, aside, align = 'rail', className, tone = 'light' }) {
  const muted = tone === 'dark' ? 'text-slate-300' : 'text-slate-600';
  const labelClass = tone === 'dark' ? 'eyebrow-dark' : 'eyebrow';

  if (align === 'center') {
    return (
      <div className={cn('mx-auto max-w-2xl text-center', className)}>
        {label && <p className={cn('mb-4 inline-flex', labelClass)}>{label}</p>}
        <h2 className={cn('text-h2 font-extrabold', tone === 'dark' && 'text-white')}>{title}</h2>
        {lead && <p className={cn('mt-4 text-lead', muted)}>{lead}</p>}
      </div>
    );
  }

  /* Stacked heading — label, title and lead run full-width in a single
     column. Use this (instead of the default rail split) whenever the
     header already sits inside a half-width or narrower parent column,
     so the heading keeps enough room to break naturally instead of
     wrapping into three or four cramped lines. */
  if (align === 'stack') {
    return (
      <div className={cn('max-w-2xl', className)}>
        {label && <p className={cn('mb-4 inline-flex', labelClass)}>{label}</p>}
        <h2 className={cn('text-h2 font-extrabold', tone === 'dark' && 'text-white')}>{title}</h2>
        {lead && <p className={cn('mt-4 text-lead', muted)}>{lead}</p>}
        {aside}
      </div>
    );
  }

  return (
    <div className={cn('grid gap-6 lg:grid-cols-12 lg:gap-10', className)}>
      <div className="lg:col-span-5">
        {label && <p className={cn('mb-4 inline-flex', labelClass)}>{label}</p>}
        <h2 className={cn('text-h2 font-extrabold', tone === 'dark' && 'text-white')}>{title}</h2>
      </div>
      <div className="lg:col-span-6 lg:col-start-7">
        {lead && <p className={cn('text-lead', muted)}>{lead}</p>}
        {aside}
      </div>
    </div>
  );
}