import { Seo } from '../components/ui/Seo.jsx';
import { Container, Section } from '../components/ui/Container.jsx';
import { SectionHeader } from '../components/ui/SectionHeader.jsx';
import { Reveal, RevealGroup, RevealItem } from '../components/ui/Reveal.jsx';
import { Button } from '../components/ui/Button.jsx';
import { CardSkeleton, EmptyState } from '../components/ui/States.jsx';
import { PageHero, HeroActions } from '../components/marketing/PageHero.jsx';
import { CTASection } from '../components/marketing/CTASection.jsx';
import { CourseCard } from '../components/courses/CourseCard.jsx';
import { useApi } from '../hooks/useApi.js';
import { courseService } from '../services/contentService.js';
import { images } from '../data/images.js';
import { SiteImage } from '../components/ui/SiteImage.jsx';

const gaps = [
  {
    signal: 'You keep reaching final rounds and stopping there',
    read: 'This is rarely a skills gap. It is usually interview structure or the salary conversation.',
    action: { label: 'Interview preparation', to: '/career-services#interview' },
  },
  {
    signal: 'Postings ask for one tool you have never used',
    read: 'A short course plus one portfolio piece is normally enough to move from disqualified to plausible.',
    action: { label: 'Short courses', to: '/courses?track=upskill' },
  },
  {
    signal: 'A regulator or employer requires a specific certificate',
    read: 'Here the credential itself is the point. Preparation courses are worth it; general study is not.',
    action: { label: 'Certification preparation', to: '/courses?track=certification' },
  },
  {
    signal: 'You are changing field entirely',
    read: 'A single short course will not carry that. This is where a longer professional programme earns its cost.',
    action: { label: 'Professional courses', to: '/professional-courses' },
  },
];

export default function Upskills() {
  const { data: courses, loading } = useApi(() => courseService.list({ track: 'upskill', limit: 6 }), []);

  return (
    <>
      <Seo
        title="Upskilling"
        description="Short, targeted courses that close one specific gap — plus an honest read on whether a course is what you actually need."
      />

      <PageHero
        eyebrow="Education"
        title="Close one gap, not all of them."
        lead="Short courses are the right tool when something specific is blocking you and you can name it. When you cannot name it, a course is usually the expensive way to avoid a harder question."
        breadcrumb={[{ label: 'Upskilling' }]}
        actions={
          <HeroActions
            primary={{ label: 'Browse short courses', to: '/courses?track=upskill' }}
            secondary={{ label: 'Work out the gap first', to: '/contact#consultation' }}
          />
        }
        aside={<SiteImage image={images.upskills} priority className="mx-auto lg:ml-auto lg:mr-0" />}
      />

      <Section tone="white">
        <Container>
          <Reveal>
            <SectionHeader
              label="Diagnosis"
              title="What is actually stopping you?"
              lead="Four patterns we see repeatedly, and what each one really calls for."
            />
          </Reveal>
          <RevealGroup className="mt-10 divide-y divide-line border-y border-line" staggerDelay={0.06}>
            {gaps.map((gap) => (
              <RevealItem
                key={gap.signal}
                className="grid gap-4 py-6 transition-colors duration-200 hover:bg-paper/70 lg:grid-cols-12 lg:gap-8"
              >
                <h3 className="text-body font-bold text-ink lg:col-span-4">{gap.signal}</h3>
                <p className="text-body text-slate-600 lg:col-span-5">{gap.read}</p>
                <div className="lg:col-span-3 lg:text-right">
                  <Button to={gap.action.to} variant="link" className="text-small">
                    {gap.action.label}
                  </Button>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </Section>

      <Section tone="paper">
        <Container>
          <Reveal>
            <SectionHeader
              label="Short courses"
              title="Weeks, not years."
              aside={
                <div className="mt-6">
                  <Button to="/courses?track=upskill" variant="outline">
                    See all short courses
                  </Button>
                </div>
              }
            />
          </Reveal>
          <div className="mt-10">
            {loading && <CardSkeleton count={3} />}
            {!loading && !courses?.length && (
              <EmptyState
                title="No short courses published yet"
                description="Add upskilling courses in the admin and they will appear here."
              />
            )}
            {!loading && courses?.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            )}
          </div>
        </Container>
      </Section>

      <CTASection
        tone="sand"
        title="Bring us a job posting."
        body="Send one you would like to be a credible candidate for. We will tell you which parts of it you already meet and which single gap is worth closing first."
        primary={{ label: 'Book a free consultation', to: '/contact#consultation' }}
        secondary={{ label: 'Browse all courses', to: '/courses' }}
      />
    </>
  );
}