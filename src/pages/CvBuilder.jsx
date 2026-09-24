import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Check, FileCheck2, FilePlus2, GraduationCap,
  PenLine, ScanSearch, ShieldCheck, Sparkles, Upload, Zap,
} from 'lucide-react';
import { Seo } from '../components/ui/Seo.jsx';
import { Container, Section } from '../components/ui/Container.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { LoadingBlock, ErrorState, EmptyState } from '../components/ui/States.jsx';
import { PageHero } from '../components/marketing/PageHero.jsx';
import { ConsultationForm } from '../components/marketing/ConsultationForm.jsx';
import { TemplateGallery } from '../components/cv/TemplateGallery.jsx';
import { useApi } from '../hooks/useApi.js';
import { pricingService } from '../services/contentService.js';
import { formatCurrency } from '../utils/format.js';
import { cn } from '../utils/cn.js';
import { images } from '../data/images.js';
import { SiteImage } from '../components/ui/SiteImage.jsx';

const EASE = [0.16, 0.84, 0.44, 1];

/**
 * Two entry paths, then one shared pricing step.
 *
 * Prices are never hard-coded here — every figure on this page comes from the
 * CVPackage collection via /api/pricing/cv-packages, the same source the
 * /pricing page reads, so editing a bundle in the admin updates this flow too.
 *
 * If DutyLaunch later publishes a separate rate card for rewrites (a CV-only
 * band, say), add those as CVPackage records carrying `track: 'improve'` and
 * this page will split them automatically — see `packagesForTrack` below.
 * Until such records exist, both paths quote the same published bundles, which
 * is what the rate card actually says today.
 */

const PATHS = {
  new: {
    id: 'new',
    icon: FilePlus2,
    title: 'Create a new CV',
    blurb: 'Start from scratch with a career writer. Best if you have no CV, or the one you have is years out of date.',
    points: [
      'A writer builds the document from your brief and a short call',
      'Layout chosen for the roles you are targeting',
      'Cover letter and LinkedIn written to match',
    ],
    cta: 'Build a new CV',
  },
  improve: {
    id: 'improve',
    icon: PenLine,
    title: 'Improve my existing CV',
    blurb: 'Send the CV you already use. We check it against ATS parsing first, then rewrite what is holding it back.',
    points: [
      'Free ATS check before you pay anything',
      'You see the score and the specific issues first',
      'Rewrite keeps what already works in your document',
    ],
    cta: 'Improve my CV',
  },
};

/* The path-specific journey. The "improve" route deliberately puts a free
   diagnostic ahead of payment, because sending someone to checkout before
   they know what is wrong with their CV is the thing most rewrite services
   get wrong. */
const JOURNEYS = {
  new: [
    { icon: GraduationCap, title: 'Tell us your experience', body: 'Pick your band so we can quote the right bundle.' },
    { icon: Sparkles, title: 'Confirm the brief', body: 'A counsellor confirms scope and target roles within a working day.' },
    { icon: PenLine, title: 'A writer drafts it', body: 'First draft in 2–3 days, written from your brief and call.' },
    { icon: FileCheck2, title: 'Revise and receive', body: 'Final files plus a month of unlimited revisions.' },
  ],
  improve: [
    { icon: Upload, title: 'Upload your current CV', body: 'Run the free ATS checker and see where it is losing marks.' },
    { icon: ScanSearch, title: 'Read the report', body: 'Parsing issues, missing keywords and formatting problems, itemised.' },
    { icon: GraduationCap, title: 'Pick your band', body: 'Quote is based on your experience, same published rate card.' },
    { icon: PenLine, title: 'We rewrite it', body: 'Rewrite, ATS re-check, then a month of unlimited revisions.' },
  ],
};

const TRUST = [
  { icon: ShieldCheck, label: 'Pay only after the brief is confirmed' },
  { icon: FileCheck2, label: 'ATS-checked before delivery' },
  { icon: Zap, label: '2–3 day turnaround' },
];

