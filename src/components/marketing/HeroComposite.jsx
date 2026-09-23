import { useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Check, MapPin, Plane, ScanLine, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery.js';

const ease = [0.16, 0.84, 0.44, 1];
const ROUTE = 'M6 34 C 90 34, 120 10, 200 10 S 300 22, 314 12';

/** Counts from 0 to `to` once, after `delay` seconds. */
function CountUp({ to, delay = 0, duration = 1.2, suffix = '', reduced }) {
  const [value, setValue] = useState(reduced ? to : 0);
  useEffect(() => {
    if (reduced) return undefined;
    const controls = animate(0, to, {
      duration,
      delay,
      ease,
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [to, delay, duration, reduced]);
  return (
    <>
      {value}
      {suffix}
    </>
  );
}

/**
 * Gentle idle float for an overlapping card. Kept separate from the entrance
 * animation (on the parent) so the two never fight over `y`.
 */
function Float({ children, reduced, amplitude = 6, duration = 5, delay = 0, className }) {
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -amplitude, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

/**
 * The hero visual. Built entirely from markup and SVG — no stock photography.
 *
 * It shows the three things DutyLaunch actually does, layered: a professional
 * profile being made ready, an opportunity it unlocks, and the move abroad at
 * the end of it.
 *
 * Motion: an orchestrated entrance, then a slow idle loop (cards float out of
 * phase, a dot travels the route, the destination pulses) plus a light mouse
 * parallax for depth. Every loop is disabled under prefers-reduced-motion.
 */
export function HeroComposite() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef(null);

  const enter = (delay) =>
    reduced
      ? { initial: false, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease },
        };

  /* Mouse parallax: floating cards move further than the base panel, which
     reads as depth. Springs keep it smooth; range is a few pixels only. */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 20, mass: 0.4 });
  const sy = useSpring(my, { stiffness: 120, damping: 20, mass: 0.4 });
  const baseX = useTransform(sx, (v) => v * -6);
  const baseY = useTransform(sy, (v) => v * -6);
  const nearX = useTransform(sx, (v) => v * 14);
  const nearY = useTransform(sy, (v) => v * 14);

  const onMove = (e) => {
    if (reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  /* The pending document completes shortly after the entrance, so the card
     tells a small story instead of sitting still. */
  const [lastDocDone, setLastDocDone] = useState(false);
  useEffect(() => {
    if (reduced) return undefined;
    const t = setTimeout(() => setLastDocDone(true), 2600);
    return () => clearTimeout(t);
  }, [reduced]);

  const checks = [
    { label: 'CV parses cleanly in applicant tracking systems', delay: 0.5 },
    { label: 'Achievements rewritten with measurable outcomes', delay: 0.6 },
    { label: 'LinkedIn aligned to the same target role', delay: 0.7 },
  ];

  const docs = [
    ['Degree attested', true],
    ['Embassy attestation', true],
    ['Employment certificate', lastDocDone],
  ];

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative mx-auto w-full max-w-[34rem] lg:max-w-none"
      aria-hidden
    >
      {/* Base panel */}
      <motion.div style={reduced ? undefined : { x: baseX, y: baseY }}>
        <motion.div {...enter(0.1)} className="relative rounded-xl bg-ink-800 p-5 shadow-panel sm:p-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption font-semibold text-azure-200">Profile readiness</p>
              <p className="mt-1 text-h3 font-bold text-white">Senior Operations Manager</p>
            </div>
            <span className="tabular rounded bg-white/10 px-2.5 py-1 text-caption font-semibold text-white">
              8 years
            </span>
          </div>

          {/* ATS meter */}
          <div className="mt-6">
            <div className="flex items-end justify-between">
              <span className="text-caption text-slate-400">ATS readiness</span>
              <span className="tabular text-h3 font-bold text-white">
                <CountUp to={92} suffix="%" delay={0.45} duration={1.1} reduced={reduced} />
              </span>
            </div>
            <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-white/12">
              <motion.div
                initial={reduced ? false : { width: '0%' }}
                animate={{ width: '92%' }}
                transition={{ duration: 1.1, delay: 0.45, ease }}
                className="relative h-full overflow-hidden rounded-full bg-amber-500"
              >
                {/* Soft sheen sweeping across the bar every few seconds. */}
                {!reduced && (
                  <motion.span
                    className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent"
                    initial={{ x: '-120%' }}
                    animate={{ x: '320%' }}
                    transition={{ duration: 1.6, delay: 1.8, repeat: Infinity, repeatDelay: 3.2, ease: 'easeInOut' }}
                  />
                )}
              </motion.div>
            </div>
          </div>

          <ul className="mt-6 space-y-3">
            {checks.map((item) => (
              <motion.li
                key={item.label}
                initial={reduced ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: item.delay, ease }}
                className="flex items-start gap-3"
              >
                <motion.span
                  initial={reduced ? false : { scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18, delay: item.delay + 0.1 }}
                  className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-azure-400/20"
                >
                  <Check className="h-3 w-3 text-azure-200" strokeWidth={3} />
                </motion.span>
                <span className="text-small text-slate-300">{item.label}</span>
              </motion.li>
            ))}
          </ul>

          {/* Route line from profile to destination */}
          <svg viewBox="0 0 320 44" className="mt-6 w-full overflow-visible" role="presentation">
            <motion.path
              d={ROUTE}
              fill="none"
              stroke="#4A78F5"
              strokeWidth="1.5"
              strokeDasharray="4 5"
              initial={reduced ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.3, delay: 0.8, ease }}
            />
            <circle cx="6" cy="34" r="3.5" fill="#D98A15" />

            {/* Destination pulse */}
            {!reduced && (
              <motion.circle
                cx="314"
                cy="12"
                r="3.5"
                fill="none"
                stroke="#4A78F5"
                strokeWidth="1.5"
                initial={{ scale: 1, opacity: 0 }}
                animate={{ scale: [1, 3.2], opacity: [0.7, 0] }}
                transition={{ duration: 1.8, delay: 2.1, repeat: Infinity, ease: 'easeOut' }}
                style={{ transformOrigin: '314px 12px', transformBox: 'view-box' }}
              />
            )}
            <circle cx="314" cy="12" r="3.5" fill="#4A78F5" />

            {/* A dot travelling the route, profile → offer, on a loop. */}
            {!reduced && (
              <circle r="2.6" fill="#ffffff">
                <animateMotion dur="3.4s" begin="2.1s" repeatCount="indefinite" path={ROUTE} keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.45 0 0.55 1" />
                <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" dur="3.4s" begin="2.1s" repeatCount="indefinite" />
              </circle>
            )}
          </svg>
          <div className="flex items-center justify-between text-caption text-slate-400">
            <span>Profile ready</span>
            <span>Offer abroad</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Opportunity card — overlaps top right */}
      <motion.div
        style={reduced ? undefined : { x: nearX, y: nearY }}
        className="absolute -right-2 -top-12 w-[14.5rem] sm:-right-6 sm:-top-14 sm:w-[16rem]"
      >
        <motion.div {...enter(0.85)}>
          <Float reduced={reduced} amplitude={7} duration={5.5} delay={1.6}>
            <div className="rounded-lg border border-line bg-white p-4 shadow-raise">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-sand-300">
                  <motion.span
                    className="inline-flex"
                    animate={reduced ? undefined : { x: [0, 2, 0], y: [0, -2, 0] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Plane className="h-3.5 w-3.5 text-ink" />
                  </motion.span>
                </span>
                <span className="text-caption font-semibold text-slate-500">New opportunity</span>
              </div>
              <p className="mt-2.5 text-small font-bold leading-snug text-ink">Operations Manager</p>
              <p className="mt-1 flex items-center gap-1.5 text-caption text-slate-500">
                <MapPin className="h-3.5 w-3.5" />
                Dubai, United Arab Emirates
              </p>
              <div className="mt-3 flex items-center gap-1.5 border-t border-line pt-3">
                <motion.span
                  className="inline-flex"
                  animate={reduced ? undefined : { rotate: [0, 18, 0], scale: [1, 1.15, 1] }}
                  transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' }}
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                </motion.span>
                <span className="text-caption font-medium text-slate-600">Matches 9 of 10 requirements</span>
              </div>
            </div>
          </Float>
        </motion.div>
      </motion.div>

      {/* ATS score card — sits on the left edge, clear of the other two
          overlapping cards, and links straight to the free checker. */}
      <motion.div
        style={reduced ? undefined : { x: nearX, y: nearY }}
        className="pointer-events-auto absolute -left-3 top-16 sm:-left-9 sm:top-20"
      >
        <motion.div {...enter(1.1)}>
          <Float reduced={reduced} amplitude={5} duration={4.6} delay={2.2}>
            <Link
              to="/ats-resume-checker"
              tabIndex={-1}
              className="flex items-center gap-3 rounded-lg border border-line bg-white p-3.5 shadow-raise transition-transform hover:-translate-y-0.5"
            >
              <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-success/15">
                {!reduced && (
                  <motion.span
                    className="absolute inset-0 rounded-full border border-success/40"
                    animate={{ scale: [1, 1.45], opacity: [0.6, 0] }}
                    transition={{ duration: 2, delay: 2.4, repeat: Infinity, repeatDelay: 1, ease: 'easeOut' }}
                  />
                )}
                <ScanLine className="h-4 w-4 text-success" aria-hidden />
              </span>
              <div>
                <p className="text-caption font-semibold text-slate-500">ATS Score</p>
                <p className="tabular text-small font-extrabold leading-none text-ink">
                  <CountUp to={92} delay={1.2} duration={1} reduced={reduced} />
                </p>
              </div>
            </Link>
          </Float>
        </motion.div>
      </motion.div>

      {/* Documents — overlaps bottom left */}
      <motion.div
        style={reduced ? undefined : { x: nearX, y: nearY }}
        className="absolute -bottom-7 -left-2 w-[15rem] sm:-left-6 sm:w-[17rem]"
      >
        <motion.div {...enter(1)}>
          <Float reduced={reduced} amplitude={6} duration={6} delay={1.9}>
            <div className="rounded-lg border border-line bg-white p-4 shadow-raise">
              <p className="text-caption font-semibold text-slate-500">Documents</p>
              <ul className="mt-2.5 space-y-2">
                {docs.map(([label, done]) => (
                  <li key={label} className="flex items-center gap-2.5">
                    <motion.span
                      layout
                      className={`inline-flex h-4 w-4 items-center justify-center rounded-full transition-colors duration-300 ${
                        done ? 'bg-success/15' : 'border border-dashed border-slate-300'
                      }`}
                    >
                      {done && (
                        <motion.span
                          initial={reduced ? false : { scale: 0, rotate: -30 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 420, damping: 16 }}
                          className="inline-flex"
                        >
                          <Check className="h-2.5 w-2.5 text-success" strokeWidth={3.5} />
                        </motion.span>
                      )}
                    </motion.span>
                    <span
                      className={`text-caption transition-colors duration-300 ${done ? 'text-slate-600' : 'text-slate-400'}`}
                    >
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Float>
        </motion.div>
      </motion.div>
    </div>
  );
}