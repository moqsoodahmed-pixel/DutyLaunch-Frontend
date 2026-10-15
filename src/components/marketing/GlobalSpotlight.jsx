import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Globe2, MapPin, Plane, TrendingUp } from 'lucide-react';
import { Container } from '../ui/Container.jsx';
import { Button } from '../ui/Button.jsx';
import { isWebGLAvailable } from '../premium/webgl.jsx';
import { useMediaQuery, usePrefersReducedMotion } from '../../hooks/useMediaQuery.js';

// three.js scene, code-split out of the main bundle and fetched only when
// this section renders a globe. Renders nothing without WebGL.
const GlobeScene = lazy(() => import('../premium/GlobeScene.jsx'));

const ease = [0.16, 0.84, 0.44, 1];

const OPPORTUNITIES = [
  { role: 'Operations Manager', city: 'Dubai, UAE', match: '92%', delay: 0 },
  { role: 'Registered Nurse', city: 'Riyadh, Saudi Arabia', match: '88%', delay: 0.12 },
  { role: 'Project Engineer', city: 'Doha, Qatar', match: '85%', delay: 0.24 },
];

/**
 * Global Mobility hero.
 *
 * LAYOUT
 *   Two columns inside the site's own <Container> (so the section lines up
 *   with the navbar above it and the sections around it): copy on the left,
 *   one "visual" wrapper on the right. The columns are vertically centred on
 *   each other, so the headline block sits beside the middle of the
 *   composition instead of floating at the top or bottom.
 *
 * THE RIGHT-HAND COMPOSITION
 *   A single `relative isolate` wrapper owns the globe and the cards:
 *     globe   z-0   a square box, `min(100%, GLOBE)` wide and centred
 *     cards   z-10  a vertical stack, pulled up over the globe's lower edge
 *   The overlap is not a magic padding. The globe is drawn inside its box with
 *   ~8% of clear space below the sphere, so the stack is pulled up by a
 *   fraction of that same box width (OVERLAP). The globe, its flight arcs and
 *   its city markers sit in the upper-middle of the sphere, so the cards only
 *   ever cover the lowest sliver of the globe, at any screen size.
 *
 * The globe itself (GlobeScene) is untouched: same texture, lighting,
 * atmosphere, flight paths, plane pulses and markers.
 */
const GLOBE = '24rem'; // diameter of the globe's square box
const OVERLAP = 0.15;  // fraction of that box the card stack rises into it

export function GlobalSpotlight() {
  const reduceMotion = usePrefersReducedMotion();
  // From 640px up. On phones the cards stand alone: the 3D scene is not
  // mounted at all, so small devices never download or run it.
  const roomForGlobe = useMediaQuery('(min-width: 640px)');
  const showGlobe = roomForGlobe && isWebGLAvailable();

  return (
    <section
      id="global-mobility"
      aria-labelledby="global-mobility-title"
      className="surface-dl-hero overflow-hidden border-y border-dl-border py-12 sm:py-14 lg:py-14"
    >
      <Container className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-16 xl:gap-24">
        {/* ------------------------------ copy ------------------------------ */}
        <div className="max-w-[36rem]">
          <span className="inline-flex items-center gap-2 rounded-full border border-dl-border bg-white px-3 py-1 text-caption font-bold uppercase tracking-wider text-dl-navy">
            <Globe2 className="h-3.5 w-3.5 text-dl-blue" aria-hidden />
            Global Career &amp; Mobility
          </span>

          <h2
            id="global-mobility-title"
            className="mt-5 text-h1 font-extrabold text-dl-ink"
          >
            Take your career <span className="text-dl-blue">global.</span>
          </h2>

          <p className="mt-5 max-w-[32rem] text-lead text-dl-muted">
            From the Gulf to further afield, we help you navigate international career opportunities
            with the right preparation, application support and documentation guidance.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button to="/dubai-launch" size="lg" variant="solid">
              Explore Dubai Launch
            </Button>
            <Button to="/apostille-services" size="lg" variant="solidOutline">
              Documentation Services
            </Button>
          </div>
        </div>

        {/* ----------------------- globe + cards composition ----------------------- */}
        <div className="relative isolate mx-auto w-full max-w-[30rem] lg:mx-0 lg:ml-auto">
          {showGlobe && (
            <div
              className="relative z-0 mx-auto aspect-square"
              style={{
                width: `min(100%, ${GLOBE})`,
                // Fades the faint outer atmosphere out before the canvas edge, so
                // it is never cut flat. The globe itself sits well inside the
                // fully opaque part (it spans ~83% of the box).
                maskImage: 'radial-gradient(closest-side, #000 88%, transparent 100%)',
                WebkitMaskImage: 'radial-gradient(closest-side, #000 88%, transparent 100%)',
              }}
            >
              <Suspense fallback={null}>
                <GlobeScene className="pointer-events-none absolute inset-0" />
              </Suspense>
            </div>
          )}

          <ul
            className="relative z-10 grid auto-rows-fr gap-3"
            style={showGlobe ? { marginTop: `calc(min(100%, ${GLOBE}) * -${OVERLAP})` } : undefined}
          >
            {OPPORTUNITIES.map((op) => (
              <motion.li
                key={op.role}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: op.delay, ease }}
                className="flex min-h-[4.75rem] items-center justify-between gap-4 rounded-2xl border border-dl-border bg-white px-4 py-3.5 shadow-dl-card sm:px-5"
              >
                <div className="flex min-w-0 items-center gap-3.5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-dl-border bg-dl-hover">
                    <Plane className="h-5 w-5 text-dl-blue" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-small font-bold text-dl-ink">{op.role}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-caption text-dl-muted">
                      <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      <span className="truncate">{op.city}</span>
                    </p>
                  </div>
                </div>
                <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-caption font-bold text-emerald-700">
                  <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                  {op.match} match
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}