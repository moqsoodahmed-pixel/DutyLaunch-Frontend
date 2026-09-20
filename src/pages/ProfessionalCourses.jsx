import * as Icons from 'lucide-react';
import { Seo } from '../components/ui/Seo.jsx';
import { Container, Section } from '../components/ui/Container.jsx';
import { SectionHeader } from '../components/ui/SectionHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { CardSkeleton, EmptyState } from '../components/ui/States.jsx';
import { PageHero, HeroActions } from '../components/marketing/PageHero.jsx';
import { CTASection } from '../components/marketing/CTASection.jsx';
import { CourseCard } from '../components/courses/CourseCard.jsx';
import { useApi } from '../hooks/useApi.js';
import { courseService } from '../services/contentService.js';
import { serviceSchema } from '../utils/seo.js';

export default function ProfessionalCourses() {
  const { data: courses, loading } = useApi(() => courseService.list({ track: 'professional', limit: 6 }), []);
  const { data: categories } = useApi(() => courseService.categories(), []);

  return (
    <>
      <Seo
        title="Professional courses"
        description="Mentor-led professional programmes in data, project management, digital marketing, finance, HR and cloud — with a counsellor to check the course fits the role you want."
        schema={serviceSchema({
          name: 'Professional courses',
          description: 'Structured, mentor-led professional programmes with career-aligned guidance.',
          path: '/professional-courses',
        })}
      />

      <PageHero
        eyebrow="Education"
        title="Programmes that change what you are hired to do."
        lead="Longer, structured courses with a mentor and assessed work — the kind you can talk about credibly in an interview. We check the course against your target role before you enrol, not after."
        breadcrumb={[{ label: 'Professional courses' }]}
        actions={
          <HeroActions
            primary={{ label: 'Browse the catalogue', to: '/courses?track=professional' }}
            secondary={{ label: 'Ask which course fits', to: '/contact#consultation' }}
          />
        }
      />

      <Section tone="white">
        <Container>
          <SectionHeader
            label="Subjects"
            title="Where our programmes concentrate."
            lead="Chosen because the skills are hired for directly and the qualification is legible to recruiters."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(categories || []).map((category) => {
              const Icon = Icons[category.icon] || Icons.Circle;
              return (
                <article key={category._id} className="rounded-lg border border-line p-5">
                  <Icon className="h-5 w-5 text-azure" aria-hidden />
                  <h3 className="mt-3 text-body font-bold text-ink">{category.name}</h3>
                  <p className="mt-1.5 text-small text-slate-600">{category.description}</p>
                  <Button to={`/courses?category=${category.slug}`} variant="link" className="mt-3 text-small">
                    See courses
                  </Button>
                </article>
              );
            })}
          </div>
        </Container>
      </Section>

      <Section tone="paper">
        <Container>
          <SectionHeader
            label="Featured"
            title="Currently running."
            aside={
              <div className="mt-6">
                <Button to="/courses?track=professional" variant="outline">
                  See the full catalogue
                </Button>
              </div>
            }
          />
          <div className="mt-10">
            {loading && <CardSkeleton count={3} />}
            {!loading && !courses?.length && (
              <EmptyState
                title="No professional courses published yet"
                description="Courses are managed in the admin. Publish one to see it listed here."
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

      <Section tone="white">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 className="text-h2 font-bold">How a programme is chosen</h2>
              <p className="mt-4 text-lead text-slate-600">
                The order matters. Picking the course first is how people end up with certificates that change nothing.
              </p>
            </div>
            <ol className="lg:col-span-6 lg:col-start-7">
              {[
                ['Name the role, not the subject', 'We start from the job description you want to be credible for.'],
                ['Find the actual gap', 'Often it is one skill or one credential, not a whole discipline.'],
                ['Check the market reads it', 'A qualification only helps if recruiters in your sector recognise it.'],
                ['Then pick the programme', 'Format, cost and time commitment, against what you can realistically sustain.'],
              ].map(([title, body], i) => (
                <li key={title} className="flex gap-5 border-b border-line py-5 first:border-t">
                  <span className="tabular text-caption font-bold text-azure">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="text-body font-bold text-ink">{title}</h3>
                    <p className="mt-1 text-small text-slate-600">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </Section>

      <CTASection
        title="Tell us the role, we will tell you the course."
        body="Bring a job posting you would like to be a plausible candidate for. That is the most useful thing to start from."
        primary={{ label: 'Book a free consultation', to: '/contact#consultation' }}
        secondary={{ label: 'Short courses instead', to: '/upskills' }}
      />
    </>
  );
}
