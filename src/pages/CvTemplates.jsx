import { FileCheck2, Layers, ScanLine, Type } from 'lucide-react';
import { Seo } from '../components/ui/Seo.jsx';
import { Container, Section } from '../components/ui/Container.jsx';
import { Reveal, RevealGroup, RevealItem } from '../components/ui/Reveal.jsx';
import { PageHero, HeroActions } from '../components/marketing/PageHero.jsx';
import { CTASection } from '../components/marketing/CTASection.jsx';
import { TemplateGallery } from '../components/cv/TemplateGallery.jsx';
import { TEMPLATE_COUNT } from '../data/resumeTemplates.js';

const POINTS = [
  {
    icon: ScanLine,
    title: 'Built to be parsed, not just read',
    body: 'One text flow, real headings, no tables or text boxes. The formats that survive Taleo, Workday, iCIMS and Greenhouse without losing your job history.',
  },
  {
    icon: Layers,
    title: 'Two-column and single-column',
    body: 'Sidebar layouts keep the rail after the main column in document order, so a parser still reads your roles first — the visual split is presentation only.',
  },
  {
    icon: Type,
    title: 'Change the font, colour and spacing',
    body: 'Type, accent colour and density are adjusted to the role and the market you are applying into. Nothing is locked once the draft is with you.',
  },
  {
    icon: FileCheck2,
    title: 'Written for your target role',
    body: 'Each template carries the sections, verbs and keyword groups screeners expect for that job — then a writer fills them with your actual history.',
  },
];

export default function CvTemplates() {
  return (
    <>
      <Seo
        title="ATS resume templates by role"
        description={`${TEMPLATE_COUNT} ATS-friendly CV templates for software, data, IT, engineering, finance, healthcare, education, marketing and operations roles. Written by career writers and ATS-checked before delivery.`}
      />

      <PageHero
        eyebrow="CV templates"
        title="ATS templates, one for every role you apply to."
        lead={`${TEMPLATE_COUNT} formats across software, data, IT and security, engineering, finance, healthcare, education, marketing and operations. Pick the one that matches the job — a writer fills it with your history.`}
        breadcrumb={[{ label: 'Pricing', to: '/pricing' }, { label: 'Templates' }]}
        actions={
          <HeroActions
            primary={{ label: 'Create a new CV', to: '/cv-builder?path=new' }}
            secondary={{ label: 'Improve my existing CV', to: '/cv-builder?path=improve' }}
          />
        }
      />

      <TemplateGallery
        tone="paper"
        label="Browse by role"
        title="Find the template for your job title."
      />

      <Section tone="white">
        <Container>
          <Reveal>
            <h2 className="max-w-[20ch] text-h2 font-extrabold text-ink">
              What makes these ATS-friendly.
            </h2>
            <p className="mt-3 max-w-prose text-lead text-slate-600">
              Most CVs are rejected for formatting before a person reads them. These are the four things that
              actually decide whether yours is parsed correctly.
            </p>
          </Reveal>

          <RevealGroup className="mt-10 grid gap-5 md:grid-cols-2" staggerDelay={0.07}>
            {POINTS.map(({ icon: Icon, title, body }) => (
              <RevealItem
                key={title}
                className="tile flex gap-4 p-6 transition-transform duration-200 hover:-translate-y-1"
              >
                <span className="tile-icon grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-azure-50">
                  <Icon className="h-5 w-5 text-azure" aria-hidden />
                </span>
                <div>
                  <h3 className="text-body font-bold text-ink">{title}</h3>
                  <p className="mt-1.5 text-pretty text-small text-slate-600">{body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>

          <p className="mt-8 max-w-prose text-small text-slate-500">
            The bracketed figures in every preview — [X]% , [currency][X] — are blanks, not sample results. They are
            replaced with your real numbers during the rewrite, and we never invent metrics on a client CV.
          </p>
        </Container>
      </Section>

      <CTASection
        title="Not sure which template your role needs?"
        body="Send your current CV and target job titles. A counsellor picks the format and the band before you pay anything."
        primary={{ label: 'Run the free ATS check', to: '/ats-resume-checker' }}
        secondary={{ label: 'See CV pricing', to: '/pricing' }}
      />
    </>
  );
}
