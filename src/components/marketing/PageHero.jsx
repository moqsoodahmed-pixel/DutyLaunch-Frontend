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
 * Balanced 6-column split ensures the left headline/CTA and right showcase
 * align with zero wasted vertical whitespace and 100% viewport harmony.
 */
export function PageHero({ eyebrow, title, lead, breadcrumb, actions, aside, tone = 'paper' }) {
  // `ink` (the old dark hero) now renders as the pale mist-blue hero with dark text.
  const mist = tone === 'ink' || tone === 'mist';
  const dark = false;
  const surfaceClass = mist ? 'surface-mist' : tone === 'white' ? 'seam seam-tone-white' : 'surface-hero';

  return (
    <section className={surfaceClass}>
      <Container className="py-8 lg:py-12">
        {breadcrumb && <Breadcrumb items={breadcrumb} />}
        <motion.div
          variants={stagger(0.08)}
          initial="hidden"
          animate="show"
          className="grid items-center gap-6 lg:grid-cols-12 lg:gap-8"
        >
          <div className={aside ? 'flex flex-col justify-center lg:col-span-6 xl:col-span-6' : 'flex flex-col justify-center lg:col-span-10 xl:col-span-9'}>
            {eyebrow && (
              <motion.p variants={fadeUp} className={`mb-3.5 inline-flex self-start ${dark ? 'eyebrow-dark' : 'eyebrow'}`}>
                {eyebrow}
              </motion.p>
            )}
            <motion.h1
              variants={fadeUp}
              className={`max-w-[20ch] text-h1 font-extrabold tracking-tight ${dark ? 'text-white' : 'text-ink'}`}
            >
              {title}
            </motion.h1>
            {lead && (
              <motion.p
                variants={fadeUp}
                className={`mt-3.5 max-w-prose text-lead leading-relaxed ${dark ? 'text-slate-300' : 'text-slate-700'}`}
              >
                {lead}
              </motion.p>
            )}
            {actions && (
              <motion.div variants={fadeUp} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                {actions}
              </motion.div>
            )}
          </div>
          {aside && (
            <div className="flex w-full items-center justify-center lg:col-span-6 xl:col-span-6">
              {aside}
            </div>
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
        <Button to={primary.to} size="lg">
          {primary.label}
        </Button>
      )}
      {secondary && (
        <Button to={secondary.to} size="lg" variant="secondary">
          {secondary.label}
        </Button>
      )}
    </>
  );
}

export default PageHero;