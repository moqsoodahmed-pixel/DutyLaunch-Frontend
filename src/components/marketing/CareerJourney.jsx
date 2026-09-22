import { ClipboardList, Gauge, Target, TrendingUp, GraduationCap, Send, Rocket } from 'lucide-react';
import { Container, Section } from '../ui/Container.jsx';
import { SectionHeader } from '../ui/SectionHeader.jsx';
import { Reveal, RevealGroup, RevealItem } from '../ui/Reveal.jsx';

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
 *
 * Layout note: this used to run seven cards across one row at xl, which left
 * each card around 130px wide and broke every description into six or seven
 * one-word lines. The grid now tops out at four columns so a card is always
 * wide enough to set 4–6 words per line, and the steps read as a connected
 * sequence via the number rail rather than by sitting on a single row.
 */
export function CareerJourney() {
  return (
    <Section tone="paper">
      <Container>
        <Reveal>
          <SectionHeader
            label="Your career journey, connected"
            title="One profile. Seven steps. No dead ends."
            lead="Every DutyLaunch tool feeds the same profile, and every recommendation traces back to it."
          />
        </Reveal>

        <RevealGroup
          as="ol"
          className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          staggerDelay={0.06}
        >
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <RevealItem
              as="li"
              key={title}
              className="tile group relative flex flex-col p-6 transition-all duration-200 hover:-translate-y-1 hover:border-azure-200 hover:shadow-lift"
            >
              <div className="flex items-center gap-3">
                <span className="tile-icon grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-azure-50 transition-colors duration-200 group-hover:bg-azure-100">
                  <Icon className="h-5 w-5 text-azure" aria-hidden />
                </span>
                <span
                  className="tabular text-caption font-bold text-slate-300 transition-colors duration-200 group-hover:text-azure-300"
                  aria-hidden
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="mt-4 text-body font-bold text-ink">{title}</h3>
              <p className="mt-1.5 text-pretty text-small text-slate-600">{body}</p>
            </RevealItem>
          ))}

          {/* Closes the four-across grid on xl with the payoff rather than a
              gap, so the last row never reads as a missing card. */}
          <RevealItem className="relative flex flex-col justify-center rounded-xl border border-dashed border-azure-200 bg-azure-50/40 p-6">
            <p className="text-body font-bold text-ink">One profile, start to finish.</p>
            <p className="mt-1.5 text-pretty text-small text-slate-600">
              Each step writes back to the same profile, so nothing is filled in twice.
            </p>
          </RevealItem>
        </RevealGroup>
      </Container>
    </Section>
  );
}