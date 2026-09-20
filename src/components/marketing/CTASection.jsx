import { Container } from '../ui/Container.jsx';
import { Button } from '../ui/Button.jsx';

/**
 * One closing call to action per page, with a different pairing each time —
 * repeating the same CTA block is one of the things this rebuild fixes.
 */
export function CTASection({
  title = 'Not sure where to start?',
  body = 'Tell us where you are and what you are aiming at. The first consultation is free, and we will tell you if a service is not right for you.',
  primary = { label: 'Book a free consultation', to: '/contact#consultation' },
  secondary = { label: 'Read common questions', to: '/faq' },
  tone = 'ink',
}) {
  const dark = tone === 'ink';

  return (
    <section className={dark ? 'bg-ink-900 text-white' : 'bg-sand-200'}>
      <Container className="py-16 lg:py-20">
        <div className="grid items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className={`text-h2 font-bold ${dark ? 'text-white' : 'text-ink'}`}>{title}</h2>
            <p className={`mt-3 max-w-prose text-lead ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{body}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:justify-end">
            <Button to={primary.to} size="lg" variant={dark ? 'onInk' : 'primary'}>
              {primary.label}
            </Button>
            {secondary && (
              <Button to={secondary.to} size="lg" variant={dark ? 'outlineInk' : 'outline'}>
                {secondary.label}
              </Button>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
