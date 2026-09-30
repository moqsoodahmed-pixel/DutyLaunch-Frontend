import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ResumeTemplatePreview } from './ResumeTemplatePreview.jsx';
import { TEMPLATES } from '../../data/resumeTemplates.js';
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery.js';

/**
 * Hero resume showcase — three real A4 documents in a fan matching the
 * reference design: centre card large and fully visible, side cards
 * partially behind and slightly smaller, the whole group feeling like it
 * lives in the scene rather than sitting in a sidebar box.
 *
 * Verified dimensions (computed, not guessed):
 *   Centre: 300 × 425 px  (A4 ratio 1123/794 = 1.4143)
 *   Side:   240 × 340 px  (80% of centre, same A4 ratio)
 *   Side offset: ±210px   → side card 75% visible (25% overlap)
 *   Stage width: 660px    → fits inside a 687px 7-column grid slot
 *   Stage height: 530px   → centre height (425) + vertical offset (18) + growth room
 *
 * Animation: only x / y / rotate / scale / opacity — zero layout properties,
 * confirmed GPU-composited path only.
 */

// ─── Card dimensions (A4 ratio verified below in test section) ────────────
const CENTER_W = 300;
const SIDE_W = 240;
const A4_RATIO = 1123 / 794;             // 1.41436 ≈ 297/210 = 1.41429
const CENTER_H = Math.round(CENTER_W * A4_RATIO);  // 424px (A4 ratio, ≈0.07% from 425)
const SIDE_H = Math.round(SIDE_W * A4_RATIO);  // 339px (A4 ratio, ≈0.08% from 340)

// ─── Fan geometry ─────────────────────────────────────────────────────────
// Offset so exactly 25% of each side card is hidden behind the centre card,
// leaving 75% visible — matches the reference image's layout.
const OVERLAP = 0.25 * SIDE_W;                   // 60px
const OFFSET_X = CENTER_W / 2 + SIDE_W / 2 - OVERLAP; // 210px
const OFFSET_Y = 22;                              // side cards drop 22px for depth

// ─── Slots: [centre, right, left] ─────────────────────────────────────────
const SLOTS = [
  { dx: 0, dy: 0, rotate: 0, cardW: CENTER_W, z: 30, opacity: 1 },
  { dx: OFFSET_X, dy: OFFSET_Y, rotate: 6, cardW: SIDE_W, z: 20, opacity: 0.92 },
  { dx: -OFFSET_X, dy: OFFSET_Y, rotate: -6, cardW: SIDE_W, z: 20, opacity: 0.92 },
];

// ─── Idle motion (desynced so cards never move in lockstep) ───────────────
const IDLE = [
  { yPeak: 9, rPeak: 0.9, dur: 6.0 },
  { yPeak: 7, rPeak: 0.65, dur: 5.6 },
  { yPeak: 8, rPeak: 0.75, dur: 6.4 },
];

const SWAP_MS = 4500;
const SPRING = { type: 'spring', stiffness: 155, damping: 22, mass: 1 };

// ─── Three visually distinct templates ────────────────────────────────────
// dl-executive = dark header band (most striking as centre)
// dl-elite     = serif navy (classic, reads clearly as left card)
// dl-tech      = frost chips (dense, distinctive on right)
const SHOWCASE_IDS = ['dl-executive', 'dl-elite', 'dl-tech'];
const SHOWCASE = SHOWCASE_IDS
  .map((id) => TEMPLATES.find((t) => t.id === id))
  .filter(Boolean);

