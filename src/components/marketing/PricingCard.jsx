import { Check, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { Badge } from '../ui/Badge.jsx';
import { formatCurrency } from '../../utils/format.js';
import { cn } from '../../utils/cn.js';

/**
 * proresumes.in-style package card: a plain white tile for standard bands,
 * and a brand-gradient "most chosen" card that visually anchors the grid —
 * the same trick order-driven CV sites use to steer picks without hiding
 * the cheaper options.
 */
export function PricingCard({ pkg, highlighted, onSelect }) {
  const featured = highlighted ?? pkg.isPopular;

  return (
    <article
      className={cn(
        'relative flex flex-col rounded-xl p-6 transition-transform sm:p-7',
        featured
          ? 'bg-btn-grad text-white shadow-blue-lg ring-1 ring-azure-700/40 sm:-translate-y-2'
          : 'tile border border-line bg-white'
      )}
    >
      {featured && (
        <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-caption font-extrabold uppercase tracking-wide text-ink-900 shadow-xs">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Most chosen
        </span>
      )}

      <div>
        <h3 className={cn('text-h3 font-bold', featured ? 'text-white' : 'text-ink')}>{pkg.name}</h3>
        <p className={cn('mt-1 text-small', featured ? 'text-azure-100' : 'text-slate-500')}>{pkg.experienceBand}</p>
      </div>

      <p className={cn('mt-4 text-small', featured ? 'text-azure-100' : 'text-slate-600')}>{pkg.tagline}</p>

      <p className="mt-6 flex items-baseline gap-1.5">
        <span className={cn('tabular text-h1 font-extrabold', featured ? 'text-white' : 'text-ink')}>
          {formatCurrency(pkg.price, pkg.currency || 'INR')}
        </span>
        <span className={cn('text-small', featured ? 'text-azure-200' : 'text-slate-500')}>one-off</span>
      </p>

      <ul className="mt-6 flex-1 space-y-2.5">
        {pkg.features?.map((feature) => (
          <li key={feature.label} className="flex items-start gap-2.5">
            <span
              className={cn(
                'mt-0.5 grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full',
                featured ? 'bg-white/20' : 'bg-azure-50'
              )}
            >
              <Check className={cn('h-3 w-3', featured ? 'text-white' : 'text-azure')} strokeWidth={3} aria-hidden />
            </span>
            <span className={cn('text-small', featured ? 'text-white' : 'text-slate-700')}>{feature.label}</span>
          </li>
        ))}
      </ul>

      <div className="mt-7">
        <Button
          fullWidth
          variant={featured ? 'onInk' : 'outline'}
          className={featured ? '!bg-white !text-azure-700 shadow-none hover:!bg-azure-50' : undefined}
          onClick={() => onSelect?.(pkg)}
          to={onSelect ? undefined : '/contact#consultation'}
        >
          Choose {pkg.name}
        </Button>
        <p className={cn('mt-3 text-center text-caption', featured ? 'text-azure-100' : 'text-slate-500')}>
          {pkg.deliveryDays} delivery · {pkg.revisionWindow}
        </p>
      </div>
    </article>
  );
}
