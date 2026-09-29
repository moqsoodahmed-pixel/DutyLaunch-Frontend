import { useMemo, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Search, ShieldCheck, Maximize2, ArrowRight } from 'lucide-react';
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

const ATS_LABEL = {
  max: '100% ATS Guaranteed',
  high: '98% ATS Compatible',
};

const LAYOUT_LABEL = Object.fromEntries(LAYOUTS.map((l) => [l.value, l.label]));

/**
 * Premium Flagship ATS Template Card:
 * - Aspect ratio close to A4, displayed shorter with minimal whitespace.
 * - Card lifts with scale 1.03, soft shadow increases, and continuous glowing edge.
 * - Prominent "Use Template" CTA button with Blue -> Purple gradient on hover.
 * - Navigates directly into Resume Builder with selected template preloaded.
 */
function TemplateCard({ tpl, selected, onSelect, onOpen, className }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  const handleUseTemplate = (e) => {
    e.stopPropagation();
    onSelect?.(tpl.id);
    navigate(`/cv-builder?template=${tpl.id}`);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl p-[1.5px] cursor-pointer transition-all duration-[250ms]',
        'hover:-translate-y-1 hover:scale-[1.03]',
        selected
          ? 'shadow-[0_24px_60px_-15px_rgba(43,114,212,0.45),0_0_28px_rgba(79,193,230,0.55)]'
          : 'shadow-crystal hover:shadow-[0_30px_75px_-20px_rgba(43,114,212,0.38),0_0_24px_rgba(169,140,234,0.4)]',
        className
      )}
    >
      {/* Continuous Travelling Border Glow (Analyze Button Colors: Cyan -> Blue -> Purple) */}
      <div
        className={cn(
          'pointer-events-none absolute -inset-[200%] transition-opacity duration-500',
          hovered || selected ? 'opacity-100' : 'opacity-40'
        )}
        style={{
          background:
            'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, #4FC1E6 305deg, #2B72D4 330deg, #A98CEA 355deg, transparent 360deg)',
          animation: 'edge-orbit 6s linear infinite',
        }}
        aria-hidden="true"
      />

      {/* Card Inner Body */}
      <div className="relative flex h-full flex-col overflow-hidden rounded-[14.5px] border border-white/80 bg-white/95 backdrop-blur-xl">
        {/* Moving Glossy Highlight on Card */}
        <div
          className={cn(
            'pointer-events-none absolute inset-0 z-20 bg-gradient-to-tr from-white/0 via-white/40 to-transparent transition-opacity duration-500',
            hovered ? 'opacity-100' : 'opacity-0'
          )}
        />

        {/* Header bar of the card */}
        <div className="flex items-center justify-between border-b border-glacier-300/80 bg-glacier-50/90 px-3.5 py-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-frost-500 animate-pulse" />
            <span className="text-[12.5px] font-bold text-ink">{tpl.name}</span>
          </div>
          <span className="rounded-full bg-azure-50 px-2 py-0.5 text-[10px] font-bold text-azure-700">
            {tpl.tagline}
          </span>
        </div>

        {/* Candidate Persona Line */}
        <div className="flex items-center justify-between border-b border-glacier-200/60 bg-white px-3.5 py-1 text-caption text-slate-500">
          <span>
            Candidate: <span className="font-bold text-ink">{tpl.personName}</span>
          </span>
          <span className="font-semibold text-emerald-600 inline-flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> ATS 100%
          </span>
        </div>

        {/* Preview Section — Shorter A4 proportion with centered content and no excess whitespace */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelect?.(tpl.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect?.(tpl.id);
            }
          }}
          aria-pressed={selected}
          className="relative block w-full bg-glacier-100/50 p-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-frost-400"
        >
          <div
            className={cn(
              'overflow-hidden rounded-md border border-glacier-300/70 bg-white shadow-xs transition-all duration-[250ms]',
              hovered ? 'scale-[1.01] brightness-[1.02]' : 'brightness-100'
            )}
          >
            <ResumeTemplatePreview template={tpl} crop={true} />
          </div>

          {selected && (
            <span className="absolute right-3.5 top-3.5 z-10 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-lift animate-rise">
              <Check className="h-3.5 w-3.5" aria-hidden />
              Selected
            </span>
          )}

          {/* Quick Preview Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpen?.(tpl);
            }}
            className="absolute bottom-3 left-1/2 z-10 inline-flex -translate-x-1/2 translate-y-2 items-center gap-1.5 rounded-full bg-ink/90 px-3.5 py-1 text-caption font-semibold text-white shadow-lift backdrop-blur transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-azure hover:shadow-crystal focus:translate-y-0 focus:opacity-100 sm:opacity-0"
          >
            <Maximize2 className="h-3 w-3" aria-hidden />
            Quick Preview
          </button>
        </div>

        {/* Details & CTA footer */}
        <div className="flex flex-1 flex-col p-3.5 pt-2.5">
          <h3 className="text-small font-bold text-ink">{tpl.role}</h3>
          <p className="mt-0.5 text-caption text-slate-600 line-clamp-1">{tpl.targetRoles}</p>

          {/* Dedicated "Use Template" CTA Button with Blue -> Purple hover gradient (NO SPARKLES) */}
          <div className="mt-3 pt-2 border-t border-line/60">
            <button
              type="button"
              onClick={handleUseTemplate}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-frost-500 via-azure-400 to-aurora-500 px-4 py-2.5 text-[12.5px] font-bold text-white shadow-crystal transition-all duration-[250ms] hover:brightness-105 hover:shadow-crystal-lg active:scale-[0.98]"
            >
              Use Template
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Premium Infinite Flowing Showcase:
 * - Continuous automatic movement, infinite loop, no visible reset.
 * - NO pause button, NO play button.
 * - When cursor enters carousel: PAUSE automatically.
 * - When cursor leaves carousel: RESUME automatically.
 * - NO unnecessary outer box — seamlessly integrated into page.
 * - Smooth 60 FPS GPU-accelerated motion via requestAnimationFrame.
 */
