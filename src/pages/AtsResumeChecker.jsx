import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { FileSearch, ScanLine, Target, Zap } from 'lucide-react';
import { Seo } from '../components/ui/Seo.jsx';
import { Container, Section } from '../components/ui/Container.jsx';
import { SectionHeader } from '../components/ui/SectionHeader.jsx';
import { PageHero } from '../components/marketing/PageHero.jsx';
import { Accordion } from '../components/ui/Accordion.jsx';
import { CTASection } from '../components/marketing/CTASection.jsx';
import { AtsUploader } from '../components/marketing/AtsUploader.jsx';
import {
  AtsChecklist,
  ParseReviewNotice,
  RecommendationList,
  ResumeHealthReport,
} from '../components/career/CareerReport.jsx';
import { Button } from '../components/ui/Button.jsx';
import { images } from '../data/images.js';
import { SiteImage } from '../components/ui/SiteImage.jsx';
import { seoFor } from '../data/seoPages.js';

const HOW_IT_WORKS = [
  { icon: FileSearch, title: 'We read your resume', body: 'Your PDF or Word file is parsed the same way an ATS would — extracting the raw text, not just the design.' },
  { icon: ScanLine, title: 'We check the fundamentals', body: 'Contact details, section headings, formatting and length are checked against what parsers handle reliably.' },
  { icon: Target, title: 'We score relevance', body: 'Keywords, skills, experience and measurable achievements are weighted using our own published methodology — add a job description and we score against that role specifically.' },
  { icon: Zap, title: 'You get a plan', body: 'A category-by-category breakdown plus specific, actionable recommendations — not just a number.' },
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

const seo = seoFor('resumeChecker');

export default function AtsResumeChecker() {
  const { user, initialising } = useAuth();
  const [result, setResult] = useState(null);

  // Redirect unauthenticated visitors to sign-in, then back here.
  if (!initialising && !user) {
    return <Navigate to="/login" state={{ from: "/resume-checker" }} replace />;
  }

  return (
    <>
      <Seo title={seo.title} description={seo.description} />

      <PageHero
        tone="ink"
        eyebrow="Free tool"
        title={seo.heading}
        lead={seo.subheading}
        aside={<SiteImage image={images.atsChecker} priority ratio="5 / 4" className="mx-auto w-full lg:ml-auto lg:mr-0" />}
      />

      <Section tone="white" id="upload">
        <Container className="max-w-4xl">
          {result ? (
            <div className="space-y-8">
              <ParseReviewNotice needsReview={result.needsReview} note={result.reviewNote} />

              <ResumeHealthReport health={result.health} />

              <AtsChecklist checklist={result.health?.checklist} />

              <div>
                <h2 className="mb-4 text-h3 font-bold">What to do next</h2>
                <RecommendationList recommendations={result.recommendations} />
              </div>

              {/* The report is free and complete on its own. The next step
                  is the job-targeted analysis, which is where a job
                  description turns a generic score into a relevant one. */}
              <div className="rounded-lg border border-line bg-paper p-6">
                <h2 className="text-h3 font-bold">Score it against a real job</h2>
                <p className="mt-2 max-w-prose text-small text-slate-600">
                  This score covers structure, readability and how well your achievements are written. Add a job
                  description and we can also show you which of its requirements your resume does not yet evidence.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button to="/ai-resume-builder">Analyze against a job description</Button>
                  <Button variant="quiet" onClick={() => setResult(null)}>
                    Check another resume
                  </Button>
                </div>
              </div>
            </div>
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
        title="Want this done with you rather than by you?"
        body="Our career writers rework your resume into a clean, parser-friendly, achievement-led document for your target role. We cannot promise any applicant tracking system will accept it — nobody honestly can — but we can make sure nothing in the document is working against you."
        primary={{ label: 'Explore CV Packages', to: '/pricing' }}
        secondary={{ label: 'Book a free consultation', to: '/contact#consultation' }}
      />
    </>
  );
}