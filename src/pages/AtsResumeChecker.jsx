import { useState } from 'react';
import { FileSearch, ScanLine, Sparkles, Target } from 'lucide-react';
import { Seo } from '../components/ui/Seo.jsx';
import { Container, Section } from '../components/ui/Container.jsx';
import { SectionHeader } from '../components/ui/SectionHeader.jsx';
import { PageHero } from '../components/marketing/PageHero.jsx';
import { Accordion } from '../components/ui/Accordion.jsx';
import { CTASection } from '../components/marketing/CTASection.jsx';
import { AtsUploader } from '../components/marketing/AtsUploader.jsx';
import { AtsScoreReport } from '../components/marketing/AtsScoreReport.jsx';
import { images } from '../data/images.js';
import { SiteImage } from '../components/ui/SiteImage.jsx';

const HOW_IT_WORKS = [
  { icon: FileSearch, title: 'We read your resume', body: 'Your PDF or Word file is parsed the same way an ATS would — extracting the raw text, not just the design.' },
  { icon: ScanLine, title: 'We check the fundamentals', body: 'Contact details, section headings, formatting and length are checked against what parsers handle reliably.' },
  { icon: Target, title: 'We score relevance', body: 'Keywords, skills, experience and measurable achievements are weighed the way recruiting software prioritizes them.' },
  { icon: Sparkles, title: 'You get a plan', body: 'A category-by-category breakdown plus specific, actionable recommendations — not just a number.' },
];

const FAQS = [
  {
    id: 'official',
    question: 'Is this an official ATS score?',
    answer:
      'No. This is the DutyLaunch ATS Compatibility Score — our own internal assessment of how ATS-friendly your resume is. It is not affiliated with any specific applicant tracking system vendor.',
  },
  {
    id: 'privacy',
    question: 'What happens to my uploaded resume?',
    answer:
      'Your file is read in memory to extract text for analysis and is not permanently stored. Only the resulting score and recommendations are saved to your account (if you are signed in), never the document itself.',
  },
  {
    id: 'formats',
    question: 'What file formats are supported?',
    answer: 'PDF, DOC and DOCX files up to 10 MB.',
  },
  {
    id: 'improve',
    question: 'How do I improve a low score?',
    answer:
      'Start with the recommendations in your report. If you want it done for you, our CV packages rewrite your resume to be ATS-friendly and results-focused.',
  },
];

export default function AtsResumeChecker() {
  const [result, setResult] = useState(null);

  return (
    <>
      <Seo
        title="Free ATS Resume Checker"
        description="Upload your CV and get an instant DutyLaunch ATS Compatibility Score with a category breakdown and actionable recommendations."
      />

      <PageHero
        tone="ink"
        eyebrow="Free tool"
        title="Check Your Resume ATS Score"
        lead="Upload your CV and discover how well it performs against ATS systems — plus get actionable recommendations to improve it."
        aside={<SiteImage image={images.atsChecker} priority className="mx-auto lg:ml-auto lg:mr-0" />}
      />

      <Section tone="white">
        <Container className="max-w-4xl">
          {result ? (
            <AtsScoreReport result={result} onReset={() => setResult(null)} />
          ) : (
            <AtsUploader onResult={setResult} />
          )}
        </Container>
      </Section>

      <Section tone="paper">
        <Container>
          <SectionHeader label="How it works" title="From upload to actionable report in seconds." align="center" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="tile p-5">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-azure-50 text-azure">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <p className="mt-4 text-small font-bold text-ink">{title}</p>
                <p className="mt-1.5 text-small text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="white">
        <Container className="max-w-3xl">
          <SectionHeader label="FAQ" title="Questions about the ATS checker." />
          <Accordion items={FAQS} className="mt-10" />
        </Container>
      </Section>

      <CTASection
        title="Ready for a resume that's built to pass — and impress?"
        body="Our career experts write ATS-friendly, achievement-led resumes tailored to your target role."
        primary={{ label: 'Explore CV Packages', to: '/pricing' }}
        secondary={{ label: 'Book a free consultation', to: '/contact#consultation' }}
      />
    </>
  );
}
