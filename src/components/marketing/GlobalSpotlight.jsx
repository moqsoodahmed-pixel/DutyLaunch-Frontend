import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Globe2, MapPin, Plane, TrendingUp } from 'lucide-react';
import { Container } from '../ui/Container.jsx';
import { Button } from '../ui/Button.jsx';
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery.js';
import { GlobeFallback } from '../premium/GlobeFallback.jsx';

// three.js scene, code-split out of the main bundle and fetched only when
// this section renders. Renders nothing without WebGL.
const GlobeScene = lazy(() => import('../premium/GlobeScene.jsx'));

const ease = [0.16, 0.84, 0.44, 1];

const OPPORTUNITIES = [
  { role: 'Operations Manager', city: 'Dubai, UAE', match: '92%', delay: 0 },
  { role: 'Registered Nurse', city: 'Riyadh, Saudi Arabia', match: '88%', delay: 0.15 },
  { role: 'Project Engineer', city: 'Doha, Qatar', match: '85%', delay: 0.3 },
];

/**
 * Global mobility, on the pale mist-blue like the other former dark sections.
 *
 * The right column is a square "stage" for the spinning 3D globe (all screen
 * sizes), sized at 83 % of the column, with the three opportunity cards
 * overlapping only its bottom edge (~10 %). The overlap is a percentage, so it
 * scales with the globe; the plane's route and the destination markers sit
 * above the cards. The plane flies to Dubai, Riyadh and Doha: the three
 * cities named in those cards. The globe layer ignores pointer events and sits
 * underneath the cards (z-10), so it can never cover text or buttons.
 */
export function GlobalSpotlight() {
  const reduceMotion = usePrefersReducedMotion();

  return (
    <section className="surface-mist pb-section pt-section">
      <Container className="relative grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-12">
        <div className="lg:col-span-6">
          <span className="eyebrow">
            <Globe2 className="h-3.5 w-3.5" aria-hidden /> Global mobility
          </span>
          <h2 className="mt-5 text-h1 font-extrabold text-ink">
            Take your career{' '}
            <span className="-mb-[0.14em] bg-gradient-to-r from-azure via-azure-400 to-violet bg-clip-text pb-[0.14em] text-transparent">
              global.
            </span>
          </h2>
          <p className="mt-5 max-w-lg text-lead text-slate-700">
            From the Gulf to further afield, we handle the parts that stop most applications: the
            right role, the paperwork behind it, and a profile that survives translation into a new
            market.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button to="/dubai-launch" size="lg" variant="premium" magnetic>
              Explore the Dubai package
            </Button>
            <Button to="/apostille-services" size="lg" variant="outline">
              Documentation services
            </Button>
          </div>
        </div>

        <div className="relative lg:col-span-6">
          <div className="mx-auto w-full max-w-[36rem]">
            {/* Globe stage: 83 % of the column (≈ 17 % smaller than before), centred. */}
            <div className="mx-auto w-[83%]">
              <Suspense fallback={<GlobeFallback className="pointer-events-none aspect-square w-full" />}>
                <GlobeScene className="pointer-events-none aspect-square w-full" />
              </Suspense>
            </div>

            <div className="relative z-10 -mt-[10%] space-y-3.5">
              {OPPORTUNITIES.map((op) => (
                <motion.div
                  key={op.role}
                  initial={reduceMotion ? false : { opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.55, delay: op.delay, ease }}
                  className="flex items-center justify-between gap-4 rounded-xl border-2 border-mist-line bg-white p-4 shadow-[0_16px_36px_-18px_rgba(29,93,184,0.4)] transition-colors duration-200 hover:border-azure-300 sm:p-5"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-azure-200 bg-mist-chip">
                      <Plane className="h-5 w-5 text-azure" aria-hidden />
                    </span>
                    <div>
                      <p className="text-small font-bold text-ink">{op.role}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-caption text-slate-600">
                        <MapPin className="h-3.5 w-3.5" aria-hidden />
                        {op.city}
                      </p>
                    </div>
                  </div>
                  <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-caption font-bold text-emerald-700">
                    <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                    {op.match} match
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}