import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { ResumeTemplatePreview } from './ResumeTemplatePreview.jsx';
import { TEMPLATES } from '../../data/resumeTemplates.js';
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery.js';
import { useContentProtection } from '../../hooks/useContentProtection.js';

/**
 * Hero resume showcase — three real A4 documents in a fan matching the
 * reference design: centre card large and fully visible, side cards
 * partially behind and slightly smaller, the whole group feeling like it
 * lives in the scene rather than sitting in a sidebar box.
 *
 * Responsive across Mobile, Tablet, and Desktop with dynamic scale origin.
 * Anti-screenshot and right-click content protection enabled.
 */

// ─── Card dimensions (A4 ratio) ──────────────────────────────────────────
const CENTER_W = 320;
const A4_RATIO = 1123 / 794;
const CENTER_H = Math.round(CENTER_W * A4_RATIO);

// ─── Fan geometry ─────────────────────────────────────────────────────────
const OFFSET_X = 195;
const OFFSET_Y = 16;

// ─── Slots: [centre, right, left] ─────────────────────────────────────────
const SLOTS = [
  { dx: 0, dy: 0, rotate: 0, z: 40 },
  { dx: OFFSET_X, dy: OFFSET_Y, rotate: 5.5, z: 20 },
  { dx: -OFFSET_X, dy: OFFSET_Y, rotate: -5.5, z: 20 },
];

// ─── Idle motion (desynced so cards float gently) ─────────────────────────
const IDLE = [
  { yPeak: 7, rPeak: 0.7, dur: 6.0 },
  { yPeak: 5, rPeak: 0.5, dur: 5.6 },
  { yPeak: 6, rPeak: 0.6, dur: 6.4 },
];

const SWAP_MS = 6000;
const EASE_CUBIC = [0.16, 1, 0.3, 1];
const TRANSITION = { duration: 0.36, ease: EASE_CUBIC };

// ─── Three visually distinct templates ────────────────────────────────────
const SHOWCASE_IDS = ['dl-executive', 'dl-elite', 'dl-tech'];
const SHOWCASE = SHOWCASE_IDS
  .map((id) => TEMPLATES.find((t) => t.id === id))
  .filter(Boolean);

