import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Container, Section } from '../ui/Container.jsx';
import { SectionHeader } from '../ui/SectionHeader.jsx';
import { journey } from '../../data/site.js';
import { revealOnce } from '../../utils/motion.js';

/**
 * The signature section. This content genuinely is a sequence, so it is
 * numbered and rendered on a continuous rail — the stage marker sits on the
 * line, and the supporting services hang off the right.
 */
export function JourneyRail() {
  return (
    <Section tone="ink">
      <Container>
        <SectionHeader
          tone="dark"
          label="How it works"
          title="Five stages, and honest advice at each one"
          lead="Most people arrive mid-way through. Start wherever you actually are — you do not have to use all five."
        />

        <ol className="relative mt-14">
          {/* The rail itself */}
          <span className="absolute left-[11px] top-2 hidden h-[calc(100%-2rem)] w-px bg-white/15 sm:block" aria-hidden />

          {journey.map((step, index) => (
            <motion.li
              key={step.stage}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={revealOnce}
              transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 0.84, 0.44, 1] }}
              className="relative grid gap-4 border-b border-white/10 py-8 first:pt-0 last:border-0 last:pb-0 sm:pl-12 lg:grid-cols-12 lg:gap-8"
            >
              <span
                className="absolute left-0 top-9 hidden h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-ink-900 text-caption font-bold text-azure-200 first:top-1 sm:flex"
                style={{ top: index === 0 ? '0.15rem' : '2.15rem' }}
                aria-hidden
              >
                {index + 1}
              </span>

              <div className="lg:col-span-4">
                <h3 className="text-h2 font-bold text-white">{step.stage}</h3>
                <p className="mt-1.5 text-body text-azure-200">{step.lead}</p>
              </div>

              <div className="lg:col-span-5">
                <p className="max-w-prose text-body text-slate-300">{step.detail}</p>
              </div>

              <div className="lg:col-span-3">
                <ul className="space-y-1.5">
                  {step.support.map((item) => (
                    <li key={item} className="text-small text-slate-400">
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  to={step.link.to}
                  className="mt-4 inline-flex items-center gap-1.5 text-small font-semibold text-white underline-offset-4 hover:underline"
                >
                  {step.link.label}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </motion.li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
