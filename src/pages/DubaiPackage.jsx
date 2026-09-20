import * as Icons from 'lucide-react';
import { Seo } from '../components/ui/Seo.jsx';
import { Container, Section } from '../components/ui/Container.jsx';
import { SectionHeader } from '../components/ui/SectionHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { PageHero, HeroActions } from '../components/marketing/PageHero.jsx';
import { ConsultationForm } from '../components/marketing/ConsultationForm.jsx';
import { CTASection } from '../components/marketing/CTASection.jsx';
import { globalMobility } from '../data/site.js';
import { serviceSchema } from '../utils/seo.js';

/**
 * A hand-built skyline rather than a stock photograph of Dubai. It is drawn
 * from the brand palette, weighs under 2kB, and does not misrepresent a place
 * we have no licensed photography of.
 */
function GulfSkyline() {
  const towers = [
    [0, 46, 22], [26, 62, 18], [48, 30, 14], [66, 74, 16], [86, 54, 20],
    [110, 20, 12], [126, 66, 22], [152, 40, 16], [172, 70, 18], [194, 52, 14],
  ];
  return (
    <svg viewBox="0 0 212 100" className="h-auto w-full" role="img" aria-label="Stylised Gulf city skyline at dusk">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0B1B33" />
          <stop offset="100%" stopColor="#1B3558" />
        </linearGradient>
      </defs>
      <rect width="212" height="100" fill="url(#sky)" rx="6" />
      <circle cx="176" cy="24" r="9" fill="#D98A15" opacity="0.85" />
      {towers.map(([x, h, w]) => (
        <g key={x}>
          <rect x={x + 4} y={96 - h} width={w} height={h} fill="#07142A" opacity="0.92" rx="1.5" />
          {Array.from({ length: Math.floor(h / 10) }).map((_, row) => (
            <rect
              key={row}
              x={x + 7}
              y={100 - h + row * 10}
              width={w - 6}
              height="2.5"
              fill="#4A78F5"
              opacity={row % 3 === 0 ? 0.55 : 0.28}
              rx="1"
            />
          ))}
        </g>
      ))}
      {/* A spire, to keep the silhouette from reading as a generic bar chart. */}
      <path d="M100 96 L104 26 L106 20 L108 26 L112 96 Z" fill="#07142A" />
      <line x1="0" y1="96" x2="212" y2="96" stroke="#D98A15" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

export default function DubaiPackage() {
  return (
    <>
      <Seo
        title="UAE job seeker package"
        description="Gulf job search, CV distribution, interview support, visa guidance, accommodation, airport pickup and relocation planning for candidates moving to Dubai and the wider UAE."
        schema={serviceSchema({
          name: 'UAE job seeker package',
          description:
            'Job search, CV distribution, interview support, visa guidance and relocation assistance for the UAE.',
          path: '/dubai-job-seeker-package',
        })}
      />

      <PageHero
        tone="ink"
        eyebrow="Global mobility"
        title="Take your career global."
        lead="Moving to the Gulf for work is four problems at once: being found by employers who hire from abroad, being interviewed across time zones, getting the paperwork right in the right order, and surviving your first week. This package covers all four."
        actions={
          <HeroActions
            dark
            primary={{ label: 'Book a free consultation', to: '/contact#consultation' }}
            secondary={{ label: 'Documentation & attestation', to: '/documentation' }}
          />
        }
        aside={
          <div className="overflow-hidden rounded-lg border border-white/10">
            <GulfSkyline />
          </div>
        }
      />

      <Section tone="sand">
        <Container>
          <SectionHeader
            label="What is included"
            title="Eight services, one coordinator."
            lead="You deal with one person across the whole move rather than a search consultant, a visa agent and a relocation broker who never speak."
          />
          <div className="mt-10 grid gap-px overflow-hidden rounded-lg bg-sand-400 sm:grid-cols-2 lg:grid-cols-4">
            {globalMobility.services.map((service) => {
              const Icon = Icons[service.icon] || Icons.Circle;
              return (
                <article key={service.title} className="bg-sand-200 p-5">
                  <Icon className="h-5 w-5 text-ink-700" aria-hidden />
                  <h3 className="mt-3 text-body font-bold text-ink">{service.title}</h3>
                  <p className="mt-1.5 text-small text-slate-700">{service.body}</p>
                </article>
              );
            })}
          </div>
        </Container>
      </Section>

      <Section tone="white">
        <Container>
          <SectionHeader
            label="Sequence"
            title="The order things have to happen in."
            lead="Getting this wrong is the single most common cause of a delayed move — attestation started after the offer, for instance, rather than before the search."
          />
          <ol className="mt-12 grid gap-8 lg:grid-cols-4">
            {globalMobility.timeline.map((phase, i) => (
              <li key={phase.when} className="relative border-t-2 border-ink-800 pt-5">
                <span className="tabular absolute -top-3 left-0 bg-white pr-3 text-caption font-bold text-amber-600">
                  Phase {i + 1}
                </span>
                <h3 className="text-body font-bold text-ink">{phase.when}</h3>
                <p className="mt-2 text-small text-slate-600">{phase.what}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section tone="paper" id="relocation">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <h2 className="text-h2 font-bold">What we will not promise</h2>
              <div className="mt-5 space-y-4 text-body text-slate-600">
                <p>
                  We do not guarantee a job offer, and we do not guarantee a visa. Both decisions belong to employers
                  and to the UAE authorities, and any agency that promises otherwise is either misinformed or lying.
                </p>
                <p>
                  What we control is the quality of your application, how widely and how well it is distributed, how
                  prepared you are for the interview, and whether your documents are ready when an offer arrives. That
                  last one decides how many offers survive to a start date.
                </p>
                <p>
                  Employment visas in the UAE are normally sponsored by the employer. If someone asks you to pay them
                  for a work visa directly, stop and call us first.
                </p>
              </div>
              <Button to="/faq" variant="outline" className="mt-7">
                Read the Gulf-specific questions
              </Button>
            </div>

            <div className="lg:col-span-5 lg:col-start-8">
              <div className="tile p-6">
                <h2 className="text-h3 font-bold text-ink">Start the conversation</h2>
                <p className="mt-2 text-small text-slate-600">
                  Tell us your field and your timeline. A counsellor will call you within one working day.
                </p>
                <div className="mt-6">
                  <ConsultationForm defaultService="UAE job seeker package" compact />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <CTASection
        title="Already have an offer in hand?"
        body="Then the priority shifts to documents and the visa sequence. Bring the offer letter and we will map out what your employer will ask for and by when."
        primary={{ label: 'Book a free consultation', to: '/contact#consultation' }}
        secondary={{ label: 'Attestation and apostille', to: '/documentation' }}
      />
    </>
  );
}
