import * as Icons from 'lucide-react';
import { Seo } from '../components/ui/Seo.jsx';
import { Container, Section } from '../components/ui/Container.jsx';
import { SectionHeader } from '../components/ui/SectionHeader.jsx';
import { PageHero, HeroActions } from '../components/marketing/PageHero.jsx';
import { CTASection } from '../components/marketing/CTASection.jsx';
import { ItemGroups } from '../components/marketing/ItemGroups.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Reveal } from '../components/ui/Reveal.jsx';
import { CardSkeleton, EmptyState, ErrorState } from '../components/ui/States.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { useApi } from '../hooks/useApi.js';
import { documentationService } from '../services/contentService.js';
import { Check } from 'lucide-react';

/* Content from dutylaunch.com's Appostle services page, in the live site's order. */
const DOCUMENT_SERVICES = [
  { title: 'Educational Certificate Attestation', icon: 'GraduationCap' },
  { title: 'Degree & Diploma Apostille', icon: 'Stamp' },
  { title: 'PCC (Police Clearance Certificate)', icon: 'ShieldCheck' },
  { title: 'Birth & Marriage Certificate Attestation', icon: 'FileHeart' },
  { title: 'Employment & Experience Certificates', icon: 'Briefcase' },
  { title: 'MEA Attestation', icon: 'Landmark' },
  { title: 'Embassy Attestation', icon: 'Building2' },
  { title: 'Commercial Document Attestation', icon: 'FileText' },
  { title: 'Translation Assistance', icon: 'Languages' },
];

const WHY_CHOOSE = [
  '100% Genuine Documentation Process',
  'Expert Verification Team',
  'Fast Turnaround Time',
  'Doorstep Pickup & Delivery',
  'Secure Document Handling',
];

export default function Documentation() {
  const { data, loading, error, refetch } = useApi(() => documentationService.list(), []);
  const services = data || [];

  return (
    <>
      <Seo
        title="Apostille & Attestation"
        description="Planning to study, work, or relocate abroad? DutyLaunch provides reliable Apostille and Attestation services to ensure your documents are legally recognized across countries."
      />
      <PageHero
        eyebrow="Appostle Services"
        tone="sand"
        title="Apostille & Attestation"
        lead="Planning to study, work, or relocate abroad? DutyLaunch provides reliable Apostille and Attestation services to ensure your documents are legally recognized across countries."
        breadcrumb={[{ label: 'Appostle Services' }]}
        actions={<HeroActions primary={{ label: 'Check Your Document Requirements', to: '/contact#consultation' }} />}
      />

      <Section tone="paper">
        <Container>
          <Reveal>
            <SectionHeader
              label="Documentation & Attestation Services"
              title="Fast, Secure & Government-Compliant Document Services"
              lead="Our experienced team manages the complete verification process while keeping you informed at every step, making documentation simple, secure, and hassle-free."
            />
          </Reveal>
          <ItemGroups groups={DOCUMENT_SERVICES} className="mt-10" />
          <Button to="/contact#consultation" className="mt-8">
            Check Your Document Requirements
          </Button>
        </Container>
      </Section>

      <Section tone="white">
        <Container>
          {loading && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          )}
          {error && <ErrorState error={error} onRetry={refetch} />}
          {!loading && !error && !services.length && (
            <EmptyState
              title="Documentation services are not published yet"
              description="Add them from the admin, or run the seed script."
            />
          )}
          {!loading && services.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((svc) => {
                const Icon = Icons[svc.icon] || Icons.FileCheck2;
                return (
                  <article key={svc._id} className="tile p-6">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded bg-sand-200 text-ink-700">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <h2 className="mt-4 text-h3 font-bold text-ink">{svc.name}</h2>
                    <p className="mt-2 text-small text-slate-600">{svc.description}</p>
                    <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-caption text-slate-500">
                      {svc.typicalDuration && (
                        <div>
                          <dt className="inline font-semibold">Typical time: </dt>
                          <dd className="inline">{svc.typicalDuration}</dd>
                        </div>
                      )}
                      {svc.countries?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {svc.countries.slice(0, 3).map((c) => (
                            <Badge key={c} tone="outline">
                              {c}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </dl>
                  </article>
                );
              })}
            </div>
          )}
          <p className="mt-8 max-w-prose text-small text-slate-500">
            Processing times vary by country, document type and issuing authority, so timelines and fees are confirmed
            per case rather than quoted here as a fixed number.
          </p>
        </Container>
      </Section>

      <Section tone="paper">
        <Container>
          <Reveal>
            <h2 className="text-h2 font-bold">Why Choose DutyLaunch?</h2>
          </Reveal>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_CHOOSE.map((point) => (
              <li key={point} className="tile flex items-start gap-3 p-5">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-success/10">
                  <Check className="h-3.5 w-3.5 text-success" strokeWidth={3} aria-hidden />
                </span>
                <span className="text-body font-semibold text-ink">{point}</span>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <CTASection
        title="Ready to Take the Next Step in Your Career?"
        body="Your dream career starts with the right guidance. Whether you’re looking for a better job, planning higher education, relocating abroad, or improving your professional profile, DutyLaunch is here to support you at every stage of your journey."
        primary={{ label: 'Book Free Consultation', to: '/contact#consultation' }}
        secondary={{ label: 'Dubai Launch', to: '/dubai-job-seeker-package' }}
      />
    </>
  );
}