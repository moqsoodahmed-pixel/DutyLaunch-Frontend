import { lazy, Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import { Globe2, MapPin, Plane, Stethoscope, HardHat, TrendingUp } from 'lucide-react';
import { Container } from '../ui/Container.jsx';
import { Button } from '../ui/Button.jsx';
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery.js';
import { GlobeFallback } from '../premium/GlobeFallback.jsx';

// Three.js 3D Globe scene, code-split out of the main bundle
const GlobeScene = lazy(() => import('../premium/GlobeScene.jsx'));

const ease = [0.16, 0.84, 0.44, 1];

const OPPORTUNITIES = [
  {
    role: 'Operations Manager',
    city: 'Dubai, UAE',
    match: '92%',
    code: 'DXB',
    icon: Plane,
    delay: 0,
  },
  {
    role: 'Registered Nurse',
    city: 'Riyadh, Saudi Arabia',
    match: '88%',
    code: 'RUH',
    icon: Stethoscope,
    delay: 0.15,
  },
  {
    role: 'Project Engineer',
    city: 'Doha, Qatar',
    match: '85%',
    code: 'DOH',
    icon: HardHat,
    delay: 0.3,
  },
];

/**
 * Global Mobility Section with interactive 3D Globe and 3 simultaneous flights.
 * Large, realistic, completely unobstructed globe with zero content overlapping,
 * and dedicated international career opportunity cards below.
 */
export function GlobalSpotlight() {
  const reduceMotion = usePrefersReducedMotion();
  const [activeFlight, setActiveFlight] = useState(null);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#EBF5FF] via-[#E2F1FD] to-[#F0F9FF] py-16 lg:py-24">
      {/* Subtle background dotted map texture for visual depth */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.24]"
        style={{
          backgroundImage: 'radial-gradient(#38BDF8 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <Container className="relative z-10">
        {/* Top Hero Section: Left Value Proposition & Right Large Unobstructed 3D Globe */}
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-8 xl:gap-12">
          {/* Left Column: Heading, Value Proposition & Actions */}
          <div className="lg:col-span-5 xl:col-span-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-white/85 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-azure-700 shadow-sm backdrop-blur-sm">
              <Globe2 className="h-3.5 w-3.5 text-azure-500" aria-hidden />
              <span>Global Mobility</span>
            </div>

            <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-[3.25rem] lg:leading-[1.12]">
              Take your career{' '}
              <span className="-mb-[0.14em] bg-gradient-to-r from-azure via-azure-500 to-violet bg-clip-text pb-[0.14em] text-transparent">
                global.
              </span>
            </h2>

            <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-700">
              From the Gulf to further afield, we handle the parts that stop most applications: the
              right role, the paperwork behind it, and a profile that survives translation into a new
              market.
            </p>

            <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
              <Button to="/dubai-launch" size="lg" variant="premium" magnetic className="shadow-lg shadow-azure-500/20">
                Explore the Dubai package &rarr;
              </Button>
              <Button to="/apostille-services" size="lg" variant="outline" className="border-slate-300 bg-white/80 hover:bg-white text-slate-700">
                Documentation services
              </Button>
            </div>

            {/* Trust highlights */}
            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-sky-200/60 pt-6">
              <div>
                <p className="text-2xl font-black text-slate-900">3 Gulf Hubs</p>
                <p className="text-xs text-slate-600 mt-0.5">UAE &bull; Saudi Arabia &bull; Qatar</p>
              </div>
              <div>
                <p className="text-2xl font-black text-azure-600">2–3 Days</p>
                <p className="text-xs text-slate-600 mt-0.5">Fast CV & profile turnaround</p>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Interactive Globe - Big, Majestic, Aspect-Square, ZERO CLIPPING */}
          <div className="relative flex items-center justify-center lg:col-span-7 xl:col-span-7 py-2">
            {/* Globe Canvas Container - Aspect-Square prevents any rectangular or square clipping */}
            <div className="relative aspect-square w-full max-w-[26rem] sm:max-w-[30rem] md:max-w-[34rem] lg:max-w-[38rem] xl:max-w-[42rem] mx-auto flex items-center justify-center">
              <Suspense
                fallback={
                  <GlobeFallback className="absolute inset-0 h-full w-full" />
                }
              >
                <GlobeScene
                  className="h-full w-full"
                  activeFlight={activeFlight}
                  onHoverDestination={setActiveFlight}
                />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Dedicated 3-Column Career Opportunities Grid Below Globe (No Overlapping) */}
        <div className="mt-10 border-t border-sky-200/70 pt-8 lg:mt-12">
          <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-azure-600">
                Active International Corridors
              </span>
              <h3 className="mt-1 text-lg font-extrabold text-slate-900 sm:text-xl">
                Featured Global Career Opportunities
              </h3>
            </div>
            <p className="text-xs font-medium text-slate-500">
              Interactive preview &bull; Hover on a role to highlight corridor on 3D globe
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {OPPORTUNITIES.map((op) => {
              const IconComponent = op.icon;
              const isHovered = activeFlight === op.code;

              return (
                <motion.div
                  key={op.role}
                  initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: op.delay, ease }}
                  onMouseEnter={() => setActiveFlight(op.code)}
                  onMouseLeave={() => setActiveFlight(null)}
                  className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl border bg-white/95 p-4 shadow-[0_8px_24px_-8px_rgba(29,93,184,0.12)] backdrop-blur-md transition-all duration-300 sm:p-5 ${
                    isHovered
                      ? 'border-azure-400 shadow-[0_16px_36px_-10px_rgba(29,93,184,0.3)] ring-2 ring-azure-400/25 -translate-y-1'
                      : 'border-slate-200/80 hover:border-azure-300 hover:shadow-[0_12px_28px_-8px_rgba(29,93,184,0.2)]'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border transition-colors duration-200 ${
                        isHovered
                          ? 'border-azure-300 bg-azure-50 text-azure-600'
                          : 'border-sky-100 bg-sky-50 text-sky-600'
                      }`}
                    >
                      <IconComponent className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-900 sm:text-[15px]">
                        {op.role}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                        {op.city}
                      </p>
                    </div>
                  </div>

                  <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200/70 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                    {op.match} match
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Container>

      {/* Soft Cloud Deck along Section Horizon */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 sm:h-32 overflow-hidden z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute bottom-0 w-full h-full opacity-90 preserve-3d"
        >
          <path
            d="M0 120h1440V70c-40 5-85 10-130 5-65-7-110-35-175-30-70 5-115 40-190 35-65-4-105-25-170-22-75 3-125 32-195 28-65-4-110-30-175-25-70 5-120 38-190 32-75-6-130-22-215-18v25z"
            fill="white"
            fillOpacity="0.85"
          />
          <path
            d="M0 120h1440V90c-55 4-110-8-165-5-75 4-135 20-210 16-65-4-120-22-185-18-70 4-130 18-200 15-75-3-135-22-210-18-70 4-125 22-195 18-75-4-140-12-275-3v25z"
            fill="white"
            fillOpacity="0.95"
          />
        </svg>
      </div>
    </section>
  );
}
