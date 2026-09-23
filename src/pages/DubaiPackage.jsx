import * as Icons from 'lucide-react';
import { Seo } from '../components/ui/Seo.jsx';
import { Container, Section } from '../components/ui/Container.jsx';
import { SectionHeader } from '../components/ui/SectionHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { PageHero, HeroActions } from '../components/marketing/PageHero.jsx';
import { ConsultationForm } from '../components/marketing/ConsultationForm.jsx';
import { CTASection } from '../components/marketing/CTASection.jsx';
import { globalMobility } from '../data/site.js';

/* Content from dutylaunch.com/dubai-job-seekers-package — the "What's
   Included" list, in the live site's order. */
const INCLUDED = [
  { title: 'UAE Visit Visa Assistance', icon: 'BadgeCheck' },
  { title: 'Flight Ticket Assistance', icon: 'Plane' },
  { title: 'Bedspace / Accommodation Assistance', icon: 'Home' },
  { title: 'Airport Pickup', icon: 'Car' },
  { title: 'SIM Card Assistance', icon: 'Smartphone' },
  { title: 'NOL Card Assistance', note: 'Dubai public transport card', icon: 'CreditCard' },
  { title: 'CV Distribution to Employers', icon: 'Send' },
  { title: 'Interview Guidance', icon: 'MessagesSquare' },
  { title: 'Job Search Support', icon: 'Search' },
  { title: 'Relocation Guidance', icon: 'Map' },
];
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
        title="Dubai Launch"
        description="Take the stress out of finding a job in Dubai. DutyLaunch provides complete guidance — from profile preparation and job applications to interview support and relocation assistance."
        schema={serviceSchema({
          name: 'Dubai Launch',
          description:
            'Complete guidance for finding a job in Dubai — profile preparation, job applications, interview support and relocation assistance.',
          path: '/dubai-job-seeker-package',
        })}
      />

      <PageHero
        tone="ink"
        eyebrow="Dubai Launch"
        title="Take the stress out of finding a job in Dubai."
        lead="DutyLaunch provides complete guidance—from profile preparation and job applications to interview support and relocation assistance—helping you move confidently toward your international career."
        actions={
          <HeroActions
            dark
            primary={{ label: 'Talk to Our Experts', to: '/contact#consultation' }}
            secondary={{ label: 'Appostle Services', to: '/documentation' }}
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
            label="What's Included"
            title="Your Career in the UAE Starts Here"
            lead="Whether you’re a fresher or an experienced professional, our experts ensure you’re ready for the UAE job market with personalized support at every stage."
          />
          <div className="mt-10 grid gap-px overflow-hidden rounded-lg bg-sand-400 sm:grid-cols-2 lg:grid-cols-5">
            {INCLUDED.map((service) => {
              const Icon = Icons[service.icon] || Icons.Circle;
              return (
                <article key={service.title} className="bg-sand-200 p-5">
                  <Icon className="h-5 w-5 text-ink-700" aria-hidden />
                  <h3 className="mt-3 text-body font-bold text-ink">{service.title}</h3>
                  {service.note && <p className="mt-1.5 text-small text-slate-700">{service.note}</p>}
                </article>
              );
            })}
          </div>
          <div className="mt-8">
            <Button to="/contact#consultation">Talk to Our Experts</Button>
          </div>
        </Container>
      </Section>

      <Section tone="white">
        <Container size="narrow">
          <SectionHeader
            align="stack"
            title="Who This Is For"
            lead="Job seekers relocating to Dubai or the wider UAE who want a structured, supported transition — with a team that has done this before — rather than piecing the process together alone."
          />
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
        title="Ready to Take the Next Step in Your Career?"
        body="Your dream career starts with the right guidance. Whether you’re looking for a better job, planning higher education, relocating abroad, or improving your professional profile, DutyLaunch is here to support you at every stage of your journey."
        primary={{ label: 'Book Free Consultation', to: '/contact#consultation' }}
        secondary={{ label: 'Appostle Services', to: '/documentation' }}
      />
    </>
  );
}