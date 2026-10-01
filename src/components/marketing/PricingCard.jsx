import { Check, TrendingUp } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { Badge } from '../ui/Badge.jsx';
import { formatCurrency } from '../../utils/format.js';
import { PRICE_TAX_NOTE } from '../../data/legal.js';
import { cn } from '../../utils/cn.js';

/**
 * proresumes.in-style package card: a plain white tile for standard bands,
 * and a brand-gradient "most chosen" card that visually anchors the grid —
 * the same trick order-driven CV sites use to steer picks without hiding
 * the cheaper options.
 */
export function PricingCard({ pkg, highlighted, onSelect, tone = 'light' }) {
  const featured = highlighted ?? pkg.isPopular;
  const darkTone = tone === 'dark';

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col rounded-2xl p-[1.5px] overflow-hidden transition-all duration-300',
        featured
          ? 'shadow-[0_24px_60px_-15px_rgba(29,93,184,0.45),0_0_24px_rgba(79,193,230,0.4)] sm:-translate-y-2'
          : 'shadow-crystal hover:-translate-y-1 hover:shadow-crystal-lg'
      )}
    >
      {/* Continuous Travelling Border Glow */}
      <div
        className={cn(
          'pointer-events-none absolute -inset-[200%] animate-edge-orbit transition-opacity duration-500',
          featured ? 'opacity-100' : 'opacity-25 group-hover:opacity-85'
        )}
        style={{
          background:
            'conic-gradient(from 0deg, transparent 0deg, transparent 260deg, #4FC1E6 295deg, #7DD3EF 325deg, #A98CEA 345deg, #FDF3E2 355deg, rgba(255,255,255,1) 358deg, transparent 360deg)',
        }}
        aria-hidden="true"
      />

      {/* Card Inner Body */}
      <div
        className={cn(
          'relative flex h-full flex-col rounded-[14.5px] p-6 sm:p-7 backdrop-blur-xl',
          featured
            ? 'bg-btn-grad text-white'
            : darkTone
              ? 'border border-white/10 bg-ink-800/80 text-white'
              : 'border border-white/80 bg-white/95'
        )}
      >
        {featured && (
          <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-to-r from-amber-300 to-amber-400 px-3 py-1 text-caption font-extrabold uppercase tracking-wide text-ink-900 shadow-lift">
            <TrendingUp className="h-3.5 w-3.5" aria-hidden />
            Most chosen
          </span>
        )}

      <div>
        <h3 className={cn('text-h3 font-bold', featured || darkTone ? 'text-white' : 'text-ink')}>{pkg.name}</h3>
        <p className={cn('mt-1 text-small', featured ? 'text-azure-100' : darkTone ? 'text-slate-300' : 'text-slate-500')}>{pkg.experienceBand}</p>
      </div>

      {/* Reserves two lines so the price row lines up across all cards,
          whether the tagline wraps or not. */}
      <p className={cn('mt-4 min-h-[3.2em] text-small', featured ? 'text-azure-100' : darkTone ? 'text-slate-300' : 'text-slate-600')}>{pkg.tagline}</p>

      <p className="mt-6 flex flex-wrap items-baseline gap-x-1.5">
        <span className={cn('tabular text-[2.5rem] font-extrabold leading-none sm:text-[2.75rem]', featured || darkTone ? 'text-white' : 'text-ink')}>
          {formatCurrency(pkg.price, pkg.currency || 'INR')}
        </span>
        <span className={cn('whitespace-nowrap text-small', featured ? 'text-azure-200' : darkTone ? 'text-slate-400' : 'text-slate-500')}>one-off</span>
      </p>
      {/* Tax disclosure, directly below the price (consumer protection). */}
      <p className={cn('mt-1.5 text-caption font-medium', featured ? 'text-azure-100' : darkTone ? 'text-slate-400' : 'text-slate-500')}>{PRICE_TAX_NOTE}</p>

      <ul className="mt-6 flex-1 space-y-2.5">
        {pkg.features?.map((feature) => (
          <li key={feature.label} className="flex items-start gap-2.5">
            <span
              className={cn(
                'mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full',
                featured ? 'bg-white/20' : darkTone ? 'bg-white/10' : 'bg-azure-50'
              )}
            >
              <Check className={cn('h-3 w-3', featured ? 'text-white' : darkTone ? 'text-frost-300' : 'text-azure')} strokeWidth={3} aria-hidden />
            </span>
            <span className={cn('text-small', featured || darkTone ? 'text-slate-200' : 'text-slate-700')}>{feature.label}</span>
          </li>
        ))}
      </ul>

      <div className="mt-7">
        <Button
          fullWidth
          variant={featured ? 'onInk' : darkTone ? 'outlineInk' : 'outline'}
          className={featured ? '!bg-white !text-azure-700 shadow-none hover:!bg-azure-50' : undefined}
          onClick={() => onSelect?.(pkg)}
          to={onSelect ? undefined : '/contact#consultation'}
        >
          Choose {pkg.name}
        </Button>
        <p className={cn('mt-3 text-center text-caption', featured ? 'text-azure-100' : darkTone ? 'text-slate-400' : 'text-slate-500')}>
          {pkg.deliveryDays} delivery · {pkg.revisionWindow}
        </p>
      </div>
    </div>
  </article>
  );
}