import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  FileCheck,
  Check,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResumeTemplatePreview } from './ResumeTemplatePreview.jsx';
import { TEMPLATES } from '../../data/resumeTemplates.js';
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery.js';

// 20% faster than previous (3300ms -> 2640ms)
const ROTATE_INTERVAL_MS = 2640;

// All FIVE flagship DutyLaunch templates
const SHOWCASE_TEMPLATES = [
  TEMPLATES.find((t) => t.id === 'dl-elite') || TEMPLATES[0],
  TEMPLATES.find((t) => t.id === 'dl-tech') || TEMPLATES[1],
  TEMPLATES.find((t) => t.id === 'dl-professional') || TEMPLATES[2],
  TEMPLATES.find((t) => t.id === 'dl-executive') || TEMPLATES[3],
  TEMPLATES.find((t) => t.id === 'dl-modern') || TEMPLATES.find((t) => t.id === 'dl-project-plus') || TEMPLATES[4],
];

/* Five 3D layered slots arranged in the exact ResumeWallah-inspired spatial arc:
 * Slot 0: Center   — 100% Front, 0° tilt, scale 1.0, maximum prominence & clarity
 * Slot 1: Right    — +12° tilt, x: +140, y: 14, scale: 0.88, zIndex: 20
 * Slot 2: Far Right— +16° tilt, x: +245, y: 32, scale: 0.74, zIndex: 10, blurred, lower opacity
 * Slot 3: Far Left — -16° tilt, x: -245, y: 32, scale: 0.74, zIndex: 10, blurred, lower opacity
 * Slot 4: Left     — -12° tilt, x: -140, y: 14, scale: 0.88, zIndex: 20
 */
const DESKTOP_SLOTS = [
  { x: 0, y: -4, rotateY: 0, rotateZ: 0, scale: 1.0, zIndex: 30, blur: 0, opacity: 1 },
  { x: 140, y: 14, rotateY: -10, rotateZ: 12, scale: 0.88, zIndex: 20, blur: 0.8, opacity: 0.92 },
  { x: 245, y: 32, rotateY: -16, rotateZ: 16, scale: 0.74, zIndex: 10, blur: 2.6, opacity: 0.58 },
  { x: -245, y: 32, rotateY: 16, rotateZ: -16, scale: 0.74, zIndex: 10, blur: 2.6, opacity: 0.58 },
  { x: -140, y: 14, rotateY: 10, rotateZ: -12, scale: 0.88, zIndex: 20, blur: 0.8, opacity: 0.92 },
];

const MOBILE_SLOTS = [
  { x: 0, y: -4, rotateY: 0, rotateZ: 0, scale: 0.96, zIndex: 30, blur: 0, opacity: 1 },
  { x: 62, y: 10, rotateY: -6, rotateZ: 8, scale: 0.82, zIndex: 20, blur: 1.0, opacity: 0.88 },
  { x: 105, y: 22, rotateY: -12, rotateZ: 12, scale: 0.68, zIndex: 10, blur: 2.5, opacity: 0.52 },
  { x: -105, y: 22, rotateY: 12, rotateZ: -12, scale: 0.68, zIndex: 10, blur: 2.5, opacity: 0.52 },
  { x: -62, y: 10, rotateY: 6, rotateZ: -8, scale: 0.82, zIndex: 20, blur: 1.0, opacity: 0.88 },
];

const SOFT_SPRING = { type: 'spring', stiffness: 155, damping: 20, mass: 0.92 };

