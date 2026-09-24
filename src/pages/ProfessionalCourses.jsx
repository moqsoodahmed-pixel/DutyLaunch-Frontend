import { useState } from 'react';
import * as Icons from 'lucide-react';
import { Seo } from '../components/ui/Seo.jsx';
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
import { PartnerModal } from '../components/marketing/PartnerModal.jsx';

/* Content from dutylaunch.com/online-distance-education, in the live site's order. */
const COURSE_GROUPS = [
  {
    title: 'Business & Management',
    icon: 'Briefcase',
    items: ['Digital Marketing', 'HR & Recruitment', 'Finance & Accounting', 'GST & Taxation', 'Banking & Finance'],
  },
  {
    title: 'Career Development',
    icon: 'TrendingUp',
    items: [
      'Soft Skills Development',
      'Communication Skills',
      'Spoken English',
      'Personality Development',
      'Interview Preparation',
      'Leadership Skills',
    ],
  },
  {
    title: 'Technology',
    icon: 'Cpu',
    items: [
      'Data Analytics',
      'Data Science',
      'Artificial Intelligence (AI)',
      'Machine Learning',
      'Cyber Security',
      'Software Testing',
      'Cloud Computing',
      'Full Stack Development',
      'UI / UX Design',
    ],
  },
  {
    title: 'Certifications',
    icon: 'Award',
    items: [
      'Microsoft Certifications',
      'Tally Prime',
      'Google Certifications',
      'AWS Certifications',
      'Power BI',
      'SAP',
      'Advanced Excel',
    ],
  },
];

const WORKING_PROFESSIONALS = [
  'We recommend the right course and university based on your current role, industry, and career goals.',
  'Flexible online and distance formats designed for working schedules.',
  'Guidance from our partnered universities on program fit, eligibility, and admission requirements.',
  "Support through the full admissions process, so you're not managing paperwork and deadlines alone.",
];

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
  const [partnerSel, setPartnerSel] = useState(null);
  const openPartners = (item, group) => setPartnerSel({ item, group });
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
        aside={<SiteImage image={images.training} priority className="mx-auto lg:ml-auto lg:mr-0" />}
      />

      <Section tone="paper">
        <Container>
          <p className="max-w-prose text-lead text-slate-600">
            Gain industry-recognized certifications, practical knowledge, and hands-on learning to unlock better career
            opportunities.
          </p>
          <ItemGroups groups={COURSE_GROUPS} columns="md:grid-cols-2" className="mt-8" onItemClick={openPartners} />
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

      <Section tone="paper">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 className="max-w-[18ch] text-h2 font-bold">Built for Working Professionals</h2>
              <p className="mt-4 text-lead text-slate-600">
                Most of our education clients are already working. We help you fit higher studies around your job, not
                the other way around, and guide you specifically toward qualifications that support your next move —
                whether that&apos;s a promotion, a career change, or a salary hike.
              </p>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <CheckList items={WORKING_PROFESSIONALS} className="tile p-6" />
            </div>
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
                  realistic options and help you shortlist, apply, and enroll with confidence — without the sales
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
      <PartnerModal selection={partnerSel} onClose={() => setPartnerSel(null)} service="Professional courses" />
    </>
  );
}