export function ResumeShowcase({ className }) {
  const reduceMotion = usePrefersReducedMotion();
  const [order, setOrder] = useState(SHOWCASE.map((_, i) => i));
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const pausedRef = useRef(false);
  const { isWindowBlurred } = useContentProtection();

  const anyHovered = hoveredIdx !== null;

  const [stageScale, setStageScale] = useState(1);
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 400) setStageScale(0.58);
      else if (w < 500) setStageScale(0.68);
      else if (w < 640) setStageScale(0.78);
      else if (w < 1024) setStageScale(0.86);
      else setStageScale(1);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    pausedRef.current = hoveredIdx !== null;
  }, [hoveredIdx]);

  // Periodic position swap — pauses while any card is hovered
  useEffect(() => {
    if (reduceMotion || SHOWCASE.length < 2) return undefined;
    const id = setInterval(() => {
      if (!pausedRef.current) {
        setOrder((prev) => {
          const next = [...prev];
          next.unshift(next.pop());
          return next;
        });
      }
    }, SWAP_MS);
    return () => clearInterval(id);
  }, [reduceMotion]);

  if (!SHOWCASE.length) return null;

  const stageH = Math.round((CENTER_H + OFFSET_Y + 60) * (stageScale < 1 ? stageScale * 1.05 : 1));

  const bringToCenter = (targetTplIdx) => {
    setOrder((prev) => {
      if (prev[0] === targetTplIdx) return prev;
      const targetPos = prev.indexOf(targetTplIdx);
      if (targetPos === -1) return prev;
      const next = [...prev];
      const oldCenter = next[0];
      next[0] = targetTplIdx;
      next[targetPos] = oldCenter;
      return next;
    });
  };

  return (
    <div
      data-resume-protect="true"
      onContextMenu={(e) => e.preventDefault()}
      className={`relative select-none dl-protected-preview ${className || ''}`}
      style={{
        width: '100%',
        height: stageH + 16,
        overflow: 'visible',
      }}
      role="group"
      aria-label="Interactive DutyLaunch resume previews"
    >
      {/* Ambient depth glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 scale-110 rounded-full opacity-65 blur-3xl transition-opacity duration-500"
        style={{
          background:
            'radial-gradient(ellipse 75% 60% at 50% 55%, rgba(79,193,230,.32), rgba(169,140,234,.26) 55%, transparent 78%)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -inset-8 -z-10 rounded-full opacity-40 blur-2xl"
        style={{
          background:
            'radial-gradient(circle at 55% 45%, rgba(43,114,212,.35), transparent 65%)',
        }}
        aria-hidden
      />

      {/* Cards are positioned from stage center with responsive scaling */}
      <div
        className="absolute transition-transform duration-300"
        style={{
          left: '50%',
          top: '48%',
          transform: `scale(${stageScale})`,
          transformOrigin: 'center center',
        }}
      >
        {SHOWCASE.map((tpl, tplIdx) => {
          const slotIdx = order.indexOf(tplIdx);
          const slot = SLOTS[slotIdx] ?? SLOTS[0];
          const idle = IDLE[tplIdx] ?? IDLE[0];
          const isHovered = hoveredIdx === tplIdx;
          const isCentre = slotIdx === 0;

          let targetX = slot.dx;
          let targetY = slot.dy;
          let targetRotate = slot.rotate;
          let targetScale = isCentre ? (isHovered ? 1.08 : 1.04) : (isHovered ? 0.98 : 0.92);
          let targetOpacity = 1;
          let targetZ = isCentre ? (isHovered ? 60 : 40) : (isHovered ? 35 : slot.z);

          if (isHovered && !isCentre) {
            targetY = slot.dy - 8;
          }

          const elevationShadow = isCentre
            ? '0 28px 65px -12px rgba(0,0,0,0.5), 0 0 0 1.5px rgba(56,189,248,0.7), 0 0 24px rgba(56,189,248,0.35)'
            : '0 16px 40px -12px rgba(15,28,46,0.35), 0 4px 12px -4px rgba(15,28,46,0.2), 0 0 0 1px rgba(255,255,255,0.75)';

          return (
            <motion.button
              key={tpl.id}
              type="button"
              onMouseEnter={() => {
                setHoveredIdx(tplIdx);
                bringToCenter(tplIdx);
              }}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => bringToCenter(tplIdx)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: CENTER_W,
                aspectRatio: '794 / 1123',
                zIndex: targetZ,
                boxShadow: elevationShadow,
                borderRadius: 4,
                overflow: 'hidden',
                background: '#FFFFFF',
                cursor: 'pointer',
                outline: 'none',
                willChange: 'transform, opacity',
              }}
              animate={
                reduceMotion
                  ? {
                    x: `calc(-50% + ${targetX}px)`,
                    y: `calc(-50% + ${targetY}px)`,
                    rotate: 0,
                    scale: 1,
                    opacity: targetOpacity,
                  }
                  : {
                    x: `calc(-50% + ${targetX}px)`,
                    y: `calc(-50% + ${targetY}px)`,
                    rotate: targetRotate,
                    scale: targetScale,
                    opacity: targetOpacity,
                  }
              }
              transition={TRANSITION}
            >
              {/* Idle floating when not hovered */}
              <motion.div
                animate={
                  reduceMotion || anyHovered
                    ? undefined
                    : {
                      y: [0, -idle.yPeak, 0, idle.yPeak * 0.7, 0],
                      rotate: [0, idle.rPeak, 0, -idle.rPeak, 0],
                    }
                }
                transition={{
                  duration: idle.dur,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  times: [0, 0.25, 0.5, 0.75, 1],
                  delay: tplIdx * 0.65,
                }}
                style={{ width: '100%' }}
              >
                <ResumeTemplatePreview template={tpl} crop={false} />
              </motion.div>

              {/* Glass sheen highlight on hover */}
              <motion.div
                className="pointer-events-none absolute inset-0 rounded bg-gradient-to-tr from-white/0 via-white/20 to-transparent"
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.2 }}
              />

              {/* Privacy Shield on Window Blur / Screen capture */}
              {isWindowBlurred && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/85 p-3 text-center backdrop-blur-md">
                  <ShieldCheck className="h-6 w-6 text-cyan-400 mb-1" />
                  <p className="text-[11px] font-bold text-white">Content Protected</p>
                  <p className="text-[9.5px] text-slate-400">Return to window to view</p>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default ResumeShowcase;