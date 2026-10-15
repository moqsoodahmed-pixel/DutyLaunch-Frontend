import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check } from 'lucide-react';
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery.js';

const ease = [0.16, 0.84, 0.44, 1];

// Anchored by their right edge so a tag can overlap the resume but can never
// run past the illustration's box, whatever width it is rendered at.
const TAGS = [
  { label: 'ATS Compatibility', right: '3%', top: '43%' },
  { label: 'Skills Match', right: '0%', top: '56%' },
  { label: 'Resume Analysis', right: '5%', top: '69%' },
];

/* The one scoped stylesheet for this illustration. Every selector is
   prefixed `atsv-`, so nothing here can leak into another component.
   Continuous motion (float, orbit, shine) is plain CSS transform — no JS per
   frame. The scan beam and the entrance sequence are one-shot. */
const CSS = `
.atsv{position:relative;isolation:isolate;overflow:hidden;width:100%;aspect-ratio:6/5;container-type:inline-size}
.atsv-glow{position:absolute;inset:0;z-index:-1;background:
  radial-gradient(closest-side at 66% 32%,rgba(79,193,230,.30),rgba(79,193,230,0)),
  radial-gradient(closest-side at 26% 72%,rgba(169,140,234,.24),rgba(169,140,234,0))}
.atsv-abs{position:absolute}
.atsv-tilt{position:absolute;inset:0;transform:perspective(760px) rotateY(-14deg) rotateX(5deg) rotateZ(-1.2deg);transform-origin:22% 50%}
.atsv-sheet{position:absolute;inset:0;overflow:hidden;background:#fff;border:1px solid #D7E4F3;border-radius:12px;
  box-shadow:0 1px 2px rgba(18,33,58,.06),0 14px 26px -10px rgba(37,87,201,.22),0 32px 48px -22px rgba(18,33,58,.30)}
.atsv-sheet--back{background:#EEF4FB;box-shadow:0 10px 24px -12px rgba(37,87,201,.25)}
.atsv-body{display:flex;flex-direction:column;padding:7% 7% 0}
.atsv-head{display:flex;align-items:center;gap:6%}
.atsv-avatar{width:15%;aspect-ratio:1;border-radius:50%;flex:none;background:linear-gradient(135deg,#4FC1E6,#2557C9 60%,#A98CEA)}
.atsv-bar{display:block;height:.34rem;border-radius:999px;background:#D7E4F3}
.atsv-bar--dark{height:.44rem;background:#12213A;opacity:.86}
.atsv-bar--blue{background:#2557C9;opacity:.85}
.atsv-block{margin-top:.8rem}
.atsv-row{display:flex;align-items:center;gap:.4rem;margin-bottom:.45rem}
.atsv-line{display:block;height:.3rem;border-radius:999px;background:#E6EEF8;margin-bottom:.34rem}
.atsv-chips{display:flex;gap:4%;margin-bottom:.4rem}
.atsv-chip{display:block;height:.55rem;border-radius:999px;background:#DBEAFE}
.atsv-check{display:grid;place-items:center;flex:none;width:.95rem;height:.95rem;border-radius:50%;background:#13B981;color:#fff}
.atsv-beam{position:absolute;left:0;right:0;top:0;height:15%;opacity:0;pointer-events:none;
  background:linear-gradient(to bottom,rgba(79,193,230,0),rgba(79,193,230,.22) 70%,rgba(79,193,230,.55));
  border-bottom:2px solid rgba(79,193,230,.95);box-shadow:0 6px 14px -2px rgba(79,193,230,.55)}
.atsv[data-play="true"] .atsv-beam{animation:atsv-scan 1.7s 1.15s cubic-bezier(.45,.05,.4,.95) both}
.atsv-orbfloat{position:absolute;inset:0;animation:atsv-float 6.5s ease-in-out infinite}
.atsv-orb{position:absolute;inset:0;overflow:hidden;border-radius:50%;
  background:radial-gradient(circle at 31% 25%,#fff 0,rgba(255,255,255,0) 9%),
    radial-gradient(circle at 34% 30%,#7DD3EF 0,#4FC1E6 18%,#2B72D4 50%,#2557C9 72%,#6A4FD6 100%);
  box-shadow:inset -5px -7px 12px rgba(80,50,200,.5),inset 4px 5px 10px rgba(255,255,255,.45),
    0 10px 22px -4px rgba(37,87,201,.5),0 0 0 4px rgba(169,140,234,.20)}
.atsv-shine{position:absolute;inset:-30%;animation:atsv-spin 14s linear infinite;
  background:conic-gradient(from 0deg,transparent 0 62%,rgba(255,255,255,.30) 76%,transparent 90%)}
.atsv-orbit{position:absolute;inset:-20%;border-radius:50%;border:1px dashed rgba(79,193,230,.45);animation:atsv-spin 16s linear infinite}
.atsv-orbit i{position:absolute;inset:0}
.atsv-orbit b{position:absolute;left:50%;top:-3px;width:6px;height:6px;margin-left:-3px;border-radius:50%;background:#4FC1E6;box-shadow:0 0 8px rgba(79,193,230,.9)}
.atsv-orbit i:nth-child(2) b{background:#A98CEA;box-shadow:0 0 8px rgba(169,140,234,.9)}
.atsv-orbit i:nth-child(3) b{background:#fff;width:4px;height:4px;margin-left:-2px;box-shadow:0 0 6px rgba(255,255,255,.95)}
.atsv-tag{position:absolute;display:inline-flex;align-items:center;gap:.32rem;padding:.3rem .55rem;border-radius:999px;white-space:nowrap;
  background:#fff;border:1px solid #D7E4F3;color:#12213A;font-size:10px;font-weight:600;line-height:1.1;
  box-shadow:0 6px 14px -6px rgba(37,87,201,.35)}
.atsv-tag .atsv-check{width:.8rem;height:.8rem}
.atsv-badge{position:absolute;aspect-ratio:1;border-radius:50%;padding:3px;
  background:conic-gradient(from 210deg,#4FC1E6,#2557C9,#A98CEA,#4FC1E6);box-shadow:0 8px 18px -6px rgba(37,87,201,.5)}
.atsv-badge span{display:grid;place-items:center;width:100%;height:100%;border-radius:50%;background:#fff;color:#2557C9;
  font-size:.72rem;font-weight:800;letter-spacing:.02em}
@keyframes atsv-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6%)}}
@keyframes atsv-spin{to{transform:rotate(360deg)}}
@keyframes atsv-scan{0%{opacity:0;transform:translateY(-110%)}12%{opacity:1}88%{opacity:1}100%{opacity:0;transform:translateY(640%)}}
@container (max-width:310px){.atsv-body{padding:6% 7% 0}.atsv-block{margin-top:.5rem}.atsv-row{margin-bottom:.3rem}.atsv-line{height:.26rem;margin-bottom:.24rem}.atsv-chips{margin-bottom:.26rem}.atsv-bar--dark{margin-bottom:.3rem!important}}
@container (max-width:270px){.atsv-tag{font-size:9px;padding:.24rem .42rem;gap:.26rem}.atsv-tag .atsv-check{width:.7rem;height:.7rem}}
@media (prefers-reduced-motion:reduce){.atsv *{animation:none!important}.atsv-beam{display:none}}
`;

