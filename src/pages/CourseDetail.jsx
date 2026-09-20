import { useParams } from 'react-router-dom';
import { Check, Clock, MonitorPlay, SignalHigh } from 'lucide-react';
import { Seo } from '../components/ui/Seo.jsx';
import { Container, Section } from '../components/ui/Container.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Breadcrumb } from '../components/ui/Breadcrumb.jsx';
import { LoadingBlock, ErrorState } from '../components/ui/States.jsx';
import { ArticleBody } from '../components/blog/ArticleBody.jsx';
import { CourseCard } from '../components/courses/CourseCard.jsx';
import { CTASection } from '../components/marketing/CTASection.jsx';
import { useApi } from '../hooks/useApi.js';
import { courseService } from '../services/contentService.js';
import { formatCurrency } from '../utils/format.js';

export default function CourseDetail() {
  const { slug } = useParams();
  const { data, loading, error, refetch } = useApi(() => courseService.get(slug), [slug]);

  if (loading) return <LoadingBlock label="Loading course" className="min-h-[60vh]" />;
  if (error) {
    return (
      <Container className="py-20">
        <ErrorState error={error} onRetry={refetch} />
      </Container>
    );
  }

  const { course, related } = data;
  const price =
    course.priceOnRequest || course.price == null ? 'Price on request' : formatCurrency(course.price, course.currency);

  return (
    <>
      <Seo title={course.title} description={course.summary} type="article" />

      <section className="border-b border-line bg-paper">
        <Container className="py-12 lg:py-16">
          <Breadcrumb items={[{ label: 'Courses', to: '/courses' }, { label: course.title }]} />
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="flex flex-wrap items-center gap-2">
                {course.category?.name && <Badge tone="outline">{course.category.name}</Badge>}
                <Badge tone="azure">{course.level}</Badge>
                <Badge tone="neutral">{course.track}</Badge>
              </div>
              <h1 className="mt-4 text-h1 font-extrabold">{course.title}</h1>
              <p className="mt-4 max-w-prose text-lead text-slate-600">{course.summary}</p>
            </div>

            <aside className="lg:col-span-4 lg:col-start-9">
              <div className="tile p-6">
                <p className="text-h2 font-extrabold text-ink">{price}</p>
                <dl className="mt-5 space-y-3 border-t border-line pt-5 text-small">
                  {course.duration && (
                    <div className="flex items-center gap-2.5 text-slate-600">
                      <Clock className="h-4 w-4 text-slate-400" aria-hidden />
                      <dt className="sr-only">Duration</dt>
                      <dd>{course.duration}</dd>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <MonitorPlay className="h-4 w-4 text-slate-400" aria-hidden />
                    <dt className="sr-only">Mode</dt>
                    <dd>{course.mode}</dd>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <SignalHigh className="h-4 w-4 text-slate-400" aria-hidden />
                    <dt className="sr-only">Level</dt>
                    <dd>{course.level}</dd>
                  </div>
                </dl>
                <Button to="/contact#consultation" fullWidth className="mt-6">
                  Enquire about this course
                </Button>
                <p className="mt-3 text-center text-caption text-slate-500">
                  Enrolment is confirmed by a counsellor. Nothing is charged automatically.
                </p>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <Section tone="white">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <ArticleBody content={course.description} />

              {course.modules?.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-h2 font-bold">What the course covers</h2>
                  <ol className="mt-6 divide-y divide-line border-y border-line">
                    {course.modules.map((module, i) => (
                      <li key={module.title} className="flex gap-4 py-4">
                        <span className="tabular mt-0.5 text-caption font-bold text-slate-400">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <h3 className="text-body font-semibold text-ink">{module.title}</h3>
                          {module.detail && <p className="mt-1 text-small text-slate-600">{module.detail}</p>}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            {course.outcomes?.length > 0 && (
              <aside className="lg:col-span-4 lg:col-start-9">
                <div className="rounded-lg bg-paper p-6 lg:sticky lg:top-24">
                  <h2 className="text-h3 font-bold text-ink">By the end you can</h2>
                  <ul className="mt-4 space-y-3">
                    {course.outcomes.map((outcome) => (
                      <li key={outcome} className="flex gap-2.5 text-small text-slate-700">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            )}
          </div>
        </Container>
      </Section>

      {related?.length > 0 && (
        <Section tone="paper">
          <Container>
            <h2 className="text-h2 font-bold">Related courses</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <CourseCard key={item._id} course={item} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      <CTASection
        title="Want a second opinion before enrolling?"
        body="Tell us the role you are aiming at. If this course is not the fastest route there, we will say which is."
        primary={{ label: 'Book a free consultation', to: '/contact#consultation' }}
        secondary={{ label: 'Back to all courses', to: '/courses' }}
      />
    </>
  );
}
