import { Icons } from '../utils/iconMap.js';
import { Seo } from '../components/ui/Seo.jsx';
import { seoFor } from '../data/seoPages.js';
import { Container, Section } from '../components/ui/Container.jsx';
import { SectionHeader } from '../components/ui/SectionHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { CardSkeleton, EmptyState } from '../components/ui/States.jsx';
import { PageHero, HeroActions } from '../components/marketing/PageHero.jsx';
import { CTASection } from '../components/marketing/CTASection.jsx';
import { CourseCard } from '../components/courses/CourseCard.jsx';
import { ItemGroups, CheckList } from '../components/marketing/ItemGroups.jsx';
import { useApi } from '../hooks/useApi.js';
import { courseService } from '../services/contentService.js';
import { serviceSchema } from '../utils/seo.js';
import { images } from '../data/images.js';
import { SiteImage } from '../components/ui/SiteImage.jsx';
import { MousePointerClick } from 'lucide-react';
import { COURSE_GROUPS, programmeHref } from '../data/programmes.js';

const PROGRAMS_WE_SUPPORT = [
  '10th & 12th Completion Programs',
  'Distance Education Admissions',
  "Online Degree Programs (Bachelor's)",
  "Master's / PG Programs",
  'Executive MBA Programs',
  'Professional Certification Programs',
  'International Education Assistance',
];

export default function ProfessionalCourses() {
  const { data: courses, loading } = useApi(() => courseService.list({ track: 'professional', limit: 6 }), []);
  const { data: categories } = useApi(() => courseService.categories(), []);

  return (
    <>
      <Seo
        title={seoFor('professionalCourses').title}
        description={seoFor('professionalCourses').description}
        schema={serviceSchema({
          name: 'Professional courses',
          description: 'Structured, mentor-led professional programmes with career-aligned guidance.',
          path: '/professional-courses',
        })}
      />

      <PageHero
        eyebrow="Upskills"
        title="Professional courses"
        lead="Upskill yourself with industry-recognized professional courses designed to improve your employability and career growth."
        breadcrumb={[{ label: 'Upskills', to: '/upskills' }, { label: 'Professional courses' }]}
        actions={
          <HeroActions
            primary={{ label: 'Browse the catalogue', to: '/courses?track=professional' }}
            secondary={{ label: 'Ask which course fits', to: '/contact#consultation' }}
          />
        }
        aside={<SiteImage image={images.training} priority ratio="5 / 4" className="mx-auto w-full lg:ml-auto lg:mr-0" />}
      />

      <Section tone="paper">
        <Container>
          <p className="max-w-prose text-lead text-slate-600">
            Gain industry-recognized certifications, practical knowledge, and hands-on learning to unlock better career
            opportunities.
          </p>
          <ItemGroups groups={COURSE_GROUPS} columns="md:grid-cols-2" className="mt-8" itemHref={(item) => programmeHref('courses', item)} />
          <p className="mt-6 inline-flex items-center gap-2 text-small text-slate-500">
            <MousePointerClick className="h-4 w-4 text-azure" aria-hidden />
            Select any course to see partner institutes.
          </p>
        </Container>
      </Section>

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
                title="Courses currently not available"
                description="Professional courses are being updated for upcoming intakes. Check back soon or speak with our counsellors for available programmes."
                action={
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Button to="/courses">Browse all courses</Button>
                    <Button to="/contact#consultation" variant="outline">Speak with a counsellor</Button>
                  </div>
                }
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
            <div className="lg:col-span-6">
              <h2 className="text-h2 font-bold">Programs We Support</h2>
              <CheckList items={PROGRAMS_WE_SUPPORT} className="mt-6" />
              <Button to="/contact#consultation" className="mt-8">
                Book a Free Consultation
              </Button>
            </div>
            <div className="lg:col-span-5 lg:col-start-8">
              <div className="tile p-6">
                <h2 className="text-h3 font-bold text-ink">Admission Guidance</h2>
                <p className="mt-3 text-body text-slate-600">
                  Not sure which program fits your goals, timeline, and budget? Our counsellors walk you through your
                  realistic options and help you shortlist, apply, and enroll with confidence, without the sales
                  pressure typical of education agents.
                </p>
                <Button to="/contact#consultation" variant="outline" className="mt-6">
                  Book a Free Consultation
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <CTASection
        title="Ready to Take the Next Step in Your Career?"
        body="Your dream career starts with the right guidance. Whether you’re looking for a better job, planning higher education, relocating abroad, or improving your professional profile, DutyLaunch is here to support you at every stage of your journey."
        primary={{ label: 'Book Free Consultation', to: '/contact#consultation' }}
        secondary={{ label: 'Higher Education', to: '/higher-education' }}
      />
    </>
  );
}