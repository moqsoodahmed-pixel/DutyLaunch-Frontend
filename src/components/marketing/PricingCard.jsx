import {
  FileText,
  Mail,
  Linkedin,
  RotateCcw,
  Truck,
  Zap,
  Target,
  ShieldCheck,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { formatCurrency } from '../../utils/format.js';
import { PRICE_TAX_NOTE } from '../../data/legal.js';
import { cn } from '../../utils/cn.js';
import { useRazorpayCheckout } from '../../hooks/useRazorpayCheckout.js';

function getPricingDetails(price) {
  if (price <= 399) return { original: 899, save: 'Save ₹500' };
  if (price <= 799) return { original: 1499, save: 'Save ₹700' };
  if (price <= 999) return { original: 1799, save: 'Save ₹800' };
  return { original: 2199, save: 'Save ₹1,000' };
}

function getFeatureIcon(label = '', featured = false) {
  const lower = label.toLowerCase();
  if (lower.includes('linkedin')) {
    return <Linkedin className="h-4 w-4 text-[#0077b5] shrink-0 mt-0.5" />;
  }
  if (lower.includes('cover letter')) {
    return <Mail className={cn('h-4 w-4 shrink-0 mt-0.5', featured ? 'text-azure-200' : 'text-azure')} />;
  }
  if (lower.includes('cv') || lower.includes('resume')) {
    return <FileText className={cn('h-4 w-4 shrink-0 mt-0.5', featured ? 'text-azure-200' : 'text-azure')} />;
  }
  if (lower.includes('revision')) {
    return <RotateCcw className={cn('h-4 w-4 shrink-0 mt-0.5', featured ? 'text-azure-200' : 'text-azure')} />;
  }
  if (lower.includes('delivery') || lower.includes('day') || lower.includes('turnaround')) {
    return <Truck className={cn('h-4 w-4 shrink-0 mt-0.5', featured ? 'text-emerald-300' : 'text-emerald-600')} />;
  }
  if (lower.includes('achievement') || lower.includes('outcome')) {
    return <Zap className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />;
  }
  if (lower.includes('keyword') || lower.includes('mapping') || lower.includes('target')) {
    return <Target className={cn('h-4 w-4 shrink-0 mt-0.5', featured ? 'text-azure-200' : 'text-blue-600')} />;
  }
  if (lower.includes('leadership') || lower.includes('scope')) {
    return <ShieldCheck className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />;
  }
  if (lower.includes('executive') || lower.includes('board')) {
    return <Award className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />;
  }
  return <CheckCircle2 className={cn('h-4 w-4 shrink-0 mt-0.5', featured ? 'text-emerald-300' : 'text-emerald-600')} />;
}

/**
 * proresumes.in-style package card with combo icons, deliverable badges,
 * discount ribbon, and fast turnaround assurance.
 */
export function PricingCard({ pkg, highlighted, onSelect, tone = 'light' }) {
  const featured = highlighted ?? pkg.isPopular;
  const darkTone = false;
  const { pay, pendingId, enabled } = useRazorpayCheckout();
  const canPay = enabled !== false && pkg.price > 0;
  const paying = pendingId === pkg._id;
  const pricingInfo = getPricingDetails(pkg.price);

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col rounded-2xl p-px transition-[transform,box-shadow] duration-200 ease-out cursor-default',
        'hover:z-20 hover:-translate-y-0.5',
        featured ? 'shadow-card-hover' : 'shadow-card hover:shadow-card-hover'
      )}
    >
      {/* Continuous Travelling Border Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden="true">
        <div
          className={cn(
            'absolute -inset-[200%] animate-edge-orbit transition-opacity duration-500',
            featured ? 'opacity-100' : 'opacity-25 group-hover:opacity-100'
          )}
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, transparent 260deg, #4FC1E6 295deg, #7DD3EF 325deg, #A98CEA 345deg, #FDF3E2 355deg, rgba(255,255,255,1) 358deg, transparent 360deg)',
          }}
        />
      </div>

      {/* Prominently placed, unclipped Most Popular badge */}
      {featured && (
        <div className="pointer-events-none absolute -top-3.5 left-6 z-30">
          <span className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-amber-300 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-ink ring-2 ring-white shadow-sm">
            Most Popular
          </span>
        </div>
      )}

      {/* Corner Discount Ribbon Badge */}
      <div className="pointer-events-none absolute -top-3.5 right-4 z-30">
        <span className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-blue-700 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-white ring-2 ring-white shadow-md">
          {pricingInfo.save}
        </span>
      </div>

      {/* Card Inner Body */}
      <div
        className={cn(
          'relative flex h-full flex-col rounded-[15px] p-6 sm:p-7',
          featured ? 'bg-ink-800 text-white' : 'bg-white text-ink'
        )}
      >
        <div>
          <h3 className={cn('text-h3 font-bold', featured ? 'text-white' : 'text-ink')}>{pkg.name}</h3>
          <p className={cn('mt-1 text-small', featured ? 'text-azure-100' : 'text-slate-500')}>
            {pkg.experienceBand} of experience
          </p>
        </div>

        <p className={cn('mt-3 min-h-[3em] text-caption', featured ? 'text-azure-100' : 'text-slate-600')}>
          {pkg.tagline}
        </p>

        {/* Price row with strikethrough original */}
        <div className="mt-4 flex flex-wrap items-baseline gap-x-2">
          <span className={cn('tabular text-[2.25rem] font-extrabold leading-none sm:text-[2.5rem]', featured ? 'text-white' : 'text-ink')}>
            {formatCurrency(pkg.price, pkg.currency || 'INR')}
          </span>
          <span className={cn('text-small line-through', featured ? 'text-azure-200' : 'text-slate-400')}>
            ₹{pricingInfo.original}
          </span>
          <span className={cn('text-caption', featured ? 'text-azure-200' : 'text-slate-500')}>+18% GST</span>
        </div>

        {/* Visual Combo Icon Row (ProResumes style: Icon on top, Label on bottom) */}
        <div
          className={cn(
            'my-4 rounded-xl border py-2.5 px-3 text-center shadow-inner',
            featured
              ? 'border-white/20 bg-white/10 text-white'
              : 'border-slate-200/90 bg-slate-50/90 text-slate-700'
          )}
        >
          <div className="flex items-center justify-around">
            <div className="flex flex-col items-center gap-1">
              <FileText className={cn('h-4 w-4', featured ? 'text-azure-200' : 'text-azure')} />
              <span className="text-[11px] font-bold">CV</span>
            </div>
            <span className={cn('text-caption font-bold', featured ? 'text-white/40' : 'text-slate-300')}>+</span>
            <div className="flex flex-col items-center gap-1">
              <Mail className={cn('h-4 w-4', featured ? 'text-azure-200' : 'text-azure')} />
              <span className="text-[11px] font-bold whitespace-nowrap">Cover Letter</span>
            </div>
            <span className={cn('text-caption font-bold', featured ? 'text-white/40' : 'text-slate-300')}>+</span>
            <div className="flex flex-col items-center gap-1">
              <Linkedin className={cn('h-4 w-4', featured ? 'text-azure-200' : 'text-[#0077b5]')} />
              <span className={cn('text-[11px] font-bold', featured ? 'text-white' : 'text-[#0077b5]')}>LinkedIn</span>
            </div>
          </div>
        </div>

        {/* Deliverables list with dedicated icons */}
        <ul className="mt-2 flex-1 space-y-2.5">
          {pkg.features?.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              {getFeatureIcon(feature.label, featured)}
              <span className={cn('text-small leading-snug', featured ? 'text-slate-200' : 'text-slate-700')}>
                {feature.label}
              </span>
            </li>
          ))}
        </ul>

        {/* Action Bottom Section with Delivery Badge */}
        <div className="mt-7 pt-4 border-t border-slate-100/20">
          {/* Dedicated Delivery Pill */}
          <div
            className={cn(
              'mb-3 flex items-center justify-center gap-2 rounded-lg py-1.5 px-3 text-center text-[12px] font-bold border shadow-sm',
              featured
                ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
                : 'bg-emerald-50 border-emerald-200/80 text-emerald-900'
            )}
          >
            <Truck className={cn('h-4 w-4', featured ? 'text-emerald-300' : 'text-emerald-600')} />
            <span>Delivery within a day</span>
          </div>

          {canPay ? (
            <Button
              fullWidth
              variant={featured ? 'onInk' : 'outline'}
              className={featured ? '!bg-white !text-azure-700 shadow-none hover:!bg-azure-50 group-hover:!bg-azure-50/95' : undefined}
              onClick={() => pay({ itemType: 'cv-package', itemId: pkg._id })}
              loading={paying}
              disabled={enabled === null || Boolean(pendingId)}
            >
              {paying ? 'Opening payment…' : `Buy ${pkg.name}`}
            </Button>
          ) : (
            <Button
              fullWidth
              variant={featured ? 'onInk' : 'outline'}
              className={featured ? '!bg-white !text-azure-700 shadow-none hover:!bg-azure-50 group-hover:!bg-azure-50/95' : undefined}
              onClick={() => onSelect?.(pkg)}
              to={onSelect ? undefined : '/contact#consultation'}
            >
              Choose {pkg.name}
            </Button>
          )}

          <p className={cn('mt-2 text-center text-[11px]', featured ? 'text-azure-200' : 'text-slate-400')}>
            Within a day delivery • {pkg.revisionWindow || '1 month unlimited revisions'}
          </p>
        </div>
      </div>
    </article>
  );
}
