import { Seo } from '../components/ui/Seo.jsx';
import { Container, Section } from '../components/ui/Container.jsx';
import { SectionHeader } from '../components/ui/SectionHeader.jsx';
import { Reveal, RevealGroup, RevealItem } from '../components/ui/Reveal.jsx';
import { PageHero, HeroActions } from '../components/marketing/PageHero.jsx';
import { CTASection } from '../components/marketing/CTASection.jsx';
import { pillars } from '../data/site.js';
import { images } from '../data/images.js';
import { SiteImage } from '../components/ui/SiteImage.jsx';

const principles = [
  {
    title: 'Advice before product',
    body: 'Every engagement starts with a free consultation whose job is to work out what you need — which is sometimes less than you came in asking for. We would rather lose the sale than sell a rewrite to someone whose CV is fine and whose targeting is not.',
  },
  {
    title: 'Published prices',
    body: 'CV bundles are priced openly by experience band. Where a price genuinely varies — attestation costs differ by issuing state and destination country — we confirm the figure in writing before you pay anything.',
  },
  {
    title: 'One thread, not five vendors',
    body: 'The same conversation covers the CV, the course, the job search, the visa paperwork and the attestation. Most people currently run those through separate agents who never speak to each other.',
  },
  {
    title: 'Plain language',
    body: 'No guaranteed placements, no promises about visa outcomes we do not control, no invented statistics. Where an outcome depends on an employer or a government department, we say so.',
  },
];

export default function About() {
  return (
    <>
      <Seo
        title="About DutyLaunch"
        description="DutyLaunch brings career services, education guidance, job search, global mobility and documentation into one process, with published prices and advice that comes before the sale."
      />

      <PageHero
        eyebrow="About us"
        title="One team for the career, the qualification and the paperwork."
        lead="Most people moving forward in their careers end up managing four or five separate providers — a CV writer, a course counsellor, a recruitment consultant, a visa agent, a documentation broker. None of them see the whole picture. DutyLaunch exists to be the one that does."
        breadcrumb={[{ label: 'About' }]}
        actions={<HeroActions primary={{ label: 'Book a free consultation', to: '/contact#consultation' }} secondary={{ label: 'Browse services', to: '/career-services' }} />}
        aside={<SiteImage image={images.careerGrowth} priority className="mx-auto lg:ml-auto lg:mr-0" />}
      />

      <Section tone="white">
        <Container>
          <div>
            <Reveal className="max-w-3xl">
              <h2 className="text-h2 font-bold">What we do</h2>
              <p className="mt-3 max-w-2xl text-lead text-slate-600">
                Five connected practices. Most clients use two or three of them over a year rather than all five at once.
              </p>
            </Reveal>
            <RevealGroup className="mt-10" staggerDelay={0.05}>
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pillars.map((pillar) => (
                  <RevealItem key={pillar.id} className="tile p-5">
                    <dt className="text-body font-bold text-ink">{pillar.label}</dt>
                    <dd className="mt-1 text-body text-slate-600">{pillar.summary}</dd>
                  </RevealItem>
                ))}
              </dl>
            </RevealGroup>
          </div>
        </Container>
      </Section>

      <Section tone="paper">
        <Container>
          <Reveal>
            <SectionHeader
              label="How we operate"
              title="Four principles that decide what we sell."
              lead="These are the rules we apply internally. They are published here so you can hold us to them."
            />
          </Reveal>
          <RevealGroup className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2" staggerDelay={0.08}>
            {principles.map((item, i) => (
              <RevealItem
                key={item.title}
                className="rounded-lg border-t-2 border-ink-800 px-1 pt-5 transition-transform duration-200 hover:-translate-y-0.5"
              >
                <p className="tabular text-caption font-bold text-azure">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="mt-2 text-h3 font-bold text-ink">{item.title}</h3>
                <p className="mt-3 text-body text-slate-600">{item.body}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </Section>

      <Section tone="white">
        <Container size="narrow">
          <Reveal>
          <h2 className="text-h2 font-bold">Who we are</h2>
          <div className="mt-5 space-y-4 text-body text-slate-600">
            <p>
              DutyLaunch is a career, education and global-mobility practice working with candidates in India and the
              Gulf. Our counsellors come from recruitment, higher-education admissions and documentation processing —
              the three places where candidates most often lose time.
            </p>
            <p>
              We do not publish headcounts, client totals or success rates, because figures like those are easy to
              inflate and impossible for you to verify. What we will tell you plainly, in your first conversation, is
              whether we have worked on cases like yours before and what happened.
            </p>
            <p className="rounded-lg border border-dashed border-line bg-paper p-5 text-small">
              <strong className="font-semibold text-ink">A note for the DutyLaunch team:</strong> founding story,
              registered entity name, year established, team profiles and any verifiable credentials should be added
              here. They are deliberately left out rather than invented — see the README for the full list of content
              still required.
            </p>
          </div>
          </Reveal>
        </Container>
      </Section>

      <CTASection
        title="Ask us something specific."
        body="The most useful first conversation is a concrete one: a role you want, a course you are weighing up, a document that needs attesting by a date."
        primary={{ label: 'Book a free consultation', to: '/contact#consultation' }}
        secondary={{ label: 'Send a message instead', to: '/contact' }}
      />
    </>
  );
}