function InfiniteFlowingShowcase({ templates, selected, onSelect, onOpen }) {
  const containerRef = useRef(null);
  const cardRefs = useRef([]);
  const isPausedRef = useRef(false);
  const reduceMotion = usePrefersReducedMotion();

  // Duplicate templates to create an unbroken seamless conveyor loop
  const items = useMemo(() => [...templates, ...templates, ...templates], [templates]);
  const itemCount = items.length;

  useEffect(() => {
    if (reduceMotion) return undefined;

    const isSmall = window.innerWidth < 640;
    const cardWidth = isSmall ? 250 : 310;
    const gap = isSmall ? 16 : 24;
    const itemStep = cardWidth + gap;
    const totalSpan = itemCount * itemStep;

    // Initialize positions array
    const positions = items.map((_, i) => i * itemStep);

    let lastTime = performance.now();
    let animId;
    const speed = 52; // pixels per second

    const step = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1); // clamp delta
      lastTime = now;

      // Auto-pause entire carousel on hover; resume automatically on leave
      if (!isPausedRef.current) {
        positions.forEach((pos, i) => {
          positions[i] = pos - speed * dt;

          // Wrap around seamlessly when scrolling off the left edge
          if (positions[i] < -itemStep) {
            positions[i] += totalSpan;
          }

          const el = cardRefs.current[i];
          if (el) {
            el.style.transform = `translate3d(${positions[i]}px, 0, 0)`;
          }
        });
      }

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animId);
  }, [items, itemCount, reduceMotion]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => {
        isPausedRef.current = true;
      }}
      onMouseLeave={() => {
        isPausedRef.current = false;
      }}
      className="relative my-6 w-full overflow-hidden py-4 select-none"
      aria-label="Infinite Flowing Resume Showcase"
    >
      {/* Edge gradient fade masks for seamless flow */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-12 bg-gradient-to-r from-glacier-100 via-glacier-100/80 to-transparent sm:w-28" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-12 bg-gradient-to-l from-glacier-100 via-glacier-100/80 to-transparent sm:w-28" />

      {/* Infinite Stage Track (Clean, unboxed) */}
      <div className="relative h-[530px] w-full sm:h-[570px]">
        {items.map((tpl, i) => (
          <div
            key={`${tpl.id}-${i}`}
            ref={(node) => {
              cardRefs.current[i] = node;
            }}
            className="absolute top-2 left-0 w-[250px] transition-transform duration-100 will-change-transform sm:w-[310px]"
            style={{
              transform: `translate3d(${i * 334}px, 0, 0)`,
            }}
          >
            <TemplateCard
              tpl={tpl}
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
  title = 'Five Flagship ATS Templates. Engineered for Every Career Stage.',
  label = 'DutyLaunch Flagship Templates',
  lead,
  cta = { label: 'Start AI Resume Builder', to: '/ai-resume-builder' },
  tone = 'white',
  limit,
}) {
  const [layout, setLayout] = useState('all');
  const [level, setLevel] = useState('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(TEMPLATES[0].id);
  const [preview, setPreview] = useState(null);

  // Filter templates based on current selections
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

        {/* ── PREMIUM INFINITE FLOWING SHOWCASE (AUTO SCROLL, AUTO PAUSE ON HOVER, NO BUTTONS) ── */}
        <InfiniteFlowingShowcase
          templates={TEMPLATES}
          selected={selected}
          onSelect={setSelected}
          onOpen={setPreview}
        />

        {/* ── FILTER CONTROLS ── */}
        <div className="mt-8 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <Tabs
              options={LAYOUTS}
              value={layout}
              onChange={setLayout}
              label="Filter by Flagship Template"
            />

            <label className="relative w-full lg:max-w-xs">
              <span className="sr-only">Search templates by role or skill</span>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search software, finance, executive..."
                className="h-11 w-full rounded-sm border border-line bg-white pl-9 pr-3 text-small text-ink placeholder:text-slate-400 focus:border-azure focus:outline-none focus:ring-2 focus:ring-azure-100 shadow-xs"
              />
            </label>
          </div>

          <Tabs
            options={LEVELS}
            value={level}
            onChange={setLevel}
            label="Filter by career stage"
          />

          {layout !== 'all' && (
            <p className="text-small text-slate-600">
              <span className="font-bold text-azure">{LAYOUT_LABEL[layout]}:</span>{' '}
              {LAYOUTS.find((l) => l.value === layout)?.description}
            </p>
          )}
        </div>

        <p className="mt-6 text-small text-slate-500" aria-live="polite">
          Showing {visible.length} of {TEMPLATE_COUNT} DutyLaunch Flagship Templates
        </p>

        {visible.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="No templates match those filters"
              description="Try selecting 'All 5 Flagship Templates' or clear your search keyword."
            />
          </div>
        ) : (
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((tpl, i) => (
              <motion.li
                key={tpl.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05, ease: easing }}
              >
                <TemplateCard
                  tpl={tpl}
                  selected={selected === tpl.id}
                  onSelect={setSelected}
                  onOpen={setPreview}
                />
              </motion.li>
            ))}
          </ul>
        )}

        {/* Action Callout Bar with Dynamic Travelling Border Glow */}
        <div className="relative mt-12 overflow-hidden rounded-2xl p-[1.5px] shadow-crystal">
          <div
            className="pointer-events-none absolute -inset-[200%] opacity-65 animate-edge-orbit"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, #4FC1E6 310deg, #A98CEA 340deg, #FDF3E2 355deg, transparent 360deg)',
            }}
            aria-hidden="true"
          />
          <div className="relative flex flex-col items-center gap-4 rounded-[14.5px] border border-white/80 bg-gradient-to-r from-frost-50 via-white to-aurora-200/40 p-6 text-center backdrop-blur-xl sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h4 className="font-bold text-ink">Ready to generate your ATS-verified CV?</h4>
              <p className="mt-1 max-w-prose text-small text-slate-600">
                Switch templates anytime in the AI Resume Builder with one click — all content updates seamlessly without losing formatting.
              </p>
            </div>
            <Button to={cta.to} variant="premium" className="shrink-0">
              {cta.label}
            </Button>
          </div>
        </div>
      </Container>

      {/* Full Screen Preview Modal */}
      <Modal
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        title={preview ? `${preview.name} (${preview.personName}) — ${preview.tagline}` : ''}
        description={preview ? preview.description : ''}
        size="lg"
      >
        {preview && (
          <div className="space-y-5">
            <div className="overflow-hidden rounded-xl border border-glacier-300 bg-white shadow-crystal">
              <ResumeTemplatePreview template={preview} crop={false} />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                to={`/ai-resume-builder?template=${preview.id}`}
                variant="premium"
                fullWidth
              >
                Use {preview.name} in AI Builder
              </Button>
              <Button variant="outline" fullWidth onClick={() => setPreview(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </Section>
  );
}

export default TemplateGallery;