export function ResumeShowcase({ className }) {
  const reduceMotion = usePrefersReducedMotion();
  // order[slotIndex] = which template index is currently placed in that slot
  const [order, setOrder] = useState([0, 1, 2, 3, 4]);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const isPausedRef = useRef(false);

  useEffect(() => {
    isPausedRef.current = hoveredIdx !== null;
  }, [hoveredIdx]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Continuous automatic rotation: seamlessly moves each template to the next slot
  useEffect(() => {
    if (reduceMotion) return undefined;

    const interval = setInterval(() => {
      if (isPausedRef.current) return;

      setOrder((prev) => {
        const next = [...prev];
        const last = next.pop();
        next.unshift(last);
        return next;
      });
    }, ROTATE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [reduceMotion]);

  const handleMouseMove = (e) => {
    if (reduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseOffset({ x: x * 18, y: y * 14 });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
    setHoveredIdx(null);
    isPausedRef.current = false;
  };

  const slots = isMobile ? MOBILE_SLOTS : DESKTOP_SLOTS;

  return (
    <div
      className={`relative mx-auto flex w-full max-w-[42rem] items-center justify-center py-2 lg:py-4 select-none ${className || ''}`}
      style={{ perspective: 1800 }}
      role="region"
      aria-label="Interactive 3D DutyLaunch 5-Template Showcase"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Ambient background glow ring with multi-color aurora mesh */}
      <div
        className="pointer-events-none absolute -inset-8 -z-10 rounded-full opacity-75 blur-3xl transition-opacity duration-700"
        style={{
          background:
            'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(79, 193, 230, 0.35), rgba(169, 140, 234, 0.28), rgba(253, 243, 226, 0.35) 60%, transparent 75%)',
        }}
        aria-hidden="true"
      />

      {/* Floating 3D Showcase Stage */}
      <div className="relative flex h-[28rem] w-full items-center justify-center sm:h-[32rem] md:h-[34rem]">
        {/* =================================================================
         * 5 RESUME STACK LAYERS (Center 100%, Left -12°, Right +12°, Back blurred)
         * ================================================================= */}
        {SHOWCASE_TEMPLATES.map((tpl, tplIndex) => {
          const slotIndex = order.indexOf(tplIndex);
          const slot = slots[slotIndex] ?? slots[0];
          const isHovered = hoveredIdx === tplIndex;
          const isAnyHovered = hoveredIdx !== null;
          const isFront = slotIndex === 0;

          // Parallax tilt adjustment based on cursor
          const parallaxX = isHovered
            ? mouseOffset.x * 0.4
            : slot.x + (isFront ? mouseOffset.x * 0.2 : mouseOffset.x * 0.1);
          const parallaxY = isHovered
            ? -20 + mouseOffset.y * 0.4
            : slot.y + (isFront ? mouseOffset.y * 0.2 : mouseOffset.y * 0.1);
          const parallaxRotateY = isHovered
            ? mouseOffset.x * 0.35
            : slot.rotateY + (isFront ? mouseOffset.x * 0.25 : 0);
          const parallaxRotateZ = isHovered ? mouseOffset.x * 0.08 : slot.rotateZ;

          return (
            <motion.div
              key={tpl.id}
              role="button"
              tabIndex={0}
              aria-label={`${tpl.name} resume template preview`}
              onMouseEnter={() => setHoveredIdx(tplIndex)}
              onMouseLeave={() => setHoveredIdx(null)}
              onFocus={() => setHoveredIdx(tplIndex)}
              onBlur={() => setHoveredIdx(null)}
              className="absolute cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-frost-400"
              style={{
                width: isMobile ? '16rem' : '19.5rem',
                zIndex: isHovered ? 45 : slot.zIndex,
                transformStyle: 'preserve-3d',
              }}
              initial={false}
              animate={
                reduceMotion
                  ? {
                      x: slot.x,
                      y: slot.y,
                      scale: 1,
                      opacity: 1,
                      filter: 'blur(0px)',
                    }
                  : {
                      x: parallaxX,
                      y: parallaxY,
                      rotateY: parallaxRotateY,
                      rotateZ: parallaxRotateZ,
                      scale: isHovered ? 1.06 : slot.scale,
                      opacity: isAnyHovered && !isHovered ? 0.45 : slot.opacity,
                      filter: `blur(${isHovered ? 0 : slot.blur}px)`,
                    }
              }
              transition={SOFT_SPRING}
            >
              {/* Card Shell with Continuous Travelling Border Glow */}
              <div
                className={`group relative overflow-hidden rounded-2xl p-[1.5px] transition-all duration-300 ${
                  isHovered
                    ? 'shadow-[0_38px_90px_-15px_rgba(47,163,204,0.52),0_0_30px_rgba(169,140,234,0.45)]'
                    : isFront
                    ? 'shadow-crystal-lg'
                    : 'shadow-crystal'
                }`}
              >
                {/* Continuous Travelling Border Light (Moving Blue -> Cyan -> Purple -> White beam) */}
                <div
                  className={`pointer-events-none absolute -inset-[200%] transition-opacity duration-500 ${
                    isHovered ? 'opacity-100' : isFront ? 'opacity-85' : 'opacity-35'
                  }`}
                  style={{
                    background:
                      'conic-gradient(from 0deg, transparent 0deg, transparent 260deg, #1D5DB8 285deg, #4FC1E6 315deg, #A98CEA 340deg, #FDF3E2 355deg, rgba(255,255,255,1) 358deg, transparent 360deg)',
                    animation: 'edge-orbit 6s linear infinite',
                  }}
                  aria-hidden="true"
                />

                {/* Inner Card Container */}
                <div
                  className="relative overflow-hidden rounded-[14.5px] border border-white/80 bg-white/95 backdrop-blur-xl"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,251,254,0.95) 100%)',
                  }}
                >
                  {/* Moving Glossy Sheen overlay on hover */}
                  <div
                    className={`pointer-events-none absolute inset-0 z-20 bg-gradient-to-tr from-white/0 via-white/40 to-transparent transition-opacity duration-500 ${
                      isHovered ? 'opacity-100' : 'opacity-0'
                    }`}
                  />

                  {/* Top Badge Rail */}
                  <div className="flex items-center justify-between border-b border-glacier-300/80 bg-glacier-50/90 px-3.5 py-2.5 backdrop-blur-md">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-frost-500 animate-pulse" />
                      <span className="text-[12px] font-bold text-ink">{tpl.name}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-azure-50/90 px-2 py-0.5 text-[10px] font-semibold text-azure-700">
                      <ShieldCheck className="h-3 w-3 text-azure-600" aria-hidden />
                      ATS 100%
                    </span>
                  </div>

                  {/* Production-Ready Realistic Resume Document Preview (Zero Placeholders) */}
                  <div className="relative overflow-hidden bg-white p-2">
                    <ResumeTemplatePreview template={tpl} crop={true} />
                  </div>

                  {/* Floating Bottom Action Prompt */}
                  <div
                    className={`flex items-center justify-between border-t border-glacier-300/70 bg-white/95 px-3.5 py-2 text-caption transition-colors duration-200 ${
                      isHovered ? 'bg-frost-50/90 text-azure-700' : 'text-slate-500'
                    }`}
                  >
                    <span className="font-semibold text-ink/80">{tpl.tagline}</span>
                    <Link
                      to={`/cv-builder?template=${tpl.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-azure transition-all hover:text-azure-700 hover:underline"
                    >
                      {isHovered ? 'Use Template →' : 'Active Preview'}
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* =================================================================
         * 5 FLOATING MICRO CARDS AROUND RESUME STACK
         * Floating independently with glass blur, soft shadow, and subtle motion
         * ================================================================= */}

        {/* Micro Card 1: ATS Score 95% (Top-Left) */}
        <motion.div
          initial={false}
          animate={
            reduceMotion
              ? { opacity: 1, scale: 1 }
              : {
                  opacity: 1,
                  scale: 1,
                  y: [0, -10, 0],
                  x: [0, 4, 0],
                }
          }
          transition={{
            duration: 5.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="pointer-events-none absolute -left-6 sm:-left-12 top-6 z-50 flex items-center gap-2.5 rounded-xl border border-white/95 bg-white/95 px-3 py-2.5 shadow-[0_16px_36px_-6px_rgba(29,93,184,0.25),0_0_16px_rgba(79,193,230,0.35)] ring-1 ring-frost-300/80 backdrop-blur-xl"
        >
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600 shadow-xs">
            <CheckCircle2 className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">ATS Score</div>
            <div className="flex items-center gap-1.5 text-[14px] font-extrabold text-ink leading-none">
              95% <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9.5px] font-bold text-emerald-700">Top Tier</span>
            </div>
          </div>
        </motion.div>

        {/* Micro Card 2: AI Suggestions: 12 Improvements (Top-Right) */}
        <motion.div
          initial={false}
          animate={
            reduceMotion
              ? { opacity: 1, scale: 1 }
              : {
                  opacity: 1,
                  scale: 1,
                  y: [0, 10, 0],
                  x: [0, -5, 0],
                }
          }
          transition={{
            duration: 5.8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.4,
          }}
          className="pointer-events-none absolute -right-6 sm:-right-12 top-10 z-50 flex items-center gap-2.5 rounded-xl border border-white/95 bg-white/95 px-3 py-2.5 shadow-[0_16px_36px_-6px_rgba(79,193,230,0.3),0_0_16px_rgba(169,140,234,0.35)] ring-1 ring-frost-300/80 backdrop-blur-xl"
        >
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-50 text-cyan-600 shadow-xs">
            <Zap className="h-4.5 w-4.5 text-frost-600" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">AI Suggestions</div>
            <div className="text-[14px] font-extrabold text-ink leading-none">12 Improvements</div>
          </div>
        </motion.div>

        {/* Micro Card 3: Keyword Match: 92% (Bottom-Left) */}
        <motion.div
          initial={false}
          animate={
            reduceMotion
              ? { opacity: 1, scale: 1 }
              : {
                  opacity: 1,
                  scale: 1,
                  y: [0, -8, 0],
                  x: [0, -4, 0],
                }
          }
          transition={{
            duration: 6.2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.8,
          }}
          className="pointer-events-none absolute -left-5 sm:-left-10 bottom-12 z-50 flex items-center gap-2.5 rounded-xl border border-white/95 bg-white/95 px-3 py-2.5 shadow-[0_16px_36px_-6px_rgba(29,93,184,0.25),0_0_16px_rgba(79,193,230,0.35)] ring-1 ring-frost-300/80 backdrop-blur-xl"
        >
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-azure-50 text-azure-600 shadow-xs">
            <TrendingUp className="h-4.5 w-4.5 text-azure" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Keyword Match</div>
            <div className="flex items-center gap-1.5 text-[14px] font-extrabold text-ink leading-none">
              92% <span className="rounded-full bg-azure-50 px-1.5 py-0.5 text-[9.5px] font-bold text-azure-700">High Match</span>
            </div>
          </div>
        </motion.div>

        {/* Micro Card 4: JD Match: 98% · Ready to Apply (Bottom-Right) */}
        <motion.div
          initial={false}
          animate={
            reduceMotion
              ? { opacity: 1, scale: 1 }
              : {
                  opacity: 1,
                  scale: 1,
                  y: [0, 9, 0],
                  x: [0, 4, 0],
                }
          }
          transition={{
            duration: 5.4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.2,
          }}
          className="pointer-events-none absolute -right-5 sm:-right-10 bottom-14 z-50 flex items-center gap-2.5 rounded-xl border border-white/95 bg-white/95 px-3 py-2.5 shadow-[0_16px_36px_-6px_rgba(169,140,234,0.3),0_0_16px_rgba(79,193,230,0.35)] ring-1 ring-aurora-300/80 backdrop-blur-xl"
        >
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-purple-50 text-purple-600 shadow-xs">
            <FileCheck className="h-4.5 w-4.5 text-aurora-500" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">JD Match</div>
            <div className="text-[14px] font-extrabold text-ink leading-none">
              98% · <span className="text-purple-600 font-bold text-[11.5px]">Ready to Apply</span>
            </div>
          </div>
        </motion.div>

        {/* Micro Card 5: Resume Improved · Ready to Export (Top-Center Floating Badge) */}
        <motion.div
          initial={false}
          animate={
            reduceMotion
              ? { opacity: 1, y: 0 }
              : {
                  opacity: 1,
                  y: [0, -6, 0],
                }
          }
          transition={{
            duration: 4.6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1.0,
          }}
          className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full border border-white/95 bg-white/95 px-4 py-1.5 shadow-[0_12px_28px_-4px_rgba(29,93,184,0.22),0_0_14px_rgba(79,193,230,0.3)] ring-1 ring-frost-300/80 backdrop-blur-xl"
        >
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[11.5px] font-extrabold text-ink">Resume Improved · Ready to Export</span>
          <span className="rounded-full bg-gradient-to-r from-azure to-purple-600 px-2 py-0.5 text-[9.5px] font-extrabold text-white">
            ATS Passed
          </span>
        </motion.div>
      </div>
    </div>
  );
}

export default ResumeShowcase;