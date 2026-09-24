import { useState } from 'react';
import { GraduationCap, MapPin, CalendarDays } from 'lucide-react';
import { Seo } from '../components/ui/Seo.jsx';
import { Container, Section } from '../components/ui/Container.jsx';
import { SectionHeader } from '../components/ui/SectionHeader.jsx';
import { Reveal, RevealGroup, RevealItem } from '../components/ui/Reveal.jsx';
import { Tabs } from '../components/ui/Tabs.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { CardSkeleton, EmptyState, ErrorState } from '../components/ui/States.jsx';
import { PageHero, HeroActions } from '../components/marketing/PageHero.jsx';
import { CTASection } from '../components/marketing/CTASection.jsx';
import { ItemGroups } from '../components/marketing/ItemGroups.jsx';
import { useApi } from '../hooks/useApi.js';
import { educationService } from '../services/contentService.js';
import { educationJourney } from '../data/site.js';
import { serviceSchema } from '../utils/seo.js';
import { images } from '../data/images.js';
import { SiteImage } from '../components/ui/SiteImage.jsx';
import { MousePointerClick } from 'lucide-react';
import { SCHOOL, DEGREES, programmeHref } from '../data/programmes.js';



export default function HigherEducation() {
  const [level, setLevel] = useState('');
  const { data: filters } = useApi(() => educationService.filters(), []);
  const { data, loading, error, refetch } = useApi(
    () => educationService.programs({ level: level || undefined, limit: 12 }),
    [level]
  );

  const levelOptions = [
    { value: '', label: 'All levels' },
    ...((filters?.levels || []).map((l) => ({ value: l, label: l }))),
  ];

  return (
    <>
      <Seo
        title="Higher education"
        description="Study abroad guidance from DutyLaunch: shortlisting programmes against budget and post-study work rules, applications, statements of purpose, funding and visa paperwork."
        schema={serviceSchema({
          name: 'Higher education guidance',
          description: 'Programme shortlisting, applications, statements of purpose, funding and student visa guidance.',
          path: '/higher-education',
        })}
      />

      <PageHero
        eyebrow="Upskills"
        title="Higher Education"
        lead="Complete your academic journey with recognized programs designed to help you achieve your career goals. Explore flexible learning options from school education to postgraduate degrees."
        breadcrumb={[{ label: 'Upskills', to: '/upskills' }, { label: 'Higher Education' }]}
        actions={
          <HeroActions
            primary={{ label: 'Book a free consultation', to: '/contact#consultation' }}
            secondary={{ label: 'See programmes', to: '#programmes' }}
          />
        }
        aside={<SiteImage image={images.campus} priority className="mx-auto lg:ml-auto lg:mr-0" />}
      />

      <Section tone="white">
        <Container>
          <ItemGroups groups={SCHOOL} columns="sm:grid-cols-2" itemHref={(item) => programmeHref('education', item)} />
          <ItemGroups groups={DEGREES} className="mt-4" itemHref={(item) => programmeHref('education', item)} />
          <p className="mt-6 inline-flex items-center gap-2 text-small text-slate-500">
            <MousePointerClick className="h-4 w-4 text-azure" aria-hidden />
            Select any programme to see partner institutes.
          </p>
        </Container>
      </Section>

      {/* Education journey — a horizontal rail, deliberately unlike the homepage's vertical one. */}
      <Section tone="ink">
        <Container>
          <Reveal>
            <SectionHeader
              tone="dark"
              label="The process"
              title="Five stages, in this order."
              lead="Most applicants start at stage two and discover the first stage was the one that mattered."
            />
          </Reveal>
          <RevealGroup as="ol" className="mt-12 grid gap-px overflow-hidden rounded-lg bg-white/10 md:grid-cols-5" staggerDelay={0.07}>
            {educationJourney.map((stage, i) => (
              <RevealItem
                as="li"
                key={stage.stage}
                className="bg-ink-800 p-5 transition-colors duration-200 hover:bg-ink-700"
              >
                <span className="tabular text-caption font-bold text-amber-500">0{i + 1}</span>
                <h3 className="mt-2 text-body font-bold text-white">{stage.stage}</h3>
                <p className="mt-2 text-small text-slate-300">{stage.detail}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </Section>

      <Section tone="white" id="programmes">
        <Container>
          <Reveal>
            <SectionHeader
              label="Programmes"
              title="What we advise on."
              lead="Indicative programme families rather than a list of institutions — the shortlist is built for your budget, intake and target market in the consultation."
              aside={
                <div className="mt-6">
                  <Tabs options={levelOptions} value={level} onChange={setLevel} label="Filter by level" />
                </div>
              }
            />
          </Reveal>

          <div className="mt-10">
            {loading && <CardSkeleton count={6} />}
            {error && <ErrorState error={error} onRetry={refetch} />}
            {!loading && !error && !data?.length && (
              <EmptyState
                title="No programmes published yet"
                description="Programmes are stored in MongoDB and seeded with the seed script."
              />
            )}
            {!loading && data?.length > 0 && (
              <RevealGroup className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" staggerDelay={0.06}>
                {data.map((program) => (
                  <RevealItem as="article" key={program._id} className="tile flex flex-col p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="azure">{program.level}</Badge>
                      <Badge tone="outline">{program.field}</Badge>
                    </div>
                    <h3 className="mt-3.5 text-h3 font-bold leading-snug text-ink">{program.title}</h3>
                    <p className="mt-2 flex-1 text-small text-slate-600">{program.summary}</p>

                    <dl className="mt-5 space-y-2 border-t border-line pt-4 text-caption text-slate-500">
                      {program.duration && (
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-3.5 w-3.5" aria-hidden />
                          <dt className="sr-only">Duration</dt>
                          <dd>{program.duration}</dd>
                        </div>
                      )}
                      {program.intakes?.length > 0 && (
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                          <dt className="sr-only">Intakes</dt>
                          <dd>{program.intakes.join(', ')}</dd>
                        </div>
                      )}
                      {program.destinations?.length > 0 && (
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                          <dt className="sr-only">Destinations</dt>
                          <dd>{program.destinations.join(' · ')}</dd>
                        </div>
                      )}
                    </dl>
                  </RevealItem>
                ))}
              </RevealGroup>
            )}
          </div>
        </Container>
      </Section>

      <Section tone="paper">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-5">
              <h2 className="max-w-[16ch] text-h2 font-bold">What the guidance covers</h2>
              <p className="mt-4 max-w-md text-lead text-slate-600">
                The application itself is a small part of it. Most of the work is upstream and downstream.
              </p>
              <Button to="/contact#consultation" className="mt-7">
                Book a free consultation
              </Button>
            </Reveal>
            <RevealGroup className="lg:col-span-6 lg:col-start-7" staggerDelay={0.05}>
              <dl className="divide-y divide-line border-y border-line">
                {[
                  ['Shortlisting', 'Against budget, entry requirements, intake dates and post-study work rules in each destination.'],
                  ['Statement of purpose', 'Structured and edited, written by you with our editing rather than ghostwritten — admissions teams can tell.'],
                  ['Academic CV and references', 'Formatted to the institution\u2019s expectations, with guidance on who to ask and how.'],
                  ['Funding', 'Scholarship search, financial documentation and what each country expects you to evidence.'],
                  ['Visa paperwork', 'Document checklists, attestation where required, and the sequence to do it in.'],
                  ['Arrival planning', 'Accommodation, part-time work rules and the graduate job search before you land.'],
                ].map(([term, detail]) => (
                  <RevealItem key={term} className="py-4">
                    <dt className="text-body font-bold text-ink">{term}</dt>
                    <dd className="mt-1 text-body text-slate-600">{detail}</dd>
                  </RevealItem>
                ))}
              </dl>
            </RevealGroup>
          </div>
        </Container>
      </Section>

      <CTASection
        title="Ready to Take the Next Step in Your Career?"
        body="Your dream career starts with the right guidance. Whether you’re looking for a better job, planning higher education, relocating abroad, or improving your professional profile, DutyLaunch is here to support you at every stage of your journey."
        primary={{ label: 'Book Free Consultation', to: '/contact#consultation' }}
        secondary={{ label: 'Documentation and attestation', to: '/documentation' }}
      />
    </>
  );
}