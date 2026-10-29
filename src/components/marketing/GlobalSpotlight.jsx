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
 * Shows international career opportunities from India to Gulf destinations
 * (Dubai, Riyadh, Doha) matching the reference design.
 */
export function GlobalSpotlight() {
  const reduceMotion = usePrefersReducedMotion();
  const [activeFlight, setActiveFlight] = useState(null);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#EBF5FF] via-[#E2F1FD] to-[#F0F9FF] py-20 lg:py-28">
      {/* Subtle background dotted map texture for visual depth */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.28]"
        style={{
          backgroundImage: 'radial-gradient(#38BDF8 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <Container className="relative z-10 grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-10 xl:gap-14">
        {/* Left Column: Heading, Value Proposition & Actions */}
        <div className="lg:col-span-6 xl:col-span-5">
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

          <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-700">
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
        </div>

        {/* Right Column: 3D Interactive Globe with 3 Simultaneous Flights & Job Cards */}
        <div className="relative flex flex-col items-center lg:col-span-6 xl:col-span-7">
          {/* Globe Canvas Container */}
          <div className="relative h-[22rem] w-full max-w-[24rem] sm:h-[26rem] sm:max-w-[28rem] lg:h-[28rem] lg:max-w-[32rem] xl:h-[30rem] xl:max-w-[34rem]">
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

          {/* Foreground Career Opportunity Cards */}
          <div className="relative z-20 -mt-16 w-full max-w-lg space-y-3 sm:-mt-20 lg:-mt-28">
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
                  className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl border bg-white/95 p-3.5 shadow-[0_12px_32px_-12px_rgba(29,93,184,0.18)] backdrop-blur-md transition-all duration-300 sm:p-4.5 ${
                    isHovered
                      ? 'border-azure-400 shadow-[0_16px_36px_-10px_rgba(29,93,184,0.32)] ring-2 ring-azure-400/25 -translate-y-0.5'
                      : 'border-slate-200/80 hover:border-azure-300 hover:shadow-[0_14px_34px_-10px_rgba(29,93,184,0.24)]'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-colors duration-200 ${
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
