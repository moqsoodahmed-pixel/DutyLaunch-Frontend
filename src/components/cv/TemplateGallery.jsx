import { useMemo, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Search, ShieldCheck, Maximize2, ArrowRight, Zap, Award } from 'lucide-react';
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

const LAYOUT_LABEL = Object.fromEntries(LAYOUTS.map((l) => [l.value, l.label]));

/**
 * Premium Flagship ATS Template Card:
 * - Preview, Template Name, Industry.
 * - Three prominent badges: ATS Ready badge, Modern badge, Professional badge.
 * - Quick Preview button & functional "Use Template" CTA button.
 * - Smooth hover lift, scale, blue/purple glow, and continuous edge lighting.
 */
export function TemplateCard({ tpl, selected, onSelect, onOpen, className }) {
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
        'group relative flex flex-col overflow-hidden rounded-2xl p-[1.5px] cursor-pointer transition-all duration-[260ms]',
        'hover:-translate-y-1 hover:scale-[1.025]',
        selected
          ? 'shadow-[0_24px_60px_-15px_rgba(43,114,212,0.45),0_0_28px_rgba(79,193,230,0.55)]'
          : 'shadow-crystal hover:shadow-[0_28px_70px_-15px_rgba(43,114,212,0.38),0_0_24px_rgba(169,140,234,0.38)]',
        className
      )}
    >
      {/* Continuous Travelling Border Glow */}
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
      <div className="relative flex h-full flex-col overflow-hidden rounded-[14.5px] border border-cyan-500/25 bg-[#0B1528]/95 backdrop-blur-xl">
        {/* Glossy Highlight Overlay */}
        <div
          className={cn(
            'pointer-events-none absolute inset-0 z-20 bg-gradient-to-tr from-white/0 via-cyan-400/10 to-transparent transition-opacity duration-500',
            hovered ? 'opacity-100' : 'opacity-0'
          )}
        />

        {/* Top bar: Template Name & Industry */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 bg-[#0E1D38] px-3 py-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="h-2 w-2 shrink-0 rounded-full bg-cyan-400 animate-pulse" />
            <span className="truncate text-[12.5px] font-bold text-white">{tpl.name}</span>
          </div>
          <span className="shrink-0 rounded-full bg-cyan-950/80 border border-cyan-400/40 px-2 py-0.5 text-[9.5px] font-bold text-cyan-300">
            {tpl.industry || tpl.tagline}
          </span>
        </div>

        {/* 3 Prominent Badges Rail: ATS Ready, Modern, Professional */}
        <div className="flex flex-wrap items-center gap-1 border-b border-cyan-500/15 bg-[#081326] px-3 py-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/70 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300 border border-emerald-400/40">
            <ShieldCheck className="h-2.5 w-2.5 text-emerald-400" />
            ATS Ready
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-950/70 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300 border border-cyan-400/40">
            <Zap className="h-2.5 w-2.5 text-cyan-300" />
            Modern
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-950/70 px-1.5 py-0.5 text-[9px] font-bold text-purple-300 border border-purple-400/40">
            <Award className="h-2.5 w-2.5 text-purple-300" />
            Professional
          </span>
        </div>

        {/* Document Preview (Compact Scaled A4 with zero excess whitespace) */}
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
          className="relative block w-full bg-[#060D1A]/60 p-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <div
            className={cn(
              'overflow-hidden rounded-md border border-cyan-500/20 bg-white shadow-xs transition-all duration-[260ms] h-[215px] sm:h-[245px]',
              hovered ? 'scale-[1.01] brightness-[1.02]' : 'brightness-100'
            )}
          >
            <ResumeTemplatePreview template={tpl} crop={true} />
          </div>

          {selected && (
            <span className="absolute right-3.5 top-3.5 z-10 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-lift animate-rise">
              <Check className="h-3 w-3" aria-hidden />
              Selected
            </span>
          )}

          {/* Quick Preview Hover Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpen?.(tpl);
            }}
            className="absolute bottom-3.5 left-1/2 z-10 inline-flex -translate-x-1/2 translate-y-2 items-center gap-1.5 rounded-full bg-slate-900/90 border border-cyan-400/40 px-3 py-1 text-caption font-semibold text-white shadow-lift backdrop-blur transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-azure hover:shadow-crystal focus:translate-y-0 focus:opacity-100 sm:opacity-0"
          >
            <Maximize2 className="h-3 w-3" aria-hidden />
            Quick Preview
          </button>
        </div>

        {/* Details & Actions Footer */}
        <div className="flex flex-1 flex-col p-3 pt-2">
          <div className="flex items-baseline justify-between gap-1">
            <h3 className="truncate text-small font-bold text-white">{tpl.role}</h3>
            <span className="shrink-0 text-caption font-medium text-cyan-300/80">{tpl.personName?.split(' ')[0]}</span>
          </div>
          <p className="mt-0.5 truncate text-caption text-slate-400">{tpl.targetRoles}</p>

          {/* Action Row: Quick Preview & Use Template */}
          <div className="mt-2.5 flex items-center gap-2 border-t border-cyan-500/20 pt-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpen?.(tpl);
              }}
              className="flex-1 rounded-lg border border-cyan-500/30 bg-cyan-950/40 py-2 text-center text-[11.5px] font-semibold text-cyan-300 transition-colors hover:bg-cyan-900/60 hover:text-white"
            >
              Preview
            </button>
            <button
              type="button"
              onClick={handleUseTemplate}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-azure via-cyan-600 to-purple-600 py-2 px-3 text-[11.5px] font-bold text-white shadow-crystal transition-all duration-200 hover:brightness-105 hover:shadow-crystal-lg active:scale-[0.98]"
            >
              Use Template
              <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Premium Infinite Flowing Showcase:
 * - Continuous automatic movement, infinite conveyor loop, no visible reset.
 * - Auto-pauses immediately on hover anywhere over the carousel track or cards.
 * - Resumes immediately on mouse leave with zero jump, zero jitter, and no restart.
 * - Retains exact subpixel translation in a ref.
 */
