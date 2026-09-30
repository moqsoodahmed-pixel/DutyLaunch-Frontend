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
  Target,
  Download,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResumeTemplatePreview } from './ResumeTemplatePreview.jsx';
import { TEMPLATES } from '../../data/resumeTemplates.js';
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery.js';

// Smooth rotation interval
const ROTATE_INTERVAL_MS = 2900;

// All 7 flagship DutyLaunch templates representing diverse industries and layouts
const SHOWCASE_TEMPLATES = [
  TEMPLATES.find((t) => t.id === 'dl-elite') || TEMPLATES[0],
  TEMPLATES.find((t) => t.id === 'dl-tech') || TEMPLATES[1],
  TEMPLATES.find((t) => t.id === 'dl-professional') || TEMPLATES[2],
  TEMPLATES.find((t) => t.id === 'dl-finance') || TEMPLATES[3],
  TEMPLATES.find((t) => t.id === 'dl-executive') || TEMPLATES[4],
  TEMPLATES.find((t) => t.id === 'dl-creative') || TEMPLATES[5] || TEMPLATES[0],
  TEMPLATES.find((t) => t.id === 'dl-modern') || TEMPLATES[6] || TEMPLATES[1],
];

/* 7 Spatial 3D slots arranged in an orbital perspective arc:
 * Slot 0: Center front — 0° tilt, scale 1.0, maximum clarity & prominence (zIndex: 40)
 * Slot 1: Right 1      — +8° tilt, x: +120, y: 10, scale: 0.88 (zIndex: 30)
 * Slot 2: Right 2      — +14° tilt, x: +210, y: 22, scale: 0.76 (zIndex: 20)
 * Slot 3: Back Right   — +6° tilt, x: +90, y: -16, scale: 0.65, blur: 2.5px (zIndex: 10)
 * Slot 4: Back Left    — -6° tilt, x: -90, y: -16, scale: 0.65, blur: 2.5px (zIndex: 10)
 * Slot 5: Left 2       — -14° tilt, x: -210, y: 22, scale: 0.76 (zIndex: 20)
 * Slot 6: Left 1       — -8° tilt, x: -120, y: 10, scale: 0.88 (zIndex: 30)
 */
const DESKTOP_SLOTS = [
  { x: 0, y: -4, rotateY: 0, rotateZ: 0, scale: 1.0, zIndex: 40, blur: 0, opacity: 1 },
  { x: 124, y: 10, rotateY: -8, rotateZ: 9, scale: 0.88, zIndex: 30, blur: 0.6, opacity: 0.94 },
  { x: 215, y: 24, rotateY: -14, rotateZ: 14, scale: 0.76, zIndex: 20, blur: 2.0, opacity: 0.78 },
  { x: 95, y: -18, rotateY: -4, rotateZ: 5, scale: 0.65, zIndex: 10, blur: 3.2, opacity: 0.45 },
  { x: -95, y: -18, rotateY: 4, rotateZ: -5, scale: 0.65, zIndex: 10, blur: 3.2, opacity: 0.45 },
  { x: -215, y: 24, rotateY: 14, rotateZ: -14, scale: 0.76, zIndex: 20, blur: 2.0, opacity: 0.78 },
  { x: -124, y: 10, rotateY: 8, rotateZ: -9, scale: 0.88, zIndex: 30, blur: 0.6, opacity: 0.94 },
];

const MOBILE_SLOTS = [
  { x: 0, y: -4, rotateY: 0, rotateZ: 0, scale: 0.95, zIndex: 40, blur: 0, opacity: 1 },
  { x: 55, y: 8, rotateY: -5, rotateZ: 6, scale: 0.82, zIndex: 30, blur: 0.8, opacity: 0.9 },
  { x: 95, y: 18, rotateY: -10, rotateZ: 10, scale: 0.68, zIndex: 20, blur: 2.0, opacity: 0.65 },
  { x: 40, y: -12, rotateY: -2, rotateZ: 3, scale: 0.55, zIndex: 10, blur: 3.0, opacity: 0.35 },
  { x: -40, y: -12, rotateY: 2, rotateZ: -3, scale: 0.55, zIndex: 10, blur: 3.0, opacity: 0.35 },
  { x: -95, y: 18, rotateY: 10, rotateZ: -10, scale: 0.68, zIndex: 20, blur: 2.0, opacity: 0.65 },
  { x: -55, y: 8, rotateY: 5, rotateZ: -6, scale: 0.82, zIndex: 30, blur: 0.8, opacity: 0.9 },
];

const SOFT_SPRING = { type: 'spring', stiffness: 160, damping: 22, mass: 0.9 };

