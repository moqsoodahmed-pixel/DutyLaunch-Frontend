import { useMemo, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Search, Maximize2, ArrowRight, Lock, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Section } from '../ui/Container.jsx';
import { SectionHeader } from '../ui/SectionHeader.jsx';
import { Reveal } from '../ui/Reveal.jsx';
import { Button } from '../ui/Button.jsx';
import { Tabs } from '../ui/Tabs.jsx';
import { Modal } from '../ui/Modal.jsx';
import { EmptyState } from '../ui/States.jsx';
import { ResumeTemplatePreview } from './ResumeTemplatePreview.jsx';
import { TEMPLATES, LAYOUTS, LEVELS, TEMPLATE_COUNT } from '../../data/resumeTemplates.js';
import { cn } from '../../utils/cn.js';
import { easing } from '../../utils/motion.js';
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery.js';
import { useContentProtection } from '../../hooks/useContentProtection.js';
import { useRazorpayCheckout } from '../../hooks/useRazorpayCheckout.js';
import { formatCurrency } from '../../utils/format.js';

const LAYOUT_LABEL = Object.fromEntries(LAYOUTS.map((l) => [l.value, l.label]));

/**
 * Checks whether a template is free or paid in the system.
 */
export function getTemplatePricing(tpl) {
  const id = tpl?.id || tpl?.aliasId || '';
  if (id === 'dl-elite' || id === 'ats-classic' || id === 'ats-minimal' || id === 'ats-fresher') {
    return { isPremium: false, badge: 'Free' };
  }
  return { isPremium: true, badge: 'Paid' };
}

/**
 * Payment Required Modal.
 * Displayed when user tries to access/use a Paid template.
 * Explicitly states that payment is required before granting access to edit, use, or export.
 */
export function PaymentRequiredModal({ tpl, open, onClose, onUnlockSuccess }) {
  const { unlock } = useContentProtection();
  const { pay, pendingId, config } = useRazorpayCheckout();
  const navigate = useNavigate();

  if (!open || !tpl) return null;

  const price = config?.templates?.price;
  const gst = config?.gst?.exclusive ? config.gst.rate : 0;
  const processing = pendingId === tpl.id;

  // Real Razorpay checkout. The template unlocks only after the server has
  // verified the payment, and stays unlocked on this account.
  const handlePay = () =>
    pay({
      itemType: 'template',
      itemId: tpl.id,
      onSuccess: async () => {
        await unlock();
        onUnlockSuccess?.(tpl);
        onClose();
      },
    });

  return (
    <Modal open={open} onClose={onClose} title={`Unlock ${tpl.name}`} description="Paid resume template" size="md">
      <div className="space-y-4 pt-1">
        <div className="relative overflow-hidden rounded-xl border border-amber-400/40 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-slate-900/60 p-4">
          <div className="flex items-center gap-3.5">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/30">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <span className="inline-block rounded-full border border-amber-400/40 bg-amber-500/25 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
                Paid template
              </span>
              <h3 className="text-base font-extrabold text-ink">{tpl.name}</h3>
              <p className="text-caption text-slate-500">
                {price ? (
                  <>
                    <strong className="text-ink">{formatCurrency(price)}</strong>
                    {gst ? ` + ${gst}% GST` : ''} · one-time payment
                  </>
                ) : (
                  'One-time payment'
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 rounded-xl border border-slate-200/90 bg-slate-50/80 p-3.5 text-small text-slate-700">
          <p className="text-[13px] font-semibold text-ink">After payment you can:</p>
          <div className="flex items-center gap-2 text-caption">
            <Check className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>Build your resume with this template in the Resume Builder</span>
          </div>
          <div className="flex items-center gap-2 text-caption">
            <Check className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>Download it as a PDF whenever you need</span>
          </div>
          <div className="flex items-center gap-2 text-caption">
            <Check className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>Keep it unlocked on your account — no repeat payments</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          <button
            type="button"
            disabled={processing}
            onClick={handlePay}
            className="flex-1 cursor-pointer rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-5 py-3 text-body font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
          >
            {processing ? 'Opening payment…' : price ? `Pay ${formatCurrency(price)}${gst ? ' + GST' : ''}` : 'Pay & unlock'}
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate('/resume-builder/editor?template=dl-elite');
            }}
            className="cursor-pointer rounded-xl border border-slate-200 px-4 py-3 text-small font-semibold text-slate-600 transition-colors hover:bg-slate-100"
          >
            Use a free template
          </button>
        </div>
        <p className="text-center text-caption text-slate-500">Secure payment by Razorpay.</p>
      </div>
    </Modal>
  );
}