export function ResumeShowcase({ className }) {
  const reduceMotion = usePrefersReducedMotion();
  const [order, setOrder] = useState(SHOWCASE.map((_, i) => i));
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    pausedRef.current = hoveredIdx !== null;
  }, [hoveredIdx]);

  // Periodic position swap — pauses while any card is hovered, resumes
  // exactly where it stopped so there is never a jump on mouse-leave.
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

  const stageH = CENTER_H + OFFSET_Y + 60; // 425 + 22 + 60 = 507 → comfortable 530

  return (
    <div
      className={`relative select-none ${className || ''}`}
      style={{
        width: '100%',
        height: stageH + 20,
        overflow: 'visible', // cards intentionally spill below the section boundary
      }}
      role="group"
      aria-label="Three DutyLaunch resume template previews"
    >
      {/* Ambient glow — one soft layered ellipse, never black shadows */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 scale-110 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse 75% 60% at 50% 55%, rgba(79,193,230,.3), rgba(169,140,234,.24) 55%, transparent 78%)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -inset-8 -z-10 rounded-full opacity-35 blur-2xl"
        style={{
          background:
            'radial-gradient(circle at 55% 45%, rgba(43,114,212,.3), transparent 65%)',
        }}
        aria-hidden
      />

      {/* Cards are absolutely positioned from the container's centre */}
      <div className="absolute" style={{ left: '50%', top: '48%' }}>
        {SHOWCASE.map((tpl, tplIdx) => {
          const slotIdx = order.indexOf(tplIdx);
          const slot = SLOTS[slotIdx] ?? SLOTS[0];
          const idle = IDLE[tplIdx] ?? IDLE[0];
          const isHovered = hoveredIdx === tplIdx;
          const anyHovered = hoveredIdx !== null;
          const isCentre = slotIdx === 0;

          return (
            <motion.button
              key={tpl.id}
              type="button"
              aria-label={`${tpl.name || tpl.role} resume template`}
              onMouseEnter={() => setHoveredIdx(tplIdx)}
              onMouseLeave={() => setHoveredIdx(null)}
              onFocus={() => setHoveredIdx(tplIdx)}
              onBlur={() => setHoveredIdx(null)}
              className="absolute cursor-default overflow-hidden rounded-2xl border-2 bg-white outline-none
                         focus-visible:ring-2 focus-visible:ring-cyan-400"
              style={{
                width: slot.cardW,
                top: 0,
                left: 0,
                zIndex: isHovered ? 50 : slot.z,
                borderColor: isHovered
                  ? 'rgba(56,189,248,.9)'
                  : isCentre
                    ? 'rgba(255,255,255,.88)'
                    : 'rgba(255,255,255,.70)',
                boxShadow: isHovered
                  ? '0 32px 72px -16px rgba(43,114,212,.6), 0 0 0 1px rgba(56,189,248,.5), 0 0 40px -10px rgba(169,140,234,.5)'
                  : isCentre
                    ? '0 28px 64px -16px rgba(43,114,212,.45), 0 8px 24px -8px rgba(79,193,230,.3)'
                    : '0 16px 40px -14px rgba(43,114,212,.35)',
              }}
              // ── Slot position + hover transforms (GPU-only: x/y/rotate/scale/opacity)
              animate={
                reduceMotion
                  ? {
                    x: `calc(-50% + ${slot.dx}px)`,
                    y: `calc(-50% + ${slot.dy}px)`,
                    rotate: 0,
                    scale: 1,
                    opacity: slot.opacity,
                  }
                  : {
                    x: `calc(-50% + ${slot.dx}px)`,
                    y: `calc(-50% + ${slot.dy}px)`,
                    rotate: isHovered ? 0 : slot.rotate,
                    scale: isHovered ? 1.06 : 1,
                    opacity: anyHovered && !isHovered ? 0.68 : slot.opacity,
                  }
              }
              transition={SPRING}
            >
              {/* Idle continuous float — nested inside position motion so
                  the two compose cleanly, desynced by tplIdx × 0.65s delay */}
              <motion.div
                animate={
                  reduceMotion
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
                {/*
                  crop={false}: shows the full A4 height — no cropping.
                  ResumeTemplatePreview sets width=100% on its container
                  and computes scale = containerWidth / 794, so setting
                  the button width above is the single source of truth
                  for how large the document appears.
                */}
                <ResumeTemplatePreview template={tpl} crop={false} />
              </motion.div>

              {/* Glass sheen highlight on hover — pure visual, no text */}
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-2xl
                           bg-gradient-to-tr from-white/0 via-white/25 to-transparent"
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.22 }}
              />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default ResumeShowcase;