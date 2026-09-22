import { useMemo, useState } from 'react';
import { Check, FileCheck2, Minus, ShieldCheck, Star, UserCheck, Zap } from 'lucide-react';
import { Seo } from '../components/ui/Seo.jsx';
import { Container, Section } from '../components/ui/Container.jsx';
import { SectionHeader } from '../components/ui/SectionHeader.jsx';
import { Reveal, RevealGroup, RevealItem } from '../components/ui/Reveal.jsx';
import { Tabs } from '../components/ui/Tabs.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { LoadingBlock, ErrorState, EmptyState } from '../components/ui/States.jsx';
import { PageHero } from '../components/marketing/PageHero.jsx';
import { PricingCard } from '../components/marketing/PricingCard.jsx';
import { ConsultationForm } from '../components/marketing/ConsultationForm.jsx';
import { CTASection } from '../components/marketing/CTASection.jsx';
import { TemplateGallery } from '../components/cv/TemplateGallery.jsx';
import { useApi } from '../hooks/useApi.js';
import { pricingService } from '../services/contentService.js';
import { formatCurrency } from '../utils/format.js';
import { cn } from '../utils/cn.js';

const TRUST_POINTS = [
  { icon: UserCheck, label: 'Written by career writers, not templates' },
  { icon: FileCheck2, label: 'ATS-checked before delivery' },
  { icon: ShieldCheck, label: 'Pay only after the brief is confirmed' },
  { icon: Zap, label: '2–3 day turnaround' },
];

const PROCESS = [
  { step: '1', title: 'Choose a bundle', body: 'Pick the band that matches your experience — or ask us and we will place you.' },
  { step: '2', title: 'Share your details', body: 'Send your current CV or a quick brief. A counsellor confirms scope within a day.' },
  { step: '3', title: 'We write & review', body: 'A career writer rewrites and formats it, then it is run through an ATS check.' },
  { step: '4', title: 'Revise & receive', body: 'You get the final files plus a month of revisions if anything needs a tweak.' },
];

const BANDS = [
  { value: 'all', label: 'Show all' },
  { value: '0', label: '0–3 years' },
  { value: '4', label: '4–7 years' },
  { value: '8', label: '8–14 years' },
  { value: '15', label: '15+ years' },
];