export { PaymentRequiredModal as PaidUnlockModal };

/**
 * Template card redesigned as an authentic ISO A4 paper document.
 * CLEAN PRESENTATION: No Free/Paid badges on the carousel card.
 * Previews the true resume design.
 * When the user attempts to use a Paid template, access is denied and prompts payment.
 * Anti-screenshot and right-click protected.
 */
export function TemplateCard({ tpl, selected, onSelect, onOpen, className, tone = 'light' }) {
  const [hovered, setHovered] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const navigate = useNavigate();
  const pricing = getTemplatePricing(tpl);
  const { isUnlocked, isWindowBlurred } = useContentProtection();

  const isPaid = pricing.isPremium;
  const isAccessible = !isPaid || isUnlocked(tpl.id);

  const handleAction = (e) => {
    e?.stopPropagation();
    if (!isAccessible) {
      setPaymentModalOpen(true);
      return;
    }
    onSelect?.(tpl.id);
    navigate(`/resume-builder/editor?template=${tpl.id}`);
  };

  const handleCardClick = () => {
    if (!isAccessible) {
      setPaymentModalOpen(true);
      return;
    }
    onSelect?.(tpl.id);
  };

  return (
    <>
      <div
        data-resume-protect="true"
        onContextMenu={(e) => e.preventDefault()}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleCardClick}
        className={cn(
          'group relative flex flex-col cursor-pointer transition-all duration-[260ms] ease-out dl-protected-preview select-none',
          'hover:-translate-y-2 hover:scale-[1.04]',
          className
        )}
      >
        {/* A4 paper preview — clean, realistic, authentic A4 paper */}
        <div
          className={cn(
            'relative overflow-hidden rounded-[4px] bg-white transition-all duration-[260ms]',
            selected
              ? 'shadow-[0_0_0_2px_rgba(43,114,212,0.9),0_18px_45px_-10px_rgba(43,114,212,0.4)]'
              : 'shadow-[0_3px_12px_-2px_rgba(15,28,46,0.18),0_1px_3px_rgba(15,28,46,0.08)] border border-slate-200/90',
            hovered && !selected && 'shadow-[0_20px_45px_-10px_rgba(15,28,46,0.25),0_4px_12px_rgba(15,28,46,0.1)] border-azure-400'
          )}
          style={{ aspectRatio: '210 / 297' }}
        >
          {/* Full resume preview — uncropped, clean preview */}
          <div className="block h-full w-full outline-none">
            <ResumeTemplatePreview template={tpl} crop={false} />
          </div>

          {/* Privacy Shield on Window Blur / Screen capture */}
          {isWindowBlurred && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/90 p-3 text-center backdrop-blur-md">
              <ShieldCheck className="h-6 w-6 text-cyan-400 mb-1" />
              <p className="text-[11px] font-bold text-white">Content Protected</p>
              <p className="text-[9.5px] text-slate-400">Return to window to view</p>
            </div>
          )}

          {/* Top-Right Corner Free Badge for free templates only */}
          {!pricing.isPremium && (
            <span className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-emerald-600 border border-emerald-300/60 px-2.5 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wide text-white shadow-[0_2px_10px_rgba(5,150,105,0.45)] backdrop-blur-xs">
              Free
            </span>
          )}

          {/* Selected badge */}
          {selected && (
            <span className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-azure px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
              <Check className="h-2.5 w-2.5" aria-hidden />
              Selected
            </span>
          )}

          {/* Quick Preview hover overlay */}
          <div
            className={cn(
              'absolute inset-0 flex items-end justify-center pb-4 transition-opacity duration-200',
              hovered ? 'opacity-100' : 'opacity-0'
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpen?.(tpl);
              }}
              className="relative z-10 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-caption font-semibold text-ink shadow-lg backdrop-blur transition-transform duration-150 hover:scale-[1.04] hover:bg-white hover:shadow-xl cursor-pointer"
            >
              <Maximize2 className="h-3 w-3" aria-hidden />
              Quick Preview
            </button>
          </div>
        </div>

        {/* Template info row — clean role and name, NO free/paid badges */}
        <div className="mt-2 px-0.5">
          <div className="flex items-start justify-between gap-1.5">
            <div className="min-w-0 flex-1">
              <h3 className={cn("text-xs sm:text-small font-bold leading-tight line-clamp-1", tone === 'dark' ? "text-white" : "text-slate-900")}>
                {tpl.role}
              </h3>
              <p className={cn("truncate mt-0.5 text-caption", tone === 'dark' ? "text-slate-300" : "text-slate-500")}>
                {tpl.name}
              </p>
            </div>
            <button
              type="button"
              onClick={handleAction}
              className="shrink-0 rounded-lg bg-azure hover:bg-azure-600 px-3 py-1 text-[11px] font-bold text-white shadow-xs transition-all duration-150 active:scale-95 cursor-pointer"
            >
              Use
            </button>
          </div>
        </div>
      </div>

      <PaymentRequiredModal
        tpl={tpl}
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onUnlockSuccess={(unlockedTpl) => {
          onSelect?.(unlockedTpl.id);
          navigate(`/resume-builder/editor?template=${unlockedTpl.id}`);
        }}
      />
    </>
  );
}

