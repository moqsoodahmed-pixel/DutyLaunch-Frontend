import { Container } from '../ui/Container.jsx';
import { Button } from '../ui/Button.jsx';
import { Reveal } from '../ui/Reveal.jsx';

/**
 * One closing call to action per page, with a different pairing each time —
 * repeating the same CTA block is one of the things this rebuild fixes.
 *
 * Layout: on xl screens the text takes the remaining width and the button
 * column sizes to its content (`1fr auto`), so two long labels such as
 * "Book a free consultation" + "See what is in each service" always fit on
 * one line each. Below xl the buttons sit under the copy; on mobile they
 * stack full-width.
 */
export function CTASection({
  title = 'Not sure where to start?',
  body = 'Tell us where you are and what you are aiming at. The first consultation is free, and we will tell you if a service is not right for you.',
  primary = { label: 'Book a free consultation', to: '/contact#consultation' },
  secondary = { label: 'Read common questions', to: '/faq' },
  tone = 'ink',
}) {
  // Closing band: one of the few deep-navy surfaces on the site, so the final
  // action is visually distinct from the pale sections above it. `sand` keeps
  // its warm light tone for the pages that asked for it.
  const navy = tone === 'ink' || tone === 'mist';

  return (
    // `cta-dark` tells the footer to skip its top fade when this is the last block.
    <section
      className={
        navy
          ? 'cta-dark relative overflow-hidden bg-ink-800 text-white'
          : 'seam seam-tone-sand'
      }
    >
      {navy && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(60% 90% at 90% 0%, rgba(79,193,230,0.16), transparent 65%)' }}
          aria-hidden
        />
      )}
      <Container className="relative py-12 lg:py-14">
        <Reveal className="grid items-center gap-8 xl:grid-cols-[minmax(0,1fr)_auto] xl:gap-14">
          <div>
            <h2 className={`max-w-[24ch] text-h2 font-bold ${navy ? 'text-white' : 'text-ink'}`}>{title}</h2>
            <p className={`mt-3 max-w-prose text-lead ${navy ? 'text-slate-200' : 'text-slate-700'}`}>{body}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap xl:flex-nowrap xl:justify-end">
            <Button
              to={primary.to}
              size="lg"
              variant={navy ? 'onInk' : 'primary'}
              className="w-full sm:w-auto"
            >
              {primary.label}
            </Button>
            {secondary && (
              <Button
                to={secondary.to}
                size="lg"
                variant={navy ? 'onInkOutline' : 'secondary'}
                className="w-full sm:w-auto"
              >
                {secondary.label}
              </Button>
            )}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}