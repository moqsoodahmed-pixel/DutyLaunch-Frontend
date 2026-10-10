import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Globe2, MapPin, Plane, TrendingUp } from 'lucide-react';
import { Container } from '../ui/Container.jsx';
import { Button } from '../ui/Button.jsx';
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery.js';

// three.js scene, code-split out of the main bundle and fetched only when
// this section renders. Renders nothing without WebGL.
const GlobeScene = lazy(() => import('../premium/GlobeScene.jsx'));

const ease = [0.16, 0.84, 0.44, 1];
const EDGE_FADE_BOTTOM = 'linear-gradient(to bottom, #000 calc(100% - 7rem), transparent 100%)';

const OPPORTUNITIES = [
  { role: 'Operations Manager', city: 'Dubai, UAE', match: '92%', delay: 0 },
  { role: 'Registered Nurse', city: 'Riyadh, Saudi Arabia', match: '88%', delay: 0.15 },
  { role: 'Project Engineer', city: 'Doha, Qatar', match: '85%', delay: 0.3 },
];

/**
 * Global mobility. Deliberately dark and high-contrast — the section where
 * the global-mobility story gets room to breathe.
 *
 * It sits directly below JourneyRail, which is also dark: the shared edge
 * stays dark (seam-top-dark), and a soft horizon glow with a purple-leaning
 * aurora gives this section its own character, distinct from JourneyRail's
 * frost mesh. The bottom edge fades into the light section that follows.
 *
 * The globe (lg+ only) shows flight arcs from Bengaluru, where DutyLaunch's
 * office is, to the three cities in the cards below it. The cards start
 * 15.5rem down the column: measured against the globe's projection, the
 * cities and arcs occupy ~9–13rem from the top, so the cards never cover them.
 */
export function GlobalSpotlight() {
  const reduceMotion = usePrefersReducedMotion();

  return (
    <section className="seam seam-tone-ink900 seam-top-dark seam-bottom-dark relative overflow-hidden pb-section-dark pt-section text-white">
      {/* Decorative ambient aurora layers */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
      >
        {/* Horizon glow, spilling down from where JourneyRail ends. */}
        <div
          className="pointer-events-none absolute inset-x-[8%] top-0 h-40"
          style={{ background: 'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(79,193,230,.22), transparent 70%)' }}
          aria-hidden
        />
        {/* Aurora — purple-leaning, so it reads differently from JourneyRail. */}
        <div
          className={`pointer-events-none absolute inset-0 ${reduceMotion ? '' : 'animate-aurora-drift'}`}
          style={{
            background:
              'radial-gradient(45% 55% at 30% 0%, rgb(var(--night-glow-b) / .22), transparent 70%), radial-gradient(35% 45% at 85% 70%, rgb(var(--night-glow-a) / .14), transparent 70%)',
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, #000 30%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, #000 30%, transparent 80%)',
          }}
          aria-hidden
        />

      </div>

      <Container className="relative grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-12">
        <div className="lg:col-span-6">
          <span className="eyebrow-dark">
            <Globe2 className="h-3.5 w-3.5" aria-hidden /> Global mobility
          </span>
          <h2 className="mt-5 text-h1 font-extrabold text-white">
            Take your career{' '}
            <span className="-mb-[0.14em] bg-gradient-to-r from-frost-300 via-azure-200 to-aurora-400 bg-clip-text pb-[0.14em] text-transparent">
              global.
            </span>
          </h2>
          <p className="mt-5 max-w-lg text-lead text-slate-300">
            From the Gulf to further afield, we handle the parts that stop most applications: the
            right role, the paperwork behind it, and a profile that survives translation into a new
            market.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button to="/dubai-launch" size="lg" variant="premium" magnetic>
              Explore the Dubai package
            </Button>
            <Button to="/appostle-services" size="lg" variant="outlineInk">
              Documentation services
            </Button>
          </div>
        </div>

        <div className="relative lg:col-span-6 lg:pt-[15.5rem]">
          <Suspense fallback={null}>
            <GlobeScene className="pointer-events-none absolute left-1/2 top-0 hidden h-[26rem] w-[26rem] -translate-x-1/2 lg:block" />
          </Suspense>

          <div className="relative z-10 space-y-3.5">
            {OPPORTUNITIES.map((op) => (
              <motion.div
                key={op.role}
                initial={reduceMotion ? false : { opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.55, delay: op.delay, ease }}
                className="flex items-center justify-between gap-4 rounded-xl border-2 border-night-line bg-night-card p-4 shadow-[0_18px_44px_-18px_rgba(0,0,0,0.65)] transition-colors duration-200 hover:border-frost-300/40 sm:p-5"
              >
                <div className="flex items-center gap-3.5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-frost-300/20 bg-frost-400/10">
                    <Plane className="h-5 w-5 text-frost-300" aria-hidden />
                  </span>
                  <div>
                    <p className="text-small font-bold text-white">{op.role}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-caption text-slate-400">
                      <MapPin className="h-3.5 w-3.5" aria-hidden />
                      {op.city}
                    </p>
                  </div>
                </div>
                <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-success/15 px-3 py-1.5 text-caption font-bold text-success">
                  <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                  {op.match} match
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}