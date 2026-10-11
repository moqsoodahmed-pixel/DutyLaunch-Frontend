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
    body: 'Sidebar layouts keep the rail after the main column in document order, so a parser still reads your roles first, the visual split is presentation only.',
  },
  {
    icon: Type,
    title: 'Change the font, colour and spacing',
    body: 'Type, accent colour and density are adjusted to the role and the market you are applying into. Nothing is locked once the draft is with you.',
  },
  {
    icon: FileCheck2,
    title: 'Written for your target role',
    body: 'Each template carries the sections, verbs and keyword groups screeners expect for that job, then a writer fills them with your actual history.',
  },
];

export default function CvTemplates() {
  return (
    <>
      <Seo
        title="DutyLaunch Flagship ATS Resume Templates"
        description="Explore the five DutyLaunch flagship ATS resume templates: DL Elite, DL Tech, DL Professional, DL Executive, and DL Modern. Engineered to industry ATS parsing standards."
      />

      <PageHero
        eyebrow="Flagship CV Templates"
        title="Five Flagship ATS Templates. One for Every Career Level."
        lead="Engineered for Taleo, Workday, Greenhouse, and iCIMS. DL Elite, DL Tech, DL Professional, DL Executive, and DL Modern provide flawless semantic parsing with premium Glacier design."
        breadcrumb={[{ label: 'Career+', to: '/resume-builder' }, { label: 'Templates' }]}
        actions={
          <HeroActions
            primary={{ label: 'Open Resume Builder', to: '/resume-builder' }}
            secondary={{ label: 'Check My Resume ATS Score', to: '/resume-checker' }}
          />
        }
        aside={
          <div className="relative mx-auto w-full max-w-sm rounded-2xl border border-white/80 bg-white/90 p-6 shadow-crystal backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-azure-50 text-azure-700">
                  <ScanLine className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <p className="text-small font-bold text-ink">ATS Compatibility</p>
                  <p className="text-[11px] text-slate-500">Taleo · Workday · iCIMS</p>
                </div>
              </div>
              <span className="tabular rounded-full bg-emerald-50 px-2.5 py-1 text-caption font-extrabold text-emerald-700">
                98% ATS Pass
              </span>
            </div>
            <div className="mt-4 space-y-2.5">
              <div className="flex items-center justify-between text-caption font-semibold text-slate-600">
                <span>Universal Single-Column DOM</span>
                <span className="text-emerald-600 font-bold">Verified</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full w-[98%] rounded-full bg-gradient-to-r from-azure-500 to-emerald-500" />
              </div>
              <div className="flex items-center justify-between text-caption font-semibold text-slate-600 pt-1">
                <span>Heading Hierarchy (H1/H2/H3)</span>
                <span className="text-emerald-600 font-bold">Standard</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full w-[96%] rounded-full bg-gradient-to-r from-azure-500 to-emerald-500" />
              </div>
              <div className="flex items-center justify-between text-caption font-semibold text-slate-600 pt-1">
                <span>Quantified Achievement Patterns</span>
                <span className="text-emerald-600 font-bold">High Impact</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full w-[95%] rounded-full bg-gradient-to-r from-azure-500 to-emerald-500" />
              </div>
            </div>
            <div className="mt-5 rounded-lg border border-line bg-paper px-3 py-2 text-center text-caption text-slate-500">
              5 Flagship Formats · 1 Free Allowance
            </div>
          </div>
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
            Every template is loaded with realistic, production-ready career achievements, metrics, and credentials. Open any template in the Resume Builder to fill it with your own details, upload your resume or start from scratch.
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