/** A staggered pop for the small success checks. The target depends on
 *  `play`, so Framer actually starts the animation when the visual scrolls
 *  into view (changing only a delay would never re-trigger it). */
function CheckDot({ reduce, play, delay }) {
  return (
    <motion.span
      className="atsv-check"
      initial={reduce ? false : { opacity: 0, scale: 0.4 }}
      animate={play ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }}
      transition={{ delay, type: 'spring', stiffness: 420, damping: 22 }}
    >
      <Check className="h-2 w-2" strokeWidth={4} aria-hidden />
    </motion.span>
  );
}

/**
 * Purely decorative "AI resume analysis" illustration. It never shows a score
 * or result — it is an illustration of what the checker does, and every
 * element is hidden from assistive technology.
 *
 * `replayKey` — bump to replay the scan sequence (ignored if the entrance
 * sequence is still running, so a quick highlight can't restart it midway).
 * `compact`   — orb + document only, for the small welcome dialog.
 */
export default function AtsResumeVisual({ replayKey = 0, compact = false, className = '' }) {
  const reduce = usePrefersReducedMotion();
  const rootRef = useRef(null);
  const inView = useInView(rootRef, { once: true, amount: 0.35 });
  // No IntersectionObserver (very old browsers): just play.
  const canObserve = typeof IntersectionObserver !== 'undefined';
  const play = reduce || !canObserve || inView;

  const [scanKey, setScanKey] = useState(0);
  const startedAt = useRef(null);
  const lastReplay = useRef(replayKey);

  useEffect(() => {
    if (play && startedAt.current === null) startedAt.current = Date.now();
  }, [play]);

  useEffect(() => {
    if (replayKey === lastReplay.current) return;
    lastReplay.current = replayKey;
    const running = startedAt.current !== null && Date.now() - startedAt.current < 2800;
    if (play && !running && !reduce) setScanKey((k) => k + 1);
  }, [replayKey, play, reduce]);

  const a = (delay, extra = {}) => ({
    initial: reduce ? false : { opacity: 0, ...extra },
    animate: play ? { opacity: 1, x: 0, y: 0, scale: 1 } : { opacity: 0, ...extra },
    transition: { duration: 0.75, delay, ease },
  });

  return (
    <div
      ref={rootRef}
      className={`atsv ${className}`}
      data-play={play && !reduce ? 'true' : 'false'}
      aria-hidden="true"
    >
      <style>{CSS}</style>
      <div className="atsv-glow" />

      {/* 1 — orb floats in */}
      <motion.div
        className="atsv-abs"
        style={{ right: compact ? '8%' : '7%', top: compact ? '9%' : '9%', width: compact ? '27%' : '26%', aspectRatio: '1' }}
        {...a(0.05, { y: 14, scale: 0.6 })}
      >
        <div className="atsv-orbfloat">
          <div className="atsv-orbit">
            <i style={{ transform: 'rotate(0deg)' }}><b /></i>
            <i style={{ transform: 'rotate(120deg)' }}><b /></i>
            <i style={{ transform: 'rotate(240deg)' }}><b /></i>
          </div>
          <div className="atsv-orb"><span className="atsv-shine" /></div>
        </div>
      </motion.div>

      {/* 2 — resume enters with its 3D tilt; layered sheet behind for depth */}
      <motion.div
        className="atsv-abs"
        style={{ left: '12%', top: '3%', width: '55%', height: '82%' }}
        {...a(0.25, { y: 22 })}
      >
        <div className="atsv-tilt" style={{ opacity: 0.6 }}>
          <div className="atsv-sheet atsv-sheet--back" />
        </div>
      </motion.div>

      <motion.div
        className="atsv-abs"
        style={{ left: '4%', top: '5%', width: '58%', height: '84%' }}
        {...a(0.4, { y: 26 })}
      >
        <div className="atsv-tilt">
          <div className="atsv-sheet">
            <div className="atsv-body">
              <div className="atsv-head">
                <span className="atsv-avatar" />
                <div style={{ flex: 1 }}>
                  <span className="atsv-bar atsv-bar--dark" style={{ width: '64%', marginBottom: '.4rem' }} />
                  <span className="atsv-bar" style={{ width: '42%' }} />
                </div>
              </div>

              <div className="atsv-block">
                <div className="atsv-row">
                  <span key={`c1-${scanKey}`}><CheckDot reduce={reduce} play={play} delay={1.6} /></span>
                  <span className="atsv-bar atsv-bar--blue" style={{ width: '30%' }} />
                </div>
                <span className="atsv-line" style={{ width: '94%' }} />
                <span className="atsv-line" style={{ width: '80%' }} />
                <span className="atsv-line" style={{ width: '88%' }} />
              </div>

              <div className="atsv-block">
                <div className="atsv-row">
                  <span key={`c2-${scanKey}`}><CheckDot reduce={reduce} play={play} delay={2.0} /></span>
                  <span className="atsv-bar atsv-bar--blue" style={{ width: '24%' }} />
                </div>
                <div className="atsv-chips">
                  <span className="atsv-chip" style={{ width: '24%' }} />
                  <span className="atsv-chip" style={{ width: '30%' }} />
                  <span className="atsv-chip" style={{ width: '20%' }} />
                </div>
                <span className="atsv-line" style={{ width: '70%' }} />
              </div>

              <div className="atsv-block">
                <div className="atsv-row">
                  <span key={`c3-${scanKey}`}><CheckDot reduce={reduce} play={play} delay={2.4} /></span>
                  <span className="atsv-bar atsv-bar--blue" style={{ width: '28%' }} />
                </div>
                <span className="atsv-line" style={{ width: '86%' }} />
                <span className="atsv-line" style={{ width: '62%' }} />
              </div>
            </div>
            {/* 3 — scan beam (one pass; remounted to replay) */}
            <span key={`beam-${scanKey}`} className="atsv-beam" />
          </div>
        </div>
      </motion.div>

      {!compact && (
        <span key={`extras-${scanKey}`}>
          {/* 5 — decorative skill/analysis tags */}
          {TAGS.map((tag, i) => (
            <motion.span
              key={tag.label}
              className="atsv-tag"
              style={{ right: tag.right, top: tag.top }}
              initial={reduce ? false : { opacity: 0, x: 14 }}
              animate={play ? { opacity: 1, x: 0 } : { opacity: 0, x: 14 }}
              transition={{ duration: 0.5, delay: 2.0 + i * 0.16, ease }}
            >
              <span className="atsv-check"><Check className="h-2 w-2" strokeWidth={4} aria-hidden /></span>
              {tag.label}
            </motion.span>
          ))}

          {/* 4 — sample ATS badge: a label, never a score */}
          <motion.div
            className="atsv-badge"
            style={{ left: '76%', top: '76%', width: '14%' }}
            initial={reduce ? false : { opacity: 0, scale: 0.3 }}
            animate={play ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.3 }}
            transition={{ delay: 2.7, type: 'spring', stiffness: 360, damping: 20 }}
          >
            <span>ATS</span>
          </motion.div>
        </span>
      )}
    </div>
  );
}