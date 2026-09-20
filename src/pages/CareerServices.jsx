import * as Icons from 'lucide-react';
import { Check, FileCheck2, ShieldCheck, UserCheck, Zap } from 'lucide-react';
import { Seo } from '../components/ui/Seo.jsx';
import { Container, Section } from '../components/ui/Container.jsx';
import { SectionHeader } from '../components/ui/SectionHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { PageHero, HeroActions } from '../components/marketing/PageHero.jsx';
import { CTASection } from '../components/marketing/CTASection.jsx';
import { careerServices } from '../data/site.js';
import { serviceSchema } from '../utils/seo.js';

const TRUST_POINTS = [
  { icon: UserCheck, label: 'Written by career writers, not templates' },
  { icon: FileCheck2, label: 'ATS-checked before delivery' },
  { icon: ShieldCheck, label: 'Pay only after the brief is confirmed' },
  { icon: Zap, label: '2–3 day turnaround' },
];

export default function CareerServices() {
  return (
    <>
      <Seo
        title="Career services"
        description="ATS resume writing, cover letters, LinkedIn optimisation, interview preparation, career counselling and job search assistance from DutyLaunch."
        schema={serviceSchema({
          name: 'Career services',
          description:
            'ATS resume writing, cover letters, LinkedIn optimisation, interview preparation, career counselling and job search assistance.',
          path: '/career-services',
        })}
      />

      <PageHero
        eyebrow="Career"
        title="The work that gets you shortlisted."
        lead="Six services covering the whole application: what you send, how you are found, and how you perform when someone finally calls."
        breadcrumb={[{ label: 'Career services' }]}
        actions={
          <HeroActions
            primary={{ label: 'See CV bundle pricing', to: '/pricing' }}
            secondary={{ label: 'Book a free consultation', to: '/contact#consultation' }}
          />
        }
      />

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
          <div className="grid gap-5">
            {careerServices.map((service, index) => {
              const Icon = Icons[service.icon] || Icons.Circle;
              return (
                <article
                  key={service.id}
                  id={service.id}
                  className="tile grid scroll-mt-24 gap-6 p-6 sm:p-8 lg:grid-cols-12 lg:gap-10"
                >
                  <div className="lg:col-span-4">
                    <div className="flex items-start gap-3">
                      <span className="tile-icon grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-azure-50">
                        <Icon className="h-5 w-5 text-azure" aria-hidden />
                      </span>
                      <div>
                        <p className="tabular text-caption font-bold text-slate-400">
                          {String(index + 1).padStart(2, '0')}
                        </p>
                        <h2 className="text-h3 font-bold text-ink">{service.title}</h2>
                      </div>
                    </div>
                    <p className="mt-4 text-body font-semibold text-azure-700">{service.promise}</p>
                  </div>

                  <div className="lg:col-span-5">
                    <p className="text-body text-slate-600">{service.body}</p>
                  </div>

                  <div className="lg:col-span-3">
                    <p className="text-caption font-bold uppercase tracking-wide text-slate-500">What you get</p>
                    <ul className="mt-3 space-y-2">
                      {service.includes.map((item) => (
                        <li key={item} className="flex gap-2 text-small text-slate-700">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Button to={service.link} variant="link" className="mt-4 text-small">
                      {service.link === '/pricing' ? 'See pricing' : 'Start with a consultation'}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        </Container>
      </Section>

      <Section tone="white">
        <Container>
          <SectionHeader
            label="What happens"
            title="From brief to final file in about a week."
            lead="Written so you know exactly what is expected of you and when."
          />
          <ol className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              ['You send what you have', 'Current CV, target roles and anything you have already been rejected from. No form-filling marathon.'],
              ['A short call', 'Twenty minutes to find the achievements that are missing from the document. This is where most of the value is.'],
              ['First draft in 2–3 days', 'CV, cover letter and LinkedIn copy together, so the three tell one story.'],
              ['A month of revisions', 'Unlimited, without needing to justify the request. Applications teach you things; the document should keep up.'],
            ].map(([title, body], i) => (
              <li key={title} className="tile p-5">
                <p className="tabular text-caption font-bold text-azure">Step {i + 1}</p>
                <h3 className="mt-1.5 text-body font-bold text-ink">{title}</h3>
                <p className="mt-2 text-small text-slate-600">{body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <CTASection
        tone="sand"
        title="Not sure which service you need?"
        body="Send us your current CV and the roles you are targeting. The consultation will tell you whether the document is the problem."
        primary={{ label: 'Book a free consultation', to: '/contact#consultation' }}
        secondary={{ label: 'Compare CV bundles', to: '/pricing' }}
      />
    </>
  );
}
