import { motion } from 'framer-motion';
import { Container } from '../ui/Container.jsx';
import { Button } from '../ui/Button.jsx';
import { HeroComposite } from './HeroComposite.jsx';

const ease = [0.16, 0.84, 0.44, 1];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-paper pb-24 pt-16 sm:pb-28 lg:pb-36 lg:pt-24">
      {/* Layered depth: a soft radial glow behind a quiet grid wash. The
          composite still carries most of the visual weight. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(48% 40% at 22% 8%, rgba(74,120,245,.16), transparent 68%), radial-gradient(38% 34% at 92% 30%, rgba(109,74,232,.12), transparent 65%)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #E2E8F1 1px, transparent 1px), linear-gradient(to bottom, #E2E8F1 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 30% 20%, #000 20%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 30% 20%, #000 20%, transparent 75%)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-24 right-[-6rem] h-[26rem] w-[26rem] rounded-full bg-azure-400/10 blur-3xl"
        aria-hidden
      />

      <Container className="relative grid items-center gap-16 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-6">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="eyebrow"
          >
            Your AI-Powered Career Launchpad
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.06, ease }}
            className="mt-5 text-display font-extrabold"
          >
            Build a profile that
            <span className="block bg-gradient-to-r from-azure-600 via-azure to-violet bg-clip-text text-transparent">
              gets you noticed.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.14, ease }}
            className="mt-5 max-w-xl text-lead text-slate-600"
          >
            Build your professional profile, discover relevant opportunities, identify your career
            gaps and get personalised recommendations for education and upskilling — all in one
            connected platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22, ease }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Button to="/register" size="lg">
              Create My Profile
            </Button>
            <Button to="/jobs" variant="outline" size="lg">
              Explore Jobs
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.32 }}
            className="mt-5 text-small text-slate-500"
          >
            Free to create a profile — career services and courses are paid separately, never automatically.
          </motion.p>
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          <HeroComposite />
        </div>
      </Container>
    </section>
  );
}