export function ResumeShowcase({ className }) {
  const reduceMotion = usePrefersReducedMotion();
  const [order, setOrder] = useState([0, 1, 2, 3, 4, 5, 6]);
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

  // Continuous seamless automatic rotation
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
    setMouseOffset({ x: x * 16, y: y * 12 });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
    setHoveredIdx(null);
    isPausedRef.current = false;
  };

  const slots = isMobile ? MOBILE_SLOTS : DESKTOP_SLOTS;

  return (
    <div
      className={`relative mx-auto flex w-full max-w-[42rem] items-center justify-center py-1 lg:py-2 select-none ${className || ''}`}
      style={{ perspective: 1900 }}
      role="region"
      aria-label="Interactive 3D DutyLaunch Resume Showcase"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── AMBIENT MULTI-LAYER GLOW MESH BEHIND RESUMES ── */}
      <div
        className="pointer-events-none absolute -inset-10 -z-10 rounded-full opacity-70 blur-3xl transition-opacity duration-700"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(79, 193, 230, 0.38), rgba(43, 114, 212, 0.3), rgba(169, 140, 234, 0.28) 55%, transparent 75%)',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -inset-4 -z-10 rounded-full opacity-50 blur-2xl"
        style={{
          background:
            'radial-gradient(circle at 60% 40%, rgba(169, 140, 234, 0.35), rgba(79, 193, 230, 0.25) 45%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Floating 3D Showcase Stage with Compact Proportions */}
      <div className="relative flex h-[26rem] w-full items-center justify-center sm:h-[29rem] md:h-[31rem]">
        {/* =================================================================
         * 7 ROTATING RESUME STACK LAYERS
         * ================================================================= */}
        {SHOWCASE_TEMPLATES.map((tpl, tplIndex) => {
          const slotIndex = order.indexOf(tplIndex);
          const slot = slots[slotIndex] ?? slots[0];
          const isHovered = hoveredIdx === tplIndex;
          const isAnyHovered = hoveredIdx !== null;
          const isFront = slotIndex === 0;

          // Parallax tilt adjustment
          const parallaxX = isHovered
            ? mouseOffset.x * 0.35
            : slot.x + (isFront ? mouseOffset.x * 0.18 : mouseOffset.x * 0.08);
          const parallaxY = isHovered
            ? -16 + mouseOffset.y * 0.35
            : slot.y + (isFront ? mouseOffset.y * 0.18 : mouseOffset.y * 0.08);
          const parallaxRotateY = isHovered
            ? mouseOffset.x * 0.3
            : slot.rotateY + (isFront ? mouseOffset.x * 0.2 : 0);
          const parallaxRotateZ = isHovered ? mouseOffset.x * 0.06 : slot.rotateZ;

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
                width: isMobile ? '13.5rem' : '16.5rem',
                zIndex: isHovered ? 50 : slot.zIndex,
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
                      scale: isHovered ? 1.05 : slot.scale,
                      opacity: isAnyHovered && !isHovered ? 0.42 : slot.opacity,
                      filter: `blur(${isHovered ? 0 : slot.blur}px)`,
                    }
              }
              transition={SOFT_SPRING}
            >
              {/* Card Shell with Continuous Travelling Border Glow */}
              <div
                className={`group relative overflow-hidden rounded-2xl p-[1.5px] transition-all duration-300 ${
                  isHovered
                    ? 'shadow-[0_32px_80px_-15px_rgba(43,114,212,0.48),0_0_28px_rgba(169,140,234,0.42)]'
                    : isFront
                    ? 'shadow-crystal-lg'
                    : 'shadow-crystal'
                }`}
              >
                {/* Edge Light Traveling Beam */}
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
                  {/* Glossy Sheen overlay on hover */}
                  <div
                    className={`pointer-events-none absolute inset-0 z-20 bg-gradient-to-tr from-white/0 via-white/40 to-transparent transition-opacity duration-500 ${
                      isHovered ? 'opacity-100' : 'opacity-0'
                    }`}
                  />

                  {/* Top Badge Rail */}
                  <div className="flex items-center justify-between border-b border-glacier-300/80 bg-glacier-50/90 px-3 py-2 backdrop-blur-md">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-frost-500 animate-pulse" />
                      <span className="truncate text-[11.5px] font-bold text-ink">{tpl.name}</span>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-azure-50/90 px-2 py-0.5 text-[9.5px] font-semibold text-azure-700">
                      <ShieldCheck className="h-2.5 w-2.5 text-azure-600" aria-hidden />
                      ATS Ready
                    </span>
                  </div>

                  {/* Realistic Scaled Document Preview (Zero Placeholders, 100% Vector/DOM) */}
                  <div className="relative overflow-hidden bg-white p-0">
                    <ResumeTemplatePreview template={tpl} crop={true} />
                  </div>

                  {/* Bottom Action Rail */}
                  <div
                    className={`flex items-center justify-between border-t border-glacier-300/70 bg-white/95 px-3 py-1.5 text-caption transition-colors duration-200 ${
                      isHovered ? 'bg-frost-50/90 text-azure-700' : 'text-slate-500'
                    }`}
                  >
                    <span className="truncate text-[10.5px] font-semibold text-ink/80">{tpl.tagline}</span>
                    <Link
                      to={`/cv-builder?template=${tpl.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex shrink-0 items-center gap-0.5 text-[10.5px] font-bold text-azure transition-all hover:text-azure-700 hover:underline"
                    >
                      {isHovered ? 'Use Template →' : 'Preview'}
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* =================================================================
         * 7 FLOATING GLASS INFO CARDS (ATS 95%, Keyword Match, AI Suggestions, etc.)
         * Soft floating bounce, glassmorphism, blur, glow
         * ================================================================= */}

        {/* 1. ATS Score 95% (Top-Left) */}
        <motion.div
          initial={false}
          animate={
            reduceMotion
              ? { opacity: 1, scale: 1 }
              : {
                  opacity: 1,
                  scale: 1,
                  y: [0, -8, 0],
                  x: [0, 3, 0],
                }
          }
          transition={{
            duration: 5.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="pointer-events-none absolute -left-4 sm:-left-10 top-4 z-50 flex items-center gap-2 rounded-xl border border-cyan-400/35 bg-[#0B172B]/85 px-3 py-2 shadow-[0_14px_35px_rgba(0,0,0,0.6),0_0_16px_rgba(56,189,248,0.25)] ring-1 ring-cyan-500/20 backdrop-blur-xl"
        >
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-950/70 border border-emerald-400/40 text-emerald-400 shadow-xs">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[9.5px] font-bold uppercase tracking-wider text-cyan-300/80">ATS Score</div>
            <div className="flex items-center gap-1.5 text-[13px] font-extrabold text-white leading-none">
              95% <span className="rounded-full bg-emerald-950/70 border border-emerald-400/40 px-1 py-0.5 text-[8.5px] font-bold text-emerald-300">Top Tier</span>
            </div>
          </div>
        </motion.div>

        {/* 2. AI Suggestions: 14 Instant Fixes (Top-Right) */}
        <motion.div
          initial={false}
          animate={
            reduceMotion
              ? { opacity: 1, scale: 1 }
              : {
                  opacity: 1,
                  scale: 1,
                  y: [0, 8, 0],
                  x: [0, -4, 0],
                }
          }
          transition={{
            duration: 5.6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.3,
          }}
          className="pointer-events-none absolute -right-4 sm:-right-10 top-6 z-50 flex items-center gap-2 rounded-xl border border-cyan-400/35 bg-[#0B172B]/85 px-3 py-2 shadow-[0_14px_35px_rgba(0,0,0,0.6),0_0_16px_rgba(56,189,248,0.25)] ring-1 ring-cyan-500/20 backdrop-blur-xl"
        >
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 shadow-xs">
            <Zap className="h-4 w-4 text-cyan-300" />
          </div>
          <div>
            <div className="text-[9.5px] font-bold uppercase tracking-wider text-cyan-300/80">AI Suggestions</div>
            <div className="text-[13px] font-extrabold text-white leading-none">14 Instant Fixes</div>
          </div>
        </motion.div>

        {/* 3. Keyword Match: 96% (Mid-Left) */}
        <motion.div
          initial={false}
          animate={
            reduceMotion
              ? { opacity: 1, scale: 1 }
              : {
                  opacity: 1,
                  scale: 1,
                  y: [0, -6, 0],
                  x: [0, -3, 0],
                }
          }
          transition={{
            duration: 6.0,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.6,
          }}
          className="pointer-events-none absolute -left-3 sm:-left-8 top-1/2 -translate-y-1/2 z-50 flex items-center gap-2 rounded-xl border border-cyan-400/35 bg-[#0B172B]/85 px-3 py-2 shadow-[0_14px_35px_rgba(0,0,0,0.6),0_0_16px_rgba(56,189,248,0.25)] ring-1 ring-cyan-500/20 backdrop-blur-xl"
        >
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-azure-950/70 border border-azure-400/40 text-cyan-300 shadow-xs">
            <TrendingUp className="h-4 w-4 text-cyan-300" />
          </div>
          <div>
            <div className="text-[9.5px] font-bold uppercase tracking-wider text-cyan-300/80">Keyword Match</div>
            <div className="flex items-center gap-1.5 text-[13px] font-extrabold text-white leading-none">
              96% <span className="rounded-full bg-azure-950/70 border border-azure-400/40 px-1 py-0.5 text-[8.5px] font-bold text-cyan-300">Matched</span>
            </div>
          </div>
        </motion.div>

        {/* 4. JD Match: 98% · Ready To Apply (Bottom-Right) */}
        <motion.div
          initial={false}
          animate={
            reduceMotion
              ? { opacity: 1, scale: 1 }
              : {
                  opacity: 1,
                  scale: 1,
                  y: [0, 7, 0],
                  x: [0, 3, 0],
                }
          }
          transition={{
            duration: 5.3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.2,
          }}
          className="pointer-events-none absolute -right-3 sm:-right-8 bottom-10 z-50 flex items-center gap-2 rounded-xl border border-cyan-400/35 bg-[#0B172B]/85 px-3 py-2 shadow-[0_14px_35px_rgba(0,0,0,0.6),0_0_16px_rgba(169,140,234,0.25)] ring-1 ring-purple-500/20 backdrop-blur-xl"
        >
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-purple-950/70 border border-purple-400/40 text-purple-300 shadow-xs">
            <FileCheck className="h-4 w-4 text-purple-300" />
          </div>
          <div>
            <div className="text-[9.5px] font-bold uppercase tracking-wider text-cyan-300/80">JD Match</div>
            <div className="text-[13px] font-extrabold text-white leading-none">
              98% · <span className="text-purple-300 font-bold text-[10.5px]">Ready To Apply</span>
            </div>
          </div>
        </motion.div>

        {/* 5. Resume Improved (Bottom-Left) */}
        <motion.div
          initial={false}
          animate={
            reduceMotion
              ? { opacity: 1, scale: 1 }
              : {
                  opacity: 1,
                  scale: 1,
                  y: [0, -7, 0],
                  x: [0, 2, 0],
                }
          }
          transition={{
            duration: 6.4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.8,
          }}
          className="pointer-events-none absolute -left-2 sm:-left-6 bottom-8 z-50 flex items-center gap-2 rounded-xl border border-cyan-400/35 bg-[#0B172B]/85 px-3 py-2 shadow-[0_14px_35px_rgba(0,0,0,0.6),0_0_16px_rgba(56,189,248,0.25)] ring-1 ring-cyan-500/20 backdrop-blur-xl"
        >
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-950/70 border border-emerald-400/40 text-emerald-400 shadow-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-[9.5px] font-bold uppercase tracking-wider text-cyan-300/80">Resume Improved</div>
            <div className="text-[12.5px] font-bold text-white leading-none">Recruiter Verified</div>
          </div>
        </motion.div>

        {/* 6. Ready To Apply Badge (Mid-Right) */}
        <motion.div
          initial={false}
          animate={
            reduceMotion
              ? { opacity: 1, scale: 1 }
              : {
                  opacity: 1,
                  scale: 1,
                  y: [0, -6, 0],
                  x: [0, 4, 0],
                }
          }
          transition={{
            duration: 5.7,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
          className="pointer-events-none absolute -right-2 sm:-right-6 top-1/2 -translate-y-1/2 z-50 flex items-center gap-2 rounded-xl border border-cyan-400/35 bg-[#0B172B]/85 px-3 py-2 shadow-[0_14px_35px_rgba(0,0,0,0.6),0_0_16px_rgba(56,189,248,0.25)] ring-1 ring-cyan-500/20 backdrop-blur-xl"
        >
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 shadow-xs">
            <Target className="h-4 w-4 text-cyan-300" />
          </div>
          <div>
            <div className="text-[9.5px] font-bold uppercase tracking-wider text-cyan-300/80">Target Role</div>
            <div className="text-[12.5px] font-bold text-white leading-none">Ready To Apply</div>
          </div>
        </motion.div>

        {/* 7. Export Ready · 1-Click PDF (Top-Center Floating Badge) */}
        <motion.div
          initial={false}
          animate={
            reduceMotion
              ? { opacity: 1, y: 0 }
              : {
                  opacity: 1,
                  y: [0, -5, 0],
                }
          }
          transition={{
            duration: 4.8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.9,
          }}
          className="pointer-events-none absolute -top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full border border-cyan-400/35 bg-[#0B172B]/85 px-4 py-1.5 shadow-[0_14px_35px_rgba(0,0,0,0.6),0_0_18px_rgba(56,189,248,0.3)] ring-1 ring-cyan-500/20 backdrop-blur-xl"
        >
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[11px] font-extrabold text-white">Export Ready</span>
          <span className="rounded-full bg-gradient-to-r from-azure to-purple-600 px-2 py-0.5 text-[9px] font-extrabold text-white shadow-xs">
            ATS Passed
          </span>
        </motion.div>
      </div>
    </div>
  );
}

export default ResumeShowcase;