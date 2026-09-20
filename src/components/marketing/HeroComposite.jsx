import { motion } from 'framer-motion';
import { Check, MapPin, Plane, ScanLine, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery.js';

const ease = [0.16, 0.84, 0.44, 1];

/**
 * The hero visual. Built entirely from markup and SVG — no stock photography.
 *
 * It shows the three things DutyLaunch actually does, layered:
 * a professional profile being made ready, an opportunity it unlocks, and the
 * move abroad at the end of it. This is the one place on the site where motion
 * is not user-triggered: a single orchestrated entrance, then it stops.
 */
export function HeroComposite() {
  const reduced = usePrefersReducedMotion();
  const enter = (delay) =>
    reduced
      ? { initial: false, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease },
        };

  const checks = [
    { label: 'CV parses cleanly in applicant tracking systems', delay: 0.5 },
    { label: 'Achievements rewritten with measurable outcomes', delay: 0.6 },
    { label: 'LinkedIn aligned to the same target role', delay: 0.7 },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[34rem] lg:max-w-none" aria-hidden>
      {/* Base panel */}
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
            <span className="tabular text-h3 font-bold text-white">92%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/12">
            <motion.div
              initial={reduced ? false : { width: '0%' }}
              animate={{ width: '92%' }}
              transition={{ duration: 1.1, delay: 0.45, ease }}
              className="h-full rounded-full bg-amber-500"
            />
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
              <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-azure-400/20">
                <Check className="h-3 w-3 text-azure-200" strokeWidth={3} />
              </span>
              <span className="text-small text-slate-300">{item.label}</span>
            </motion.li>
          ))}
        </ul>

        {/* Route line from profile to destination */}
        <svg viewBox="0 0 320 44" className="mt-6 w-full" role="presentation">
          <motion.path
            d="M6 34 C 90 34, 120 10, 200 10 S 300 22, 314 12"
            fill="none"
            stroke="#4A78F5"
            strokeWidth="1.5"
            strokeDasharray="4 5"
            initial={reduced ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.3, delay: 0.8, ease }}
          />
          <circle cx="6" cy="34" r="3.5" fill="#D98A15" />
          <circle cx="314" cy="12" r="3.5" fill="#4A78F5" />
        </svg>
        <div className="flex items-center justify-between text-caption text-slate-400">
          <span>Profile ready</span>
          <span>Offer abroad</span>
        </div>
      </motion.div>

      {/* Opportunity card — overlaps top right */}
      <motion.div
        {...enter(0.85)}
        className="absolute -right-2 -top-12 w-[14.5rem] rounded-lg border border-line bg-white p-4 shadow-raise sm:-right-6 sm:-top-14 sm:w-[16rem]"
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-sand-300">
            <Plane className="h-3.5 w-3.5 text-ink" />
          </span>
          <span className="text-caption font-semibold text-slate-500">New opportunity</span>
        </div>
        <p className="mt-2.5 text-small font-bold leading-snug text-ink">Operations Manager</p>
        <p className="mt-1 flex items-center gap-1.5 text-caption text-slate-500">
          <MapPin className="h-3.5 w-3.5" />
          Dubai, United Arab Emirates
        </p>
        <div className="mt-3 flex items-center gap-1.5 border-t border-line pt-3">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-caption font-medium text-slate-600">Matches 9 of 10 requirements</span>
        </div>
      </motion.div>

      {/* ATS score card — sits on the left edge, clear of the other two
          overlapping cards, and links straight to the free checker. */}
      <motion.div {...enter(1.1)} className="pointer-events-auto absolute -left-3 top-16 sm:-left-9 sm:top-20">
        <Link
          to="/ats-resume-checker"
          className="flex items-center gap-3 rounded-lg border border-line bg-white p-3.5 shadow-raise transition-transform hover:-translate-y-0.5"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-success/15">
            <ScanLine className="h-4 w-4 text-success" aria-hidden />
          </span>
          <div>
            <p className="text-caption font-semibold text-slate-500">ATS Score</p>
            <p className="text-small font-extrabold leading-none text-ink">92</p>
          </div>
        </Link>
      </motion.div>

      {/* Milestone strip — overlaps bottom left */}
      <motion.div
        {...enter(1)}
        className="absolute -bottom-7 -left-2 w-[15rem] rounded-lg border border-line bg-white p-4 shadow-raise sm:-left-6 sm:w-[17rem]"
      >
        <p className="text-caption font-semibold text-slate-500">Documents</p>
        <ul className="mt-2.5 space-y-2">
          {[
            ['Degree attested', true],
            ['Embassy attestation', true],
            ['Employment certificate', false],
          ].map(([label, done]) => (
            <li key={label} className="flex items-center gap-2.5">
              <span
                className={`inline-flex h-4 w-4 items-center justify-center rounded-full ${
                  done ? 'bg-success/15' : 'border border-dashed border-slate-300'
                }`}
              >
                {done && <Check className="h-2.5 w-2.5 text-success" strokeWidth={3.5} />}
              </span>
              <span className={`text-caption ${done ? 'text-slate-600' : 'text-slate-400'}`}>{label}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