/**
 * Infinite conveyor carousel — improved with smooth snapping, no clipping,
 * proper spacing, dynamic mobile/tablet sizing, and high contrast text.
 */
export function InfiniteFlowingShowcase({ templates, selected, onSelect, onOpen, tone = 'dark' }) {
  const containerRef = useRef(null);
  const cardRefs = useRef([]);
  const isPausedRef = useRef(false);
  const positionsRef = useRef(null);
  const reduceMotion = usePrefersReducedMotion();

  const [isSmall, setIsSmall] = useState(false);
  useEffect(() => {
    const checkSize = () => setIsSmall(window.innerWidth < 640);
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  const items = useMemo(() => [...templates, ...templates, ...templates], [templates]);
  const itemCount = items.length;

  const cardWidth = isSmall ? 175 : 220;
  const gap = isSmall ? 12 : 18;
  const itemStep = cardWidth + gap;
  const totalSpan = itemCount * itemStep;

  useEffect(() => {
    if (reduceMotion) return undefined;

    if (!positionsRef.current || positionsRef.current.length !== itemCount) {
      positionsRef.current = items.map((_, i) => i * itemStep);
    }

    let lastTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    let animId;
    const speed = 38;

    const step = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (!isPausedRef.current && positionsRef.current) {
        const positions = positionsRef.current;
        for (let i = 0; i < positions.length; i++) {
          positions[i] -= speed * dt;
          if (positions[i] < -itemStep) {
            positions[i] += totalSpan;
          }
          const el = cardRefs.current[i];
          if (el) {
            el.style.transform = `translate3d(${positions[i]}px, 0, 0)`;
          }
        }
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [items, itemCount, reduceMotion, itemStep, totalSpan]);

  const handlePause = () => { isPausedRef.current = true; };
  const handleResume = () => { isPausedRef.current = false; };

  // A4 aspect ratio height: cardWidth * (297 / 210) + 90px space for info row
  const cardH = Math.round(cardWidth * (297 / 210)) + 90;

  return (
    <div
      ref={containerRef}
      onMouseEnter={handlePause}
      onMouseLeave={handleResume}
      onTouchStart={handlePause}
      onTouchEnd={handleResume}
      className="relative my-4 sm:my-6 w-full overflow-hidden py-3 select-none"
      aria-label="Template carousel"
    >
      <div
        className="relative w-full"
        style={{ height: cardH }}
      >
        {items.map((tpl, i) => (
          <div
            key={`${tpl.id}-${i}`}
            ref={(node) => { cardRefs.current[i] = node; }}
            onMouseEnter={handlePause}
            onMouseLeave={handleResume}
            className="absolute top-1 left-0 will-change-transform"
            style={{
              width: cardWidth,
              transform: `translate3d(${i * itemStep}px, 0, 0)`,
            }}
          >
            <TemplateCard
              tpl={tpl}
              tone={tone}
              selected={selected === tpl.id}
              onSelect={onSelect}
              onOpen={onOpen}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TemplateGallery({
  title = 'DutyLaunch Flagship ATS Templates',
  label = 'Engineered for Every Career Stage',
  lead,
  cta = { label: 'Start Resume Builder', to: '/resume-builder' },
  tone = 'white',
  limit,
}) {
  const [layout, setLayout] = useState('all');
  const [level, setLevel] = useState('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(TEMPLATES[0].id);
  const [preview, setPreview] = useState(null);
  const [paymentModalTpl, setPaymentModalTpl] = useState(null);
  const { isUnlocked } = useContentProtection();

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = TEMPLATES.filter((t) => {
      if (layout !== 'all' && t.id !== layout && t.layout !== layout) return false;
      if (level !== 'all' && t.level !== level) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.personName.toLowerCase().includes(q) ||
        t.role.toLowerCase().includes(q) ||
        t.targetRoles.toLowerCase().includes(q) ||
        t.industry?.toLowerCase().includes(q) ||
        t.skills?.some((s) => s.toLowerCase().includes(q))
      );
    });
    return limit ? list.slice(0, limit) : list;
  }, [layout, level, query, limit]);

  return (
    <Section tone={tone}>
      <Container>
        <Reveal>
          <SectionHeader
            label={label}
            title={title}
            lead={
              lead ??
              'Engineered strictly to ATS parsing standards: semantic hierarchy, single text flow, zero graphic bottlenecks. Choose the flagship template tailored to your industry.'
            }
          />
        </Reveal>

        {/* Carousel */}
        <InfiniteFlowingShowcase
          templates={TEMPLATES}
          selected={selected}
          onSelect={setSelected}
          onOpen={setPreview}
          tone={tone === 'dark' ? 'dark' : 'light'}
        />

        {/* Filter controls */}
        <div className="mt-4 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <Tabs options={LAYOUTS} value={layout} onChange={setLayout} label="Filter by template" />
            <label className="relative w-full lg:max-w-xs">
              <span className="sr-only">Search templates by role or skill</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search software, finance, executive..."
                className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-small text-ink placeholder:text-slate-400 focus:border-azure focus:outline-none focus:ring-2 focus:ring-azure-100 shadow-xs"
              />
            </label>
          </div>
          <Tabs options={LEVELS} value={level} onChange={setLevel} label="Filter by career stage" />
          {layout !== 'all' && (
            <p className="text-small text-slate-600">
              <span className="font-bold text-azure">{LAYOUT_LABEL[layout]}:</span>{' '}
              {LAYOUTS.find((l) => l.value === layout)?.description}
            </p>
          )}
        </div>

        <p className="mt-4 text-small text-slate-500" aria-live="polite">
          Showing {visible.length} of {TEMPLATE_COUNT} DutyLaunch Flagship Templates
        </p>

        {visible.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="No templates match those filters"
              description="Try selecting 'All Flagship Templates' or clear your search keyword."
            />
          </div>
        ) : (
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((tpl, i) => (
              <motion.li
                key={tpl.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.04, ease: easing }}
              >
                <TemplateCard
                  tpl={tpl}
                  tone={tone === 'dark' ? 'dark' : 'light'}
                  selected={selected === tpl.id}
                  onSelect={setSelected}
                  onOpen={setPreview}
                />
              </motion.li>
            ))}
          </ul>
        )}

        {/* CTA bar */}
        <div className="mt-10 overflow-hidden rounded-2xl border border-azure-200/60 bg-gradient-to-r from-frost-50 via-white to-aurora-50 p-5 shadow-sm">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h4 className="font-bold text-ink">Ready to generate your ATS-optimized CV?</h4>
              <p className="mt-1 max-w-prose text-small text-slate-600">
                Switch templates anytime in the Resume Builder with one click.
              </p>
            </div>
            <Button to={cta.to} variant="premium" className="shrink-0">
              {cta.label}
            </Button>
          </div>
        </div>
      </Container>

      {/* Preview Modal */}
      <Modal
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        title={preview ? `${preview.name} — ${preview.industry || preview.tagline}` : ''}
        description={preview ? preview.description : ''}
        size="lg"
      >
        {preview && (() => {
          const pricing = getTemplatePricing(preview);
          const isPaid = pricing.isPremium;
          const isAccessible = !isPaid || isUnlocked(preview.id);

          return (
            <div
              data-resume-protect="true"
              onContextMenu={(e) => e.preventDefault()}
              className="space-y-4 dl-protected-preview select-none"
            >
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm" style={{ aspectRatio: '210 / 297' }}>
                <ResumeTemplatePreview template={preview} crop={false} />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                {isAccessible ? (
                  <Button to={`/resume-builder/editor?template=${preview.id}`} variant="premium" fullWidth>
                    Use {preview.name} in Builder
                  </Button>
                ) : (
                  <Button
                    variant="premium"
                    fullWidth
                    onClick={() => {
                      setPreview(null);
                      setPaymentModalTpl(preview);
                    }}
                  >
                    Pay to Access & Use in Builder
                  </Button>
                )}
                <Button variant="outline" fullWidth onClick={() => setPreview(null)}>
                  Close Preview
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>

      <PaymentRequiredModal
        tpl={paymentModalTpl}
        open={Boolean(paymentModalTpl)}
        onClose={() => setPaymentModalTpl(null)}
        onUnlockSuccess={(unlockedTpl) => {
          setSelected(unlockedTpl.id);
        }}
      />
    </Section>
  );
}

export default TemplateGallery;