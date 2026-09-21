import { motion } from 'framer-motion';
import { Container } from '../ui/Container.jsx';
import { Breadcrumb } from '../ui/Breadcrumb.jsx';
import { Button } from '../ui/Button.jsx';
import { fadeUp, stagger } from '../../utils/motion.js';

/**
 * Shared header for every interior page. Ported from the LauncherDesk
 * "page-hero" pattern: a soft radial glow plus a hairline grid, masked to
 * the upper right, sitting above a light gradient wash — the same premium
 * hero treatment repeats identically on every page that uses this component.
 *
 * The heading column is capped at ~22ch so long titles ("Pick the degree for
 * the job, not the brochure.") break into two balanced lines instead of
 * stretching edge-to-edge or wrapping awkwardly at the h1 scale.
 */
export function PageHero({ eyebrow, title, lead, breadcrumb, actions, aside, tone = 'paper' }) {
  const dark = tone === 'ink';
  const surfaceClass = dark ? 'surface-dark' : tone === 'white' ? 'bg-white border-b border-line' : 'surface-hero';

  return (
    <section className={surfaceClass}>
      <Container className={`py-11 lg:py-14 ${dark ? 'relative z-[1]' : ''}`}>
        {breadcrumb && !dark && <Breadcrumb items={breadcrumb} />}
        <motion.div
          variants={stagger(0.08)}
          initial="hidden"
          animate="show"
          className="grid gap-8 lg:grid-cols-12 lg:gap-12"
        >
          <div className="lg:col-span-7">
            {eyebrow && (
              <motion.p variants={fadeUp} className={`mb-4 inline-flex ${dark ? 'eyebrow-dark' : 'eyebrow'}`}>
                {eyebrow}
              </motion.p>
            )}
            <motion.h1
              variants={fadeUp}
              className={`max-w-[22ch] text-h1 font-extrabold ${dark ? 'text-white' : ''}`}
            >
              {title}
            </motion.h1>
            {lead && (
              <motion.p
                variants={fadeUp}
                className={`mt-4 max-w-prose text-lead ${dark ? 'text-slate-300' : 'text-slate-600'}`}
              >
                {lead}
              </motion.p>
            )}
            {actions && (
              <motion.div variants={fadeUp} className="mt-7 flex flex-col gap-3 sm:flex-row">
                {actions}
              </motion.div>
            )}
          </div>
          {aside && (
            <motion.div variants={fadeUp} className="lg:col-span-4 lg:col-start-9">
              {aside}
            </motion.div>
          )}
        </motion.div>
      </Container>
    </section>
  );
}

export function HeroActions({ primary, secondary, dark }) {
  return (
    <>
      {primary && (
        <Button to={primary.to} size="lg" variant={dark ? 'onInk' : 'primary'}>
          {primary.label}
        </Button>
      )}
      {secondary && (
        <Button to={secondary.to} size="lg" variant={dark ? 'outlineInk' : 'outline'}>
          {secondary.label}
        </Button>
      )}
    </>
  );
}
