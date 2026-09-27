import { Building2, GraduationCap, LineChart, Users } from 'lucide-react';
import { Seo } from '../components/ui/Seo.jsx';
import { Container, Section } from '../components/ui/Container.jsx';
import { SectionHeader } from '../components/ui/SectionHeader.jsx';
import { PageHero, HeroActions } from '../components/marketing/PageHero.jsx';
import { CTASection } from '../components/marketing/CTASection.jsx';
import { Accordion } from '../components/ui/Accordion.jsx';
import { Button } from '../components/ui/Button.jsx';
import { seoFor } from '../data/seoPages.js';
import { contact } from '../data/site.js';
import { organizationSchema } from '../utils/seo.js';

/**
 * Partner acquisition page (spec §22, §31).
 *
 * The pitch is specific rather than generic "reach our audience": we
 * know which skill a candidate is missing because we measured it
 * against a real job description, so a partner course is shown at the
 * moment the candidate has just been told what is holding them back.
 *
 * Nothing on this page may promise enrolment volumes, placement rates
 * or course outcomes (spec §40) — those are not ours to promise.
 */

const seo = seoFor('partners');

const TRACKS = [
  {
    icon: GraduationCap,
    title: 'Universities and colleges',
    body: 'Degree and diploma programmes shown to candidates whose career goal needs the qualification you offer, with admissions support handled alongside.',
  },
  {
    icon: LineChart,
    title: 'Training providers and EdTech',
    body: 'Certifications surfaced against the specific skill a candidate is missing — named by our analysis, not guessed from a browsing history.',
  },
  {
    icon: Building2,
    title: 'Service partners',
    body: 'Documentation, relocation, translation and finance partners, brought in at the point in the journey where the candidate actually needs them.',
  },
  {
    icon: Users,
    title: 'Employers',
    body: 'Hiring rather than teaching? The employer portal is a separate track with its own onboarding.',
    cta: { label: 'Go to employers', to: '/employers' },
  },
];

const HOW_IT_WORKS = [
  {
    step: 'Apply',
    body: 'Tell us what you offer, where you operate and which programmes you want listed. We review every applicant before anything goes live.',
  },
  {
    step: 'Get verified',
    body: 'We check accreditation, registration and delivery mode. Candidates are told which of these we verified and which we did not, so the listing stays honest.',
  },
  {
    step: 'Publish programmes',
    body: 'Your programmes appear in the partner portal, with the details candidates actually decide on: mode, duration, fees and what the qualification leads to.',
  },
  {
    step: 'Receive matched enquiries',
    body: 'Candidates reach you after they have seen a specific gap in their own profile — so the conversation starts further along than a cold enquiry.',
  },
];

const FAQS = [
  {
    id: 'cost',
    question: 'What does it cost to list?',
    answer:
      'Commercial terms depend on the track and the volume of programmes listed. Get in touch and we will walk you through the current structure before you commit to anything.',
  },
  {
    id: 'matching',
    question: 'How are programmes matched to candidates?',
    answer:
      'Our analysis identifies the skills a candidate has not evidenced against the roles they are targeting. Programmes are matched to those named skills. We do not rank by who pays the most — a course that does not close the candidate’s gap is not shown for that gap.',
  },
  {
    id: 'guarantees',
    question: 'Do you guarantee enrolments?',
    answer:
      'No, and you should be sceptical of anyone who does. We can tell you how many candidates saw your programme and how many enquired. What happens in your admissions process is yours.',
  },
  {
    id: 'claims',
    question: 'Can we advertise placement or salary outcomes?',
    answer:
      'Only where you can evidence them, and they will be labelled as your claim rather than ours. We do not publish outcome statistics we cannot verify — the same rule we apply to candidate resumes applies here.',
  },
  {
    id: 'control',
    question: 'Who controls the listing?',
    answer:
      'You do. The partner portal lets you edit programme details, pause a listing and respond to enquiries directly.',
  },
];

export default function Partners() {
  return (
    <>
      <Seo title={seo.title} description={seo.description} schema={organizationSchema(contact)} />

      <PageHero
        eyebrow="Partner with DutyLaunch"
        title={seo.heading}
        lead={seo.subheading}
        breadcrumb={[{ label: 'Services', to: '/career-services' }, { label: 'Partners' }]}
        actions={<HeroActions primary={seo.primaryCta} secondary={seo.secondaryCta} />}
      />

      <Section>
        <Container>
          <SectionHeader
            label="Tracks"
            title="Four ways to work with us"
            lead="Each track has its own verification and its own place in the candidate journey."
          />
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {TRACKS.map((track) => (
              <div key={track.title} className="rounded-lg border border-line bg-white p-6">
                <track.icon className="h-6 w-6 text-azure" aria-hidden />
                <h3 className="mt-4 text-h3 font-bold">{track.title}</h3>
                <p className="mt-2 text-small text-slate-600">{track.body}</p>
                {track.cta && (
                  <Button className="mt-4" variant="link" to={track.cta.to}>
                    {track.cta.label}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section id="apply" tone="paper">
        <Container>
          <SectionHeader label="How it works" title="From application to first enquiry" />
          <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((item, index) => (
              <li key={item.step} className="rounded-lg border border-line bg-white p-6">
                <span className="grid h-7 w-7 place-content-center rounded-full bg-azure-50 text-small font-bold text-azure-700">
                  {index + 1}
                </span>
                <h3 className="mt-4 font-semibold">{item.step}</h3>
                <p className="mt-2 text-small text-slate-600">{item.body}</p>
              </li>
            ))}
          </ol>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button size="lg" to="/register?role=institute">
              Apply to partner
            </Button>
            <Button size="lg" variant="outline" to="/contact">
              Ask a question first
            </Button>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeader label="Questions" title="What partners ask before signing" />
          <div className="mt-8">
            <Accordion items={FAQS} />
          </div>
        </Container>
      </Section>

      <CTASection
        title="Talk to the partnerships team"
        body="Tell us what you offer and who you want to reach. We will tell you honestly whether our candidates are the right audience."
        primary={{ label: 'Contact us', to: '/contact' }}
        secondary={{ label: 'Browse the catalogue', to: '/courses' }}
      />
    </>
  );
}
