import { FileCheck2, Layers, ScanLine, Type } from 'lucide-react';
import { Seo } from '../components/ui/Seo.jsx';
import { Container, Section } from '../components/ui/Container.jsx';
import { Reveal, RevealGroup, RevealItem } from '../components/ui/Reveal.jsx';
import { PageHero, HeroActions } from '../components/marketing/PageHero.jsx';
import { GlacierBackdrop } from '../components/premium/GlacierBackdrop.jsx';
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
        title="DutyLaunch Flagship ATS Resume Templates"
        description="Explore the five DutyLaunch flagship ATS resume templates: DL Elite, DL Tech, DL Professional, DL Executive, and DL Modern. Engineered to 100% ATS parsing standards."
      />

      <PageHero
        eyebrow="Flagship CV Templates"
        title="Five Flagship ATS Templates. One for Every Career Level."
        lead="Engineered for Taleo, Workday, Greenhouse, and iCIMS. DL Elite, DL Tech, DL Professional, DL Executive, and DL Modern provide flawless semantic parsing with premium Glacier design."
        breadcrumb={[{ label: 'Career Tools', to: '/ai-resume-builder' }, { label: 'Templates' }]}
        actions={
          <HeroActions
            primary={{ label: 'Launch AI Resume Builder', to: '/ai-resume-builder' }}
            secondary={{ label: 'Check My Resume ATS Score', to: '/resume-checker' }}
          />
        }
      />

      <TemplateGallery
        tone="paper"
        label="DutyLaunch Flagships"
        title="Pick your flagship DutyLaunch format."
      />


      <Section tone="glacier" backdrop={<GlacierBackdrop />}>
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
            Every template is loaded with realistic, production-ready career achievements, metrics, and credentials. When you open any template in the AI Resume Builder, our engine automatically maps your actual career achievements with verified ATS compatibility.
          </p>
        </Container>
      </Section>

      <CTASection
        title="Not sure which template your role needs?"
        body="Send your current CV and target job titles. A counsellor picks the format and the band before you pay anything."
        primary={{ label: 'Run the free ATS check', to: '/resume-checker' }}
        secondary={{ label: 'See CV pricing', to: '/pricing' }}
      />
    </>
  );
}