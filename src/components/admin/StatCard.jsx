import { Link } from 'react-router-dom';
import { Icons } from '../../utils/iconMap.js';
import { cn } from '../../utils/cn.js';

/**
 * Admin metric tile. Deliberately flat — the admin reads as an instrument
 * panel, not a marketing page, so no shadows or gradients here.
 */
export function StatCard({ label, value, hint, icon = 'Circle', to, tone = 'default' }) {
  const Icon = Icons[icon] || Icons.Circle;
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-caption font-semibold uppercase tracking-wide text-slate-600">{label}</p>
        <Icon
          className={cn('h-4 w-4 shrink-0', tone === 'alert' ? 'text-amber-600' : 'text-azure')}
          aria-hidden
        />
      </div>
      <p className="tabular mt-3 text-3xl font-extrabold leading-none text-ink">{value ?? 0}</p>
      {hint && <p className="mt-2 text-caption text-slate-600">{hint}</p>}
    </>
  );

  const classes = cn(
    'block rounded-2xl border bg-white p-5 shadow-card',
    tone === 'alert' ? 'border-amber-200' : 'border-glacier-400',
    to && 'transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-azure-200 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azure-400'
  );

  return to ? (
    <Link to={to} className={classes}>
      {body}
    </Link>
  ) : (
    <div className={classes}>{body}</div>
  );
}