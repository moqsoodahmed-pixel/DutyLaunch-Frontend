import { Check } from 'lucide-react';
import { Container, Section } from '../ui/Container.jsx';
import { SectionHeader } from '../ui/SectionHeader.jsx';
import { ProgressRing } from '../ui/Progress.jsx';

const POWERS = [
  'Resume',
  'Job matching',
  'AI profile assessment',
  'Career recommendations',
  'Education recommendations',
  'Course recommendations',
  'Employer matching',
  'Career growth tracking',
];

/**
 * Realistic (demo) profile-card preview, paired with the list of things one
 * profile drives: the visual argument for why DutyLaunch isn't "a resume
 * builder that also has a job board".
 *
 * Sits on the pale mist-blue (the hero colour) with a white profile card, so
 * every word and the score ring are dark-on-light and clearly readable.
 */
export function OneProfile() {
  return (
    <Section tone="mist">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          <div className="min-w-0 lg:col-span-6">
            <SectionHeader
              align="stack"
              label="One profile. Multiple opportunities."
              title={<span className="block max-w-[24ch]">Fill it in once. It works everywhere.</span>}
            />
            <ul className="mt-8 grid gap-x-6 gap-y-3 min-[400px]:grid-cols-2">
              {POWERS.map((label) => (
                <li key={label} className="flex items-start gap-2.5 text-small font-medium text-slate-700">
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-azure">
                    <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} aria-hidden />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative min-w-0 lg:col-span-6">
            <div className="relative mx-auto max-w-md rounded-2xl border-2 border-mist-line bg-white p-5 text-ink shadow-[0_22px_50px_-22px_rgba(29,93,184,0.45)] transition-transform duration-300 hover:-translate-y-1 sm:p-6">
              <div className="flex items-center gap-4">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#0E7FB8] via-[#2557C9] to-[#6A47D9] text-lead font-extrabold text-white shadow-[0_4px_12px_rgba(29,93,184,0.35)]">
                  DS
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body font-bold text-ink">Devika R. Shah</p>
                  <p className="text-small leading-snug text-slate-600">Product Marketing Manager · Mumbai</p>
                </div>
                <ProgressRing value={88} size={56} strokeWidth={6} sublabel="" />
              </div>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {['Marketing Strategy', 'Content Marketing', 'SEO', 'Analytics'].map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-azure-200 bg-mist-chip px-2.5 py-1 text-caption font-semibold text-azure-700"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-mist-line pt-5 text-center">
                <div>
                  <p className="tabular text-body font-extrabold text-ink">6</p>
                  <p className="text-caption text-slate-600">Years exp.</p>
                </div>
                <div>
                  <p className="tabular text-body font-extrabold text-ink">15</p>
                  <p className="text-caption text-slate-600">Applications</p>
                </div>
                <div>
                  <p className="tabular text-body font-extrabold text-ink">91%</p>
                  <p className="text-caption text-slate-600">Top match</p>
                </div>
              </div>
            </div>
            <p className="relative mt-3 text-center text-caption text-slate-600">Illustrative profile, for demonstration only.</p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