export default function Pricing() {
  const { data, loading, error, refetch } = useApi(() => pricingService.cvPackages(), []);
  const [band, setBand] = useState('all');
  const [selected, setSelected] = useState(null);

  const packages = data || [];

  const visible = useMemo(() => {
    if (band === 'all') return packages;
    const years = Number(band);
    const match = packages.filter(
      (p) => years >= p.experienceMin && (p.experienceMax == null || years <= p.experienceMax)
    );
    return match.length ? match : packages;
  }, [band, packages]);

  /* The comparison table rows come from the union of every bundle's features,
     so adding a feature in the admin does not require a code change. */
  const featureRows = useMemo(() => {
    const seen = [];
    packages.forEach((pkg) =>
      pkg.features?.forEach((f) => {
        if (!seen.includes(f.label)) seen.push(f.label);
      })
    );
    return seen;
  }, [packages]);

  return (
    <>
      <Seo
        title="CV and LinkedIn pricing"
        description="DutyLaunch CV bundles: Early Career ₹599, Advanced Career ₹899, Senior Career ₹1,199 and Executive Career ₹1,799. Each includes an ATS-friendly CV, cover letter, LinkedIn optimisation, a month of revisions and 2–3 day delivery."
      />

      <PageHero
        eyebrow="Pricing"
        title="Four bundles, priced by experience."
        lead="More experience means more to weigh, cut and reposition — so the bands differ by the work involved, not by how much is included. Every bundle contains the same five deliverables."
        breadcrumb={[{ label: 'Pricing' }]}
        actions={
          <>
            <Button to="/cv-builder?path=new" size="lg">
              Create a new CV
            </Button>
            <Button to="/cv-builder?path=improve" variant="outline" size="lg">
              Improve my existing CV
            </Button>
          </>
        }
      />

      {/* Trust strip — the same social-proof row order-driven CV sites lead
          with, so a first-time visitor knows what they're paying for before
          they see a single price. */}
      <div className="border-b border-line bg-white">
        <Container>
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-5 text-small font-semibold text-slate-600">
            {TRUST_POINTS.map(({ icon: Icon, label }) => (
              <li key={label} className="inline-flex items-center gap-2">
                <Icon className="h-4.5 w-4.5 text-azure" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </Container>
      </div>

      <Section tone="paper">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-h3 font-bold text-ink">How much experience do you have?</h2>
              <p className="mt-1 text-small text-slate-600">We will show the bundle that matches.</p>
            </div>
            <Tabs options={BANDS} value={band} onChange={setBand} label="Filter bundles by experience" />
          </div>

          <div className="mt-8">
            {loading && <LoadingBlock label="Loading bundles" />}
            {error && <ErrorState error={error} onRetry={refetch} />}
            {!loading && !error && !packages.length && (
              <EmptyState
                title="Pricing is not published yet"
                description="CV bundles are seeded from the database. Run the seed script or add them in the admin."
              />
            )}
            {visible.length > 0 && (
              <RevealGroup
                className={cn(
                  'grid gap-4',
                  visible.length === 1 ? 'max-w-md' : 'md:grid-cols-2 xl:grid-cols-4'
                )}
                staggerDelay={0.07}
              >
                {visible.map((pkg) => (
                  <RevealItem key={pkg._id}>
                    <PricingCard pkg={pkg} onSelect={setSelected} />
                  </RevealItem>
                ))}
              </RevealGroup>
            )}
          </div>
        </Container>
      </Section>

      {/* Comparison — desktop table, stacked lists on small screens. */}
      {packages.length > 0 && (
        <Section tone="white">
          <Container>
            <Reveal>
              <SectionHeader
                label="Side by side"
                title="What differs between the bands."
                lead="The deliverables are identical. What changes is the depth of the rewrite and the price."
              />
            </Reveal>

            <div className="mt-10 hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-left">
                <caption className="sr-only">CV bundle comparison by experience band</caption>
                <thead>
                  <tr>
                    <th scope="col" className="w-1/3 border-b border-line py-4 pr-4 text-small font-bold text-ink">
                      Included
                    </th>
                    {packages.map((pkg) => (
                      <th key={pkg._id} scope="col" className="border-b border-line px-4 py-4 align-bottom">
                        <span className="block text-small font-bold text-ink">{pkg.name}</span>
                        <span className="block text-caption text-slate-500">{pkg.experienceBand}</span>
                        <span className="tabular mt-1.5 block text-h3 font-extrabold text-ink">
                          {formatCurrency(pkg.price, pkg.currency)}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {featureRows.map((label) => (
                    <tr key={label}>
                      <th scope="row" className="py-3.5 pr-4 text-small font-medium text-slate-700">
                        {label}
                      </th>
                      {packages.map((pkg) => {
                        const feature = pkg.features?.find((f) => f.label === label);
                        const included = Boolean(feature?.included);
                        return (
                          <td key={pkg._id} className="px-4 py-3.5">
                            {included ? (
                              <Check className="h-4.5 w-4.5 text-success" aria-label="Included" />
                            ) : (
                              <Minus className="h-4.5 w-4.5 text-slate-300" aria-label="Not included" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr>
                    <th scope="row" className="py-3.5 pr-4 text-small font-medium text-slate-700">
                      Best for
                    </th>
                    {packages.map((pkg) => (
                      <td key={pkg._id} className="px-4 py-3.5 text-small text-slate-600">
                        {pkg.bestFor}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-8 space-y-4 md:hidden">
              {packages.map((pkg) => (
                <details key={pkg._id} className="rounded-lg border border-line bg-white p-5">
                  <summary className="flex cursor-pointer items-center justify-between gap-3">
                    <span className="text-body font-bold text-ink">{pkg.name}</span>
                    <span className="tabular text-body font-extrabold text-ink">
                      {formatCurrency(pkg.price, pkg.currency)}
                    </span>
                  </summary>
                  <p className="mt-2 text-caption text-slate-500">{pkg.experienceBand}</p>
                  <ul className="mt-4 space-y-2">
                    {pkg.features?.map((f) => (
                      <li key={f.label} className="flex items-start gap-2 text-small">
                        {f.included ? (
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                        ) : (
                          <Minus className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" aria-hidden />
                        )}
                        <span className={f.included ? 'text-slate-700' : 'text-slate-400'}>{f.label}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-small text-slate-600">{pkg.bestFor}</p>
                </details>
              ))}
            </div>

            <p className="mt-8 max-w-prose text-small text-slate-600">
              Prices are one-off and inclusive of the revision window. Payment terms, accepted methods and refund
              conditions are set out in the{' '}
              <a href="/refund-policy" className="font-medium text-azure underline-offset-4 hover:underline">
                refund policy
              </a>
              .
            </p>
          </Container>
        </Section>
      )}

      {/* How it works — the process steps proresumes.in-style CV sites use to
          make a one-off, no-account purchase feel low-risk. */}
      <Section tone="paper">
        <Container>
          <Reveal>
            <SectionHeader
              label="How it works"
              title="From payment to a finished CV in four steps."
              lead="No account needed to start — just choose a bundle and a counsellor takes it from there."
            />
          </Reveal>
          <RevealGroup className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={0.08}>
            {PROCESS.map((p) => (
              <RevealItem
                key={p.step}
                className="tile relative p-6 transition-transform duration-200 hover:-translate-y-1"
              >
                <span className="text-h1 font-extrabold text-azure-100">{p.step}</span>
                <h3 className="mt-1 text-body font-bold text-ink">{p.title}</h3>
                <p className="mt-2 text-small text-slate-600">{p.body}</p>
              </RevealItem>
            ))}
          </RevealGroup>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-2 rounded-xl border border-line bg-white px-6 py-5 text-center shadow-xs">
            <div className="inline-flex items-center gap-1 text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4.5 w-4.5 fill-amber-400" aria-hidden />
              ))}
            </div>
            <p className="text-small font-semibold text-ink">
              Rated by candidates placed across India and the Gulf — every bundle includes a satisfaction revision window.
            </p>
          </div>
        </Container>
      </Section>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `Start the ${selected.name} bundle` : ''}
        description="Send your details and a counsellor will confirm the brief and payment link within one working day."
        size="lg"
      >
        {selected && <ConsultationForm defaultService="CV & LinkedIn" compact />}
      </Modal>

      <TemplateGallery
        tone="white"
        limit={6}
        title="ATS templates for your role."
        cta={{ label: 'Browse all templates', to: '/cv-templates' }}
      />

      <CTASection
        title="Unsure which band you fall into?"
        body="If your years of experience and your level of responsibility disagree, book the consultation and we will place you in the right bundle before you pay."
        primary={{ label: 'Book a free consultation', to: '/contact#consultation' }}
        secondary={{ label: 'See what is in each service', to: '/career-services' }}
      />
    </>
  );
}
