import { useMemo, useState } from 'react';
import { FileCheck2, ShieldCheck, Star, UserCheck, Zap } from 'lucide-react';
import { Seo } from '../components/ui/Seo.jsx';
import { Container, Section } from '../components/ui/Container.jsx';
import { SectionHeader } from '../components/ui/SectionHeader.jsx';
import { Reveal, RevealGroup, RevealItem } from '../components/ui/Reveal.jsx';
import { Tabs } from '../components/ui/Tabs.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { LoadingBlock, ErrorState, EmptyState } from '../components/ui/States.jsx';
import { PageHero } from '../components/marketing/PageHero.jsx';
import { GlacierBackdrop } from '../components/premium/GlacierBackdrop.jsx';
import { PricingCard } from '../components/marketing/PricingCard.jsx';
import { ConsultationForm } from '../components/marketing/ConsultationForm.jsx';
import { CTASection } from '../components/marketing/CTASection.jsx';
import { TemplateGallery } from '../components/cv/TemplateGallery.jsx';
import { useApi } from '../hooks/useApi.js';
import { pricingService } from '../services/contentService.js';
import { cn } from '../utils/cn.js';

const TRUST_POINTS = [
  { icon: UserCheck, label: 'Written by career writers, not templates' },
  { icon: FileCheck2, label: 'ATS-checked before delivery' },
  { icon: ShieldCheck, label: 'Secure online payment by Razorpay' },
  { icon: Zap, label: '2–3 day turnaround' },
];

const PROCESS = [
  { step: '1', title: 'Choose and pay', body: 'Pick the band that matches your experience and pay securely online — or ask us and we will place you.' },
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
      <div className="border-y border-glacier-400/60 bg-glacier-200/60 backdrop-blur-sm">
        <Container>
          <ul className="grid gap-x-8 gap-y-3 py-5 text-small font-semibold text-slate-600 sm:flex sm:flex-wrap sm:items-center sm:justify-center">
            {TRUST_POINTS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon className="h-4 w-4 shrink-0 text-azure" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </Container>
      </div>

      <Section tone="glacier" backdrop={<GlacierBackdrop />}>
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
                  'grid gap-6 pt-6',
                  visible.length === 1 ? 'max-w-md' : 'md:auto-rows-fr md:grid-cols-2 xl:grid-cols-4'
                )}
                staggerDelay={0.07}
              >
                {visible.map((pkg) => (
                  <RevealItem key={pkg._id} className="h-full">
                    <PricingCard pkg={pkg} onSelect={setSelected} />
                  </RevealItem>
                ))}
              </RevealGroup>
            )}
          </div>
          {/* Moved here from the removed comparison table, which repeated
              every price already shown on the cards above. */}
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


      {/* How it works — the process steps proresumes.in-style CV sites use to
          make a one-off, no-account purchase feel low-risk. */}
      <Section tone="paper">
        <Container>
          <Reveal>
            <SectionHeader
              label="How it works"
              title="From payment to a finished CV in four steps."
              lead="Sign in, choose a bundle and pay securely. A counsellor contacts you within one working day to start your brief."
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

          <div className="mt-10 flex flex-wrap items-center justify-center gap-2 rounded-xl border border-glacier-400/60 bg-white/70 px-6 py-5 text-center shadow-crystal backdrop-blur-sm">
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
        title={selected ? `Get your ${selected.name} CV` : ''}
        description={selected ? `A counsellor will call you within one working day to confirm your brief. You pay only after that, through a secure payment link.` : ''}
        size="lg"
      >
        {selected && (
          <ConsultationForm
            defaultService="CV & LinkedIn"
            defaultMessage={`I'd like the ${selected.name} bundle (${selected.experienceBand || ''}).`.replace(' ()', '')}
            successNote={`A counsellor will call you within one working day to confirm your ${selected.name} brief and share the payment link.`}
            compact
          />
        )}
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