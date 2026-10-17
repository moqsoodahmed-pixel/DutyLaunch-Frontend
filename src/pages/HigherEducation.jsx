import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, MapPin, CalendarDays, Clock, FileText, Building2 } from 'lucide-react';
import { Seo } from '../components/ui/Seo.jsx';
import { seoFor } from '../data/seoPages.js';
import { Container, Section } from '../components/ui/Container.jsx';
import { SectionHeader } from '../components/ui/SectionHeader.jsx';
import { Reveal, RevealGroup, RevealItem } from '../components/ui/Reveal.jsx';
import { Tabs } from '../components/ui/Tabs.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { CardSkeleton, EmptyState, ErrorState } from '../components/ui/States.jsx';
import { PageHero, HeroActions } from '../components/marketing/PageHero.jsx';
import { GlacierBackdrop } from '../components/premium/GlacierBackdrop.jsx';
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
import { getMediaUrl } from '../utils/media.js';



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
        title={seoFor('higherEducation').title}
        description={seoFor('higherEducation').description}
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
        aside={<SiteImage image={images.campus} priority ratio="5 / 4" className="mx-auto w-full lg:ml-auto lg:mr-0" />}
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
      <Section tone="mist">
        <Container>
          <Reveal>
            <SectionHeader
              label="The process"
              title="Five stages, in this order."
              lead="Most applicants start at stage two and discover the first stage was the one that mattered."
            />
          </Reveal>
          <RevealGroup as="ol" className="mt-12 grid gap-px overflow-hidden rounded-lg border border-mist-line bg-mist-line md:grid-cols-5" staggerDelay={0.07}>
            {educationJourney.map((stage, i) => (
              <RevealItem
                as="li"
                key={stage.stage}
                className="bg-white p-5 transition-colors duration-200 hover:bg-mist-soft"
              >
                <span className="tabular text-caption font-bold text-azure">0{i + 1}</span>
                <h3 className="mt-2 text-body font-bold text-ink">{stage.stage}</h3>
                <p className="mt-2 text-small text-slate-700">{stage.detail}</p>
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
              lead="Indicative programme families rather than a list of institutions, the shortlist is built for your budget, intake and target market in the consultation."
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {data.map((program) => {
                  const inst = program.institution;
                  const instName = inst?.displayName || inst?.name || 'Partner University';
                  const instId = inst?._id || inst;
                  const targetUrl = instId ? `/universities/${instId}` : `/higher-education/${program.slug || program._id}`;
                  const hasSyllabus = Boolean(program.syllabusUrl);

                  return (
                    <article
                      key={program._id}
                      className="group flex flex-col justify-between rounded-2xl border border-line bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                    >
                      <div>
                        {/* Top Image with Overlapping Circular University Logo */}
                        <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
                          {program.image ? (
                            <img
                              src={program.image}
                              alt={program.title}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-tr from-azure-800 to-indigo-900 flex items-center justify-center p-4">
                              <GraduationCap className="h-12 w-12 text-white/50" />
                            </div>
                          )}

                          {/* Circular Logo Overlapping Bottom-Right */}
                          <div className="absolute -bottom-2.5 right-3 h-12 w-12 rounded-full border-2 border-white bg-white shadow-md overflow-hidden flex items-center justify-center">
                            {inst?.logoUrl ? (
                              <img
                                src={getMediaUrl(inst.logoUrl)}
                                alt=""
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                                className="h-full w-full object-contain p-1"
                              />
                            ) : (
                              <Building2 className="h-6 w-6 text-azure-700" />
                            )}
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 pt-5">
                          {/* University Name */}
                          <p className="text-caption font-semibold text-slate-500 uppercase tracking-wide truncate">
                            {instName}
                          </p>

                          {/* Programme Name */}
                          <h3
                            className="mt-1 text-body font-bold text-ink leading-snug line-clamp-2 min-h-[2.75rem]"
                            title={program.title}
                          >
                            {program.title}
                          </h3>

                          {/* Relevant Qualification or Programme Type */}
                          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center rounded-md bg-azure-50 px-2 py-0.5 text-caption font-medium text-azure-700">
                              {program.qualification || program.level || 'Degree'}
                            </span>
                            {program.deliveryFormat && (
                              <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-caption text-slate-600 capitalize">
                                {program.deliveryFormat}
                              </span>
                            )}
                          </div>

                          {/* Course Duration / Programme Detail */}
                          <div className="mt-3 flex items-center gap-1.5 text-caption text-slate-500">
                            <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{program.duration || 'Flexible duration'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer: View Program & Syllabus Buttons */}
                      <div className="p-4 pt-0 mt-2 border-t border-line/60 flex items-center gap-2">
                        <Link
                          to={targetUrl}
                          className="flex-1 inline-flex items-center justify-center rounded-lg bg-azure-600 hover:bg-azure-700 text-white px-3 py-2 text-caption font-semibold transition-colors shadow-sm text-center"
                        >
                          View Program
                        </Link>

                        {hasSyllabus ? (
                          <a
                            href={program.syllabusUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 text-caption font-semibold transition-colors shrink-0"
                            title="Download programme syllabus"
                          >
                            <FileText className="h-3.5 w-3.5 mr-1" />
                            Syllabus
                          </a>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400 px-2.5 py-2 text-caption font-medium cursor-not-allowed opacity-60 shrink-0"
                            title="Syllabus not available for this programme"
                          >
                            <FileText className="h-3.5 w-3.5 mr-1" />
                            Syllabus
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </Container>
      </Section>

      <Section tone="glacier" backdrop={<GlacierBackdrop />}>
        <Container>
          <div>
            <Reveal className="max-w-3xl">
              <h2 className="text-h2 font-bold">What the guidance covers</h2>
              <p className="mt-3 max-w-2xl text-lead text-slate-600">
                The application itself is a small part of it. Most of the work is upstream and downstream.
              </p>
              <Button to="/contact#consultation" className="mt-6">
                Book a free consultation
              </Button>
            </Reveal>
            <RevealGroup className="mt-10" staggerDelay={0.05}>
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ['Shortlisting', 'Against budget, entry requirements, intake dates and post-study work rules in each destination.'],
                  ['Statement of purpose', 'Structured and edited, written by you with our editing rather than ghostwritten, admissions teams can tell.'],
                  ['Academic CV and references', 'Formatted to the institution\u2019s expectations, with guidance on who to ask and how.'],
                  ['Funding', 'Scholarship search, financial documentation and what each country expects you to evidence.'],
                  ['Visa paperwork', 'Document checklists, attestation where required, and the sequence to do it in.'],
                  ['Arrival planning', 'Accommodation, part-time work rules and the graduate job search before you land.'],
                ].map(([term, detail]) => (
                  <RevealItem key={term} className="tile p-5">
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
        secondary={{ label: 'Documentation and attestation', to: '/apostille-services' }}
      />
    </>
  );
}