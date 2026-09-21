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
 * profile drives — the visual argument for why DutyLaunch isn't "a resume
 * builder that also has a job board".
 */
export function OneProfile() {
  return (
    <Section tone="white">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6">
            <SectionHeader label="One profile. Multiple opportunities." title="Fill it in once. It works everywhere." />
            <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3">
              {POWERS.map((label) => (
                <li key={label} className="flex items-start gap-2 text-small text-slate-700">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-6">
            <div className="tile mx-auto max-w-md p-6">
              <div className="flex items-center gap-4">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-azure-500 to-azure-700 text-lead font-extrabold text-white shadow-blue">
                  AS
                </span>
                <div className="min-w-0">
                  <p className="truncate text-body font-bold text-ink">Ananya Sharma</p>
                  <p className="truncate text-small text-slate-500">Operations Manager · Bengaluru</p>
                </div>
                <ProgressRing value={82} size={56} strokeWidth={6} sublabel="" />
              </div>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {['Operations', 'Team Management', 'Excel', 'Vendor Management'].map((s) => (
                  <span key={s} className="rounded-full bg-azure-50 px-2.5 py-1 text-caption font-semibold text-azure-700">
                    {s}
                  </span>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-5 text-center">
                <div>
                  <p className="tabular text-body font-extrabold text-ink">7</p>
                  <p className="text-caption text-slate-500">Years exp.</p>
                </div>
                <div>
                  <p className="tabular text-body font-extrabold text-ink">12</p>
                  <p className="text-caption text-slate-500">Applications</p>
                </div>
                <div>
                  <p className="tabular text-body font-extrabold text-ink">86%</p>
                  <p className="text-caption text-slate-500">Top match</p>
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-caption text-slate-400">Illustrative profile — for demonstration only.</p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
