import { ClipboardList, Gauge, Target, TrendingUp, GraduationCap, Send, Rocket } from 'lucide-react';
import { Container, Section } from '../ui/Container.jsx';
import { SectionHeader } from '../ui/SectionHeader.jsx';

const STEPS = [
  { icon: ClipboardList, title: 'Build', body: 'Create one professional profile — experience, skills, education and resume.' },
  { icon: Gauge, title: 'Assess', body: 'Get an AI Profile Assessment that scores it and shows exactly what is missing.' },
  { icon: Target, title: 'Match', body: 'See how your profile compares against real, open roles.' },
  { icon: TrendingUp, title: 'Improve', body: 'Understand the specific gaps standing between you and the roles you want.' },
  { icon: GraduationCap, title: 'Learn', body: 'Get course and education recommendations that close those gaps.' },
  { icon: Send, title: 'Apply', body: 'Apply with a profile that is already working in your favour.' },
  { icon: Rocket, title: 'Grow', body: 'Track applications, keep improving your profile, and move to the next role.' },
];

/**
 * The core product loop, made visible. Everything else on DutyLaunch — CV
 * bundles, courses, the job board — is a way of moving along this line, not
 * a separate product.
 */
export function CareerJourney() {
  return (
    <Section tone="paper">
      <Container>
        <SectionHeader
          label="Your career journey, connected"
          title="One profile. Seven steps. No dead ends."
          lead="Every DutyLaunch tool feeds the same profile, and every recommendation traces back to it."
        />
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <div key={title} className="tile relative p-5">
              <span className="tabular absolute right-4 top-4 text-caption font-bold text-slate-300">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="tile-icon grid h-10 w-10 place-items-center rounded-lg bg-azure-50">
                <Icon className="h-5 w-5 text-azure" aria-hidden />
              </span>
              <h3 className="mt-4 text-body font-bold text-ink">{title}</h3>
              <p className="mt-1.5 text-small text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
