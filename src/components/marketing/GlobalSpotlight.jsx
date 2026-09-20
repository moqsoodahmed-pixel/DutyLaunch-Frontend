import { motion } from 'framer-motion';
import { Globe2, MapPin, Plane, TrendingUp } from 'lucide-react';
import { Container } from '../ui/Container.jsx';
import { Button } from '../ui/Button.jsx';

const ease = [0.16, 0.84, 0.44, 1];

const OPPORTUNITIES = [
  { role: 'Operations Manager', city: 'Dubai, UAE', match: '92%', delay: 0 },
  { role: 'Registered Nurse', city: 'Riyadh, Saudi Arabia', match: '88%', delay: 0.15 },
  { role: 'Project Engineer', city: 'Doha, Qatar', match: '85%', delay: 0.3 },
];

/**
 * The one deliberately dark, high-contrast section on the site (spec: "at
 * least one strong dark premium section"). Everything else stays light —
 * this is where the global-mobility story gets room to breathe.
 */
export function GlobalSpotlight() {
  return (
    <section className="relative overflow-hidden bg-ink-900 py-section text-white">
      <div className="pointer-events-none absolute inset-0 bg-ink-glow" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
        aria-hidden
      />

      <Container className="relative grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-12">
        <div className="lg:col-span-6">
          <span className="eyebrow-dark">
            <Globe2 className="h-3.5 w-3.5" aria-hidden /> Global mobility
          </span>
          <h2 className="mt-5 text-h1 font-extrabold text-white">
            Take your career <span className="text-azure-200">global.</span>
          </h2>
          <p className="mt-5 max-w-lg text-lead text-slate-300">
            From the Gulf to further afield, we handle the parts that stop most applications: the
            right role, the paperwork behind it, and a profile that survives translation into a new
            market.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button to="/dubai-job-seeker-package" size="lg" variant="onInk">
              Explore the Dubai package
            </Button>
            <Button to="/documentation" size="lg" variant="outlineInk">
              Documentation services
            </Button>
          </div>
        </div>

        <div className="relative lg:col-span-6">
          <div className="space-y-3.5">
            {OPPORTUNITIES.map((op) => (
              <motion.div
                key={op.role}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.55, delay: op.delay, ease }}
                className="glass-card flex items-center justify-between gap-4 p-4 sm:p-5"
              >
                <div className="flex items-center gap-3.5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10">
                    <Plane className="h-5 w-5 text-azure-200" aria-hidden />
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
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 animate-float rounded-full bg-violet-500/20 blur-3xl" aria-hidden />
        </div>
      </Container>
    </section>
  );
}