function StepDots({ step, total = 3 }) {
  return (
    <ol className="flex items-center gap-2" aria-label={`Step ${step} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => {
        const n = i + 1;
        const done = n < step;
        const current = n === step;
        return (
          <li key={n} className="flex items-center gap-2">
            <span
              aria-current={current ? 'step' : undefined}
              className={cn(
                'grid h-7 w-7 place-items-center rounded-full text-caption font-bold transition-colors duration-200',
                done && 'bg-azure text-white',
                current && 'bg-ink text-white',
                !done && !current && 'border border-line bg-white text-slate-400'
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" aria-hidden /> : n}
            </span>
            {n < total && <span className={cn('h-px w-6', done ? 'bg-azure' : 'bg-line')} aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}

function PathCard({ path, onSelect }) {
  const Icon = path.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect(path.id)}
      className="tile group flex h-full flex-col p-7 text-left transition-all duration-200 hover:-translate-y-1 hover:border-azure-300 hover:shadow-lift focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-azure-300 focus-visible:outline-offset-2"
    >
      <span className="tile-icon grid h-12 w-12 place-items-center rounded-lg bg-azure-50 transition-colors duration-200 group-hover:bg-azure-100">
        <Icon className="h-5 w-5 text-azure" aria-hidden />
      </span>
      <h2 className="mt-5 text-h3 font-bold text-ink">{path.title}</h2>
      <p className="mt-2 text-pretty text-small text-slate-600">{path.blurb}</p>
      <ul className="mt-5 space-y-2">
        {path.points.map((point) => (
          <li key={point} className="flex gap-2 text-small text-slate-700">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
            {point}
          </li>
        ))}
      </ul>
      <span className="mt-6 inline-flex items-center gap-1.5 text-small font-semibold text-azure">
        {path.cta}
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
      </span>
    </button>
  );
}

export default function CvBuilder() {
  const [params, setParams] = useSearchParams();
  const { data, loading, error, refetch } = useApi(() => pricingService.cvPackages(), []);
  const [checkout, setCheckout] = useState(null);

  const path = params.get('path') === 'improve' || params.get('path') === 'new' ? params.get('path') : null;
  const bandSlug = params.get('band') || null;

  const packages = useMemo(() => data || [], [data]);

  /* Forward-compatible: if packages ever carry a `track`, honour it; if none
     do, every bundle applies to both paths (which is the case today). */
  const packagesForTrack = useMemo(() => {
    const tracked = packages.filter((p) => p.track);
    if (!tracked.length) return packages;
    return packages.filter((p) => !p.track || p.track === path);
  }, [packages, path]);

  const ordered = useMemo(
    () => [...packagesForTrack].sort((a, b) => (a.experienceMin ?? 0) - (b.experienceMin ?? 0)),
    [packagesForTrack]
  );

  const selectedPackage = useMemo(
    () => ordered.find((p) => p.slug === bandSlug) || null,
    [ordered, bandSlug]
  );

  const step = !path ? 1 : !selectedPackage ? 2 : 3;

  const go = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next, { replace: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activePath = path ? PATHS[path] : null;

  return (
    <>
      <Seo
        title="Build or improve your CV"
        description="Start a new CV with a career writer, or send the CV you already use for a free ATS check and a rewrite. Pricing is set by experience band and confirmed before you pay."
      />

      <PageHero
        eyebrow="CV writing"
        title={activePath ? activePath.title : 'Start a new CV, or fix the one you have.'}
        lead={
          activePath
            ? activePath.blurb
            : 'Two ways in. Both end with an ATS-checked CV, a matching cover letter and LinkedIn copy, and a month of unlimited revisions.'
        }
        breadcrumb={[{ label: 'Pricing', to: '/pricing' }, { label: 'Build my CV' }]}
        aside={<SiteImage image={images.cvBuilder} priority className="mx-auto lg:ml-auto lg:mr-0" />}
      />

      <div className="border-b border-line bg-white">
        <Container>
          <div className="flex flex-col items-start justify-between gap-4 py-5 sm:flex-row sm:items-center">
            <StepDots step={step} />
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-small font-semibold text-slate-600">
              {TRUST.map(({ icon: Icon, label }) => (
                <li key={label} className="inline-flex items-center gap-2">
                  <Icon className="h-4 w-4 text-azure" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </div>

      <Section tone="paper">
        <Container>
          <AnimatePresence mode="wait">
            {/* ---------- Step 1: which path ---------- */}
            {step === 1 && (
              <motion.div
                key="step-path"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <h2 className="max-w-[22ch] text-h2 font-extrabold text-ink">
                  Where are you starting from?
                </h2>
                <p className="mt-3 max-w-prose text-lead text-slate-600">
                  This only changes how we begin. The deliverables are the same either way.
                </p>
                <div className="mt-8 grid gap-5 lg:grid-cols-2">
                  {Object.values(PATHS).map((p) => (
                    <PathCard key={p.id} path={p} onSelect={(id) => go({ path: id, band: null })} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* ---------- Step 2: experience band ---------- */}
            {step === 2 && (
              <motion.div
                key="step-band"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <button
                  type="button"
                  onClick={() => go({ path: null, band: null })}
                  className="inline-flex items-center gap-1.5 text-small font-semibold text-slate-600 hover:text-ink"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  Back
                </button>

                <h2 className="mt-5 max-w-[22ch] text-h2 font-extrabold text-ink">
                  How long have you been working?
                </h2>
                <p className="mt-3 max-w-prose text-lead text-slate-600">
                  {path === 'improve'
                    ? 'The rewrite is priced by how much there is to reposition, so the band sets the quote.'
                    : 'More experience means more to weigh, cut and reposition — that is what the bands price.'}
                </p>

                <div className="mt-8">
                  {loading && <LoadingBlock label="Loading bundles" />}
                  {error && <ErrorState error={error} onRetry={refetch} />}
                  {!loading && !error && !ordered.length && (
                    <EmptyState
                      title="Pricing is not published yet"
                      description="CV bundles come from the database. Run the seed script or add them in the admin."
                    />
                  )}

                  {ordered.length > 0 && (
                    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      {ordered.map((pkg, i) => (
                        <motion.li
                          key={pkg._id}
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, delay: i * 0.06, ease: EASE }}
                        >
                          <button
                            type="button"
                            onClick={() => go({ band: pkg.slug })}
                            className="tile group flex h-full w-full flex-col p-6 text-left transition-all duration-200 hover:-translate-y-1 hover:border-azure-300 hover:shadow-lift focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-azure-300 focus-visible:outline-offset-2"
                          >
                            {pkg.isPopular && (
                              <span className="mb-3 inline-flex w-fit rounded-full bg-azure-50 px-2.5 py-1 text-caption font-bold text-azure-700">
                                Most chosen
                              </span>
                            )}
                            <span className="text-h3 font-extrabold text-ink">{pkg.experienceBand}</span>
                            <span className="mt-1 text-small font-semibold text-slate-500">{pkg.name}</span>
                            <p className="mt-3 flex-1 text-pretty text-small text-slate-600">{pkg.bestFor}</p>
                            <span className="mt-5 inline-flex items-center gap-1.5 text-small font-semibold text-azure">
                              See the price
                              <ArrowRight
                                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                                aria-hidden
                              />
                            </span>
                          </button>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.div>
            )}

            {/* ---------- Step 3: the quote ---------- */}
            {step === 3 && selectedPackage && (
              <motion.div
                key="step-quote"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <button
                  type="button"
                  onClick={() => go({ band: null })}
                  className="inline-flex items-center gap-1.5 text-small font-semibold text-slate-600 hover:text-ink"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  Change experience band
                </button>

                <div className="mt-6 grid gap-6 lg:grid-cols-12">
                  <div className="lg:col-span-7">
                    <div className="tile p-7">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="eyebrow">{selectedPackage.experienceBand}</p>
                          <h2 className="mt-3 text-h2 font-extrabold text-ink">{selectedPackage.name}</h2>
                          {selectedPackage.tagline && (
                            <p className="mt-2 max-w-prose text-small text-slate-600">{selectedPackage.tagline}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="tabular text-display font-extrabold leading-none text-ink">
                            {formatCurrency(selectedPackage.price, selectedPackage.currency)}
                          </p>
                          <p className="mt-1 text-caption text-slate-500">one-off, inclusive of revisions</p>
                        </div>
                      </div>

                      <ul className="mt-7 grid gap-2.5 sm:grid-cols-2">
                        {selectedPackage.features
                          ?.filter((f) => f.included)
                          .map((f) => (
                            <li key={f.label} className="flex gap-2 text-small text-slate-700">
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                              {f.label}
                            </li>
                          ))}
                      </ul>

                      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                        <Button size="lg" onClick={() => setCheckout(selectedPackage)}>
                          {path === 'improve' ? 'Send my CV for rewrite' : 'Start this bundle'}
                        </Button>
                        {path === 'improve' && (
                          <Button to="/ats-resume-checker" variant="outline" size="lg">
                            Run the free ATS check first
                          </Button>
                        )}
                      </div>
                      <p className="mt-4 text-small text-slate-500">
                        Nothing is charged here. A counsellor confirms the brief and sends a payment link within one
                        working day.
                      </p>
                    </div>
                  </div>

                  <div className="lg:col-span-5">
                    <div className="rounded-xl border border-line bg-white p-6">
                      <h3 className="text-body font-bold text-ink">What happens next</h3>
                      <ol className="mt-5 space-y-5">
                        {JOURNEYS[path].map(({ icon: Icon, title, body }, i) => (
                          <li key={title} className="flex gap-3">
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-azure-50">
                              <Icon className="h-4 w-4 text-azure" aria-hidden />
                            </span>
                            <div>
                              <p className="text-small font-bold text-ink">
                                <span className="tabular mr-1.5 text-slate-400">{i + 1}.</span>
                                {title}
                              </p>
                              <p className="mt-0.5 text-small text-slate-600">{body}</p>
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </Section>

      <TemplateGallery
        tone="white"
        limit={6}
        title="ATS templates for your role."
        cta={{ label: 'Browse all templates', to: '/cv-templates' }}
      />

      <Modal
        open={Boolean(checkout)}
        onClose={() => setCheckout(null)}
        title={checkout ? `Start the ${checkout.name} bundle` : ''}
        description="Send your details and a counsellor will confirm the brief and payment link within one working day."
        size="lg"
      >
        {checkout && <ConsultationForm defaultService="CV & LinkedIn" compact />}
      </Modal>
    </>
  );
}