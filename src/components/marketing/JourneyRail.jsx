import { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Container, Section } from '../ui/Container.jsx';
import { SectionHeader } from '../ui/SectionHeader.jsx';
import { GlacierBackdrop } from '../premium/GlacierBackdrop.jsx';
import { journey } from '../../data/site.js';
import { revealOnce } from '../../utils/motion.js';
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery.js';

const ease = [0.16, 0.84, 0.44, 1];

// Stage marker states: idle (dark, before it scrolls into view) and lit.
const MARKER_IDLE = {
  backgroundColor: 'rgba(11,31,72,1)',
  borderColor: 'rgba(255,255,255,0.2)',
  color: '#93C5FD',
  boxShadow: '0 0 0 rgba(79,193,230,0)',
};
const MARKER_LIT = {
  backgroundColor: 'rgba(79,193,230,1)',
  borderColor: 'rgba(174,227,245,1)',
  color: '#0B1F48',
  boxShadow: '0 0 18px rgba(79,193,230,.55)',
};

/**
 * The signature section. This content genuinely is a sequence, so it is
 * numbered and rendered on a continuous rail — the stage marker sits on the
 * line, and the supporting services hang off the right.
 *
 * Motion: the rail fills with a frost→aurora gradient as the list scrolls
 * through the viewport (scroll-linked, so it tracks the reader rather than
 * playing on a timer), and each stage marker lights up as it enters view.
 * Under prefers-reduced-motion the rail is shown fully filled and markers
 * appear in their lit state, with no scroll-linked movement.
 */
export function JourneyRail() {
  const reduceMotion = usePrefersReducedMotion();
  const listRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 75%', 'end 60%'] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  return (
    <Section tone="ink" seamBottom="dark" backdrop={<GlacierBackdrop tone="dark" />}>
      <Container>
        <SectionHeader
          tone="dark"
          label="How it works"
          title="Five stages, and honest advice at each one"
          lead="Most people arrive mid-way through. Start wherever you actually are — you do not have to use all five."
        />

        <ol ref={listRef} className="relative mt-14">
          {/* The rail: a faint track, with the gradient fill drawn over it. */}
          <span className="absolute left-[11px] top-2 hidden h-[calc(100%-2rem)] w-px bg-white/10 sm:block" aria-hidden>
            <motion.span
              className="absolute inset-0 origin-top bg-gradient-to-b from-frost-400 via-azure-300 to-aurora-400 shadow-[0_0_12px_rgba(79,193,230,.6)]"
              style={reduceMotion ? undefined : { scaleY: fill }}
            />
          </span>

          {journey.map((step, index) => (
            <motion.li
              key={step.stage}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={revealOnce}
              transition={{ duration: 0.5, delay: index * 0.05, ease }}
              className="group relative grid gap-4 border-b border-white/10 py-8 first:pt-0 last:border-0 last:pb-0 sm:pl-12 lg:grid-cols-12 lg:gap-8"
            >
              {/* Stage marker — lights up (gradient fill + glow) once in view.
                  Under reduced motion it's rendered directly in its lit
                  state with no scroll-triggered animation at all. */}
              <motion.span
                className="absolute left-0 hidden h-6 w-6 items-center justify-center rounded-full border text-caption font-bold sm:flex"
                style={{ top: index === 0 ? '0.15rem' : '2.15rem', ...(reduceMotion ? MARKER_LIT : null) }}
                {...(reduceMotion
                  ? {}
                  : {
                    initial: MARKER_IDLE,
                    whileInView: MARKER_LIT,
                    viewport: { once: true, amount: 1, margin: '0px 0px -35% 0px' },
                    transition: { duration: 0.45, ease },
                  })}
                aria-hidden
              >
                {index + 1}
              </motion.span>

              <div className="lg:col-span-4">
                <h3 className="text-h2 font-bold text-white">{step.stage}</h3>
                <p className="mt-1.5 text-body text-frost-300">{step.lead}</p>
              </div>

              <div className="lg:col-span-5">
                <p className="max-w-prose text-body text-slate-300">{step.detail}</p>
              </div>

              <div className="lg:col-span-3">
                <ul className="space-y-1.5">
                  {step.support.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-small text-slate-400">
                      <span className="h-1 w-1 shrink-0 rounded-full bg-aurora-400" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  to={step.link.to}
                  className="group/link mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-small font-semibold text-white backdrop-blur transition-all duration-200 hover:border-frost-300/60 hover:bg-white/[0.12] hover:shadow-[0_0_20px_rgba(79,193,230,.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-frost-300"
                >
                  {step.link.label}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/link:translate-x-0.5" aria-hidden />
                </Link>
              </div>
            </motion.li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}