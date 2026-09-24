import * as Icons from 'lucide-react';
import { Seo } from '../components/ui/Seo.jsx';
import { Container, Section } from '../components/ui/Container.jsx';
import { SectionHeader } from '../components/ui/SectionHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { PageHero, HeroActions } from '../components/marketing/PageHero.jsx';
import { ConsultationForm } from '../components/marketing/ConsultationForm.jsx';
import { CTASection } from '../components/marketing/CTASection.jsx';
import { globalMobility } from '../data/site.js';
import { images } from '../data/images.js';
import { SiteImage } from '../components/ui/SiteImage.jsx';
import { ConsultationVisual } from '../components/marketing/ConsultationVisual.jsx';
import { useMediaQuery } from '../hooks/useMediaQuery.js';

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


export default function DubaiPackage() {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
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
          <SiteImage
            image={images.dubaiHero}
            priority
            className="mx-auto border border-white/10 lg:mx-0"
            rounded="rounded-lg"
          />
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
        <Container>
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:gap-12">
            <SectionHeader
              align="stack"
              title="Who This Is For"
              lead="Job seekers relocating to Dubai or the wider UAE who want a structured, supported transition — with a team that has done this before — rather than piecing the process together alone."
            />
            <SiteImage image={images.dubaiRelocation} className="mx-auto md:mx-0" />
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
            {/* Animated visual beside the form (desktop only — on phones the
                form stands alone, and not rendering the visual means its photo
                isn't downloaded). Sticky so it stays alongside the tall form. */}
            <div className="hidden lg:col-span-6 lg:block">
              {isDesktop && (
                <div className="sticky top-28 pb-12 pl-6 pr-8 pt-10">
                  <ConsultationVisual />
                </div>
              )}
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