export function InfiniteFlowingShowcase({ templates, selected, onSelect, onOpen }) {
  const containerRef = useRef(null);
  const cardRefs = useRef([]);
  const isPausedRef = useRef(false);
  const positionsRef = useRef(null);
  const reduceMotion = usePrefersReducedMotion();

  // Duplicate templates to create an unbroken seamless conveyor loop
  const items = useMemo(() => [...templates, ...templates, ...templates], [templates]);
  const itemCount = items.length;

  useEffect(() => {
    if (reduceMotion) return undefined;

    const isSmall = window.innerWidth < 640;
    const cardWidth = isSmall ? 235 : 285;
    const gap = isSmall ? 16 : 20;
    const itemStep = cardWidth + gap;
    const totalSpan = itemCount * itemStep;

    // Preserve positions array across re-renders
    if (!positionsRef.current || positionsRef.current.length !== itemCount) {
      positionsRef.current = items.map((_, i) => i * itemStep);
    }

    let lastTime = performance.now();
    let animId;
    const speed = 46; // pixels per second

    const step = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Only move when NOT hovered/paused
      if (!isPausedRef.current && positionsRef.current) {
        const positions = positionsRef.current;
        for (let i = 0; i < positions.length; i++) {
          positions[i] -= speed * dt;

          // Wrap around seamlessly off left edge
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
  }, [items, itemCount, reduceMotion]);

  const handlePause = () => {
    isPausedRef.current = true;
  };

  const handleResume = () => {
    isPausedRef.current = false;
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handlePause}
      onMouseLeave={handleResume}
      onPointerEnter={handlePause}
      onPointerLeave={handleResume}
      onMouseOver={handlePause}
      onPointerOver={handlePause}
      className="relative my-4 w-full overflow-hidden py-3 select-none"
      aria-label="Infinite Rotating Resume Carousel"
    >
      {/* Edge gradient fade masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-10 bg-gradient-to-r from-glacier-100 via-glacier-100/70 to-transparent sm:w-24" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-10 bg-gradient-to-l from-glacier-100 via-glacier-100/70 to-transparent sm:w-24" />

      {/* Conveyor Track */}
      <div
        onMouseEnter={handlePause}
        onMouseLeave={handleResume}
        onPointerEnter={handlePause}
        onPointerLeave={handleResume}
        onMouseOver={handlePause}
        onPointerOver={handlePause}
        className="relative h-[440px] w-full sm:h-[470px]"
      >
        {items.map((tpl, i) => (
          <div
            key={`${tpl.id}-${i}`}
            ref={(node) => {
              cardRefs.current[i] = node;
            }}
            onMouseEnter={handlePause}
            onMouseLeave={handleResume}
            onPointerEnter={handlePause}
            onPointerLeave={handleResume}
            className="absolute top-2 left-0 w-[235px] will-change-transform sm:w-[285px]"
            style={{
              transform: `translate3d(${i * 305}px, 0, 0)`,
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
  title = 'DutyLaunch Flagship ATS Templates',
  label = 'Engineered for Every Career Stage',
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

        {/* ── PREMIUM INFINITE ROTATING CAROUSEL (PAUSE ON HOVER VERIFIED) ── */}
        <InfiniteFlowingShowcase
          templates={TEMPLATES}
          selected={selected}
          onSelect={setSelected}
          onOpen={setPreview}
        />

        {/* ── FILTER CONTROLS ── */}
        <div className="mt-6 space-y-4">
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
                className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-small text-ink placeholder:text-slate-400 focus:border-azure focus:outline-none focus:ring-2 focus:ring-azure-100 shadow-xs"
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
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                  selected={selected === tpl.id}
                  onSelect={setSelected}
                  onOpen={setPreview}
                />
              </motion.li>
            ))}
          </ul>
        )}

        {/* Action Callout Bar */}
        <div className="relative mt-10 overflow-hidden rounded-2xl p-[1.5px] shadow-crystal">
          <div
            className="pointer-events-none absolute -inset-[200%] opacity-65 animate-edge-orbit"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, #4FC1E6 310deg, #A98CEA 340deg, #FDF3E2 355deg, transparent 360deg)',
            }}
            aria-hidden="true"
          />
          <div className="relative flex flex-col items-center gap-4 rounded-[14.5px] border border-white/80 bg-gradient-to-r from-frost-50 via-white to-aurora-200/40 p-5 text-center backdrop-blur-xl sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h4 className="font-bold text-ink">Ready to generate your ATS-optimized CV?</h4>
              <p className="mt-1 max-w-prose text-small text-slate-600">
                Switch templates anytime in the AI Resume Builder with one click — all content updates seamlessly without losing formatting.
              </p>
            </div>
            <Button to={cta.to} variant="premium" className="shrink-0 shadow-crystal">
              {cta.label}
            </Button>
          </div>
        </div>
      </Container>

      {/* Full Screen Preview Modal */}
      <Modal
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        title={preview ? `${preview.name} (${preview.personName}) — ${preview.industry || preview.tagline}` : ''}
        description={preview ? preview.description : ''}
        size="lg"
      >
        {preview && (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-glacier-300 bg-white shadow-crystal">
              <ResumeTemplatePreview template={preview} crop={false} />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                to={`/cv-builder?template=${preview.id}`}
                variant="premium"
                fullWidth
              >
                Use {preview.name} in Builder
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