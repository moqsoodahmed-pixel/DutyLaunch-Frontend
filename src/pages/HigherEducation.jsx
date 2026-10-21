import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, MapPin, CalendarDays, Clock, FileText, Building2, ArrowRight, CheckCircle2, FileDown } from 'lucide-react';
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.map((program) => {
                  const inst = program.institution;
                  const instName = inst?.displayName || inst?.name || 'Partner University';
                  const instId = inst?._id || inst;
                  const targetUrl = instId ? `/universities/${instId}` : `/higher-education/${program.slug || program._id}`;
                  const hasSyllabus = Boolean(program.syllabusUrl);
                  const displayImage = program.image || inst?.coverImageUrl;
                  const delivery = (program.deliveryFormat || 'Regular').trim();
                  const isOnline = delivery.toLowerCase() === 'online';
                  const isHybrid = delivery.toLowerCase() === 'hybrid';
                  const feeAmount = typeof program.fee === 'number' && program.fee > 0 ? program.fee : null;

                  return (
                    <article
                      key={program._id}
                      className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white shadow-[0_2px_12px_-2px_rgba(15,28,46,0.06)] hover:shadow-[0_16px_36px_-8px_rgba(29,93,184,0.12)] hover:border-azure-400/80 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                    >
                      {/* Top ambient brand highlight line on hover */}
                      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-azure-500 via-indigo-500 to-azure-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />

                      <div>
                        {/* 1. Campus Visual Window (Top of Card) */}
                        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
                          {displayImage ? (
                            <img
                              src={getMediaUrl(displayImage)}
                              alt={program.title}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-tr from-slate-950 via-azure-950 to-indigo-900 flex items-center justify-center">
                              <GraduationCap className="h-12 w-12 text-white/20" />
                            </div>
                          )}

                          {/* Gradient Vignette */}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-black/20 pointer-events-none" />

                          {/* Top Floating Badges */}
                          <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 z-10">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-ink shadow-sm tracking-wide border border-white/60">
                              <GraduationCap className="h-3.5 w-3.5 text-azure-600" />
                              {program.qualification || program.level || 'Degree'}
                            </span>

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase backdrop-blur-md shadow-sm border ${
                                isOnline
                                  ? 'bg-emerald-950/75 text-emerald-200 border-emerald-500/30'
                                  : isHybrid
                                  ? 'bg-amber-950/75 text-amber-200 border-amber-500/30'
                                  : 'bg-slate-950/75 text-white border-white/20'
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  isOnline ? 'bg-emerald-400' : isHybrid ? 'bg-amber-400' : 'bg-azure-400'
                                }`}
                              />
                              {delivery}
                            </span>
                          </div>

                          {/* Bottom-right Fee Badge */}
                          {feeAmount && (
                            <div className="absolute bottom-2.5 right-3 z-10">
                              <span className="inline-flex items-center rounded-full bg-slate-950/85 backdrop-blur-md border border-white/25 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                                ₹{feeAmount.toLocaleString('en-IN')}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* 2. Card Body with Institution Details */}
                        <div className="p-5 pb-3">
                          {/* Institution Row */}
                          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                            <Link to={targetUrl} className="flex items-center gap-2 min-w-0 group/inst flex-1">
                              <div className="h-6 w-6 rounded-md bg-slate-50 border border-slate-200/80 flex items-center justify-center p-0.5 shrink-0 overflow-hidden shadow-2xs group-hover/inst:border-azure-300 transition-colors">
                                {inst?.logoUrl ? (
                                  <img
                                    src={getMediaUrl(inst.logoUrl)}
                                    alt={instName}
                                    className="h-full w-full object-contain"
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <Building2 className="h-3.5 w-3.5 text-azure-600" />
                                )}
                              </div>
                              <span className="text-caption font-bold text-ink truncate leading-tight group-hover/inst:text-azure-600 transition-colors">
                                {instName}
                              </span>
                              <CheckCircle2 className="h-3.5 w-3.5 text-azure-600 shrink-0" aria-label="Verified Partner" />
                            </Link>

                            {inst?.location && (
                              <span className="text-[11px] font-medium text-slate-500 truncate flex items-center gap-1 shrink-0 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                                <MapPin className="h-3 w-3 text-slate-400" />
                                <span>{inst.location}</span>
                              </span>
                            )}
                          </div>

                          {/* Specialization / Field Eyebrow */}
                          <div className="mt-2.5">
                            {program.field && (
                              <p className="text-[11px] font-bold uppercase tracking-wider text-azure-600 truncate">
                                {program.field}
                              </p>
                            )}

                            {/* Programme Name */}
                            <h3
                              className="text-h4 font-extrabold text-ink group-hover:text-azure-600 transition-colors line-clamp-1 leading-snug tracking-tight mt-0.5"
                              title={program.title}
                            >
                              <Link to={targetUrl}>
                                {program.title}
                              </Link>
                            </h3>
                          </div>

                          {/* Summary Excerpt (if available) */}
                          {program.summary && (
                            <p className="mt-1.5 text-caption text-slate-500 line-clamp-2 leading-relaxed">
                              {program.summary}
                            </p>
                          )}

                          {/* Horizontal Specifications Strip */}
                          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 text-caption text-slate-600">
                            {program.duration && (
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-azure-500 shrink-0" />
                                <span className="font-medium text-slate-700">{program.duration}</span>
                              </div>
                            )}
                            {program.level && (
                              <div className="flex items-center gap-1.5">
                                <GraduationCap className="h-3.5 w-3.5 text-azure-500 shrink-0" />
                                <span className="font-medium text-slate-700">{program.level}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 3. Action Footer */}
                      <div className="p-5 pt-0 pb-4">
                        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                          <Link
                            to={targetUrl}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-ink hover:bg-azure-600 active:scale-[0.98] text-white py-2.5 px-4 text-caption font-bold shadow-xs transition-all duration-200 text-center group/btn"
                          >
                            <span>View Programme</span>
                            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
                          </Link>

                          {hasSyllabus && (
                            <a
                              href={program.syllabusUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-azure-50 hover:border-azure-300 text-slate-700 hover:text-azure-700 py-2.5 px-3.5 text-caption font-bold transition-all shrink-0 active:scale-[0.98] shadow-2xs"
                              title="Download programme syllabus"
                            >
                              <FileDown className="h-3.5 w-3.5 text-azure-600" />
                              <span>Syllabus</span>
                            </a>
                          )}
                        </div>
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