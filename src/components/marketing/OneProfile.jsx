import { Check } from 'lucide-react';
import { Container, Section } from '../ui/Container.jsx';
import { SectionHeader } from '../ui/SectionHeader.jsx';
import { ProgressRing } from '../ui/Progress.jsx';
import { GlacierBackdrop } from '../premium/GlacierBackdrop.jsx';

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
    <Section tone="ink" seamTop="dark" seamBottom="dark" backdrop={<GlacierBackdrop tone="dark" />}>
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          <div className="min-w-0 lg:col-span-6">
            <SectionHeader
              tone="dark"
              align="stack"
              label="One profile. Multiple opportunities."
              title={
                <span className="block max-w-[24ch]">Fill it in once. It works everywhere.</span>
              }
            />
            <ul className="mt-8 grid gap-x-6 gap-y-3 min-[400px]:grid-cols-2">
              {POWERS.map((label) => (
                <li key={label} className="flex items-start gap-2.5 text-small text-slate-300">
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-gradient-to-br from-frost-400 to-aurora-500">
                    <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} aria-hidden />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative min-w-0 lg:col-span-6">
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-frost-400/20 via-aurora-400/20 to-azure-500/20 blur-3xl"
              aria-hidden
            />
            <div className="relative mx-auto max-w-md rounded-2xl border border-white/10 bg-ink-800/80 p-5 shadow-crystal-lg backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 sm:p-6 text-white">
              <div className="flex items-center gap-4">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-frost-500 via-azure-500 to-aurora-500 text-lead font-extrabold text-white shadow-crystal">
                  AS
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body font-bold text-white">Ananya Sharma</p>
                  <p className="truncate text-small text-slate-400">Operations Manager · Bengaluru</p>
                </div>
                <ProgressRing value={82} size={56} strokeWidth={6} sublabel="" tone="dark" />
              </div>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {['Operations', 'Team Management', 'Excel', 'Vendor Management'].map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-caption font-semibold text-frost-300 backdrop-blur-xs"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-5 text-center">
                <div>
                  <p className="tabular text-body font-extrabold text-white">7</p>
                  <p className="text-caption text-slate-400">Years exp.</p>
                </div>
                <div>
                  <p className="tabular text-body font-extrabold text-white">12</p>
                  <p className="text-caption text-slate-400">Applications</p>
                </div>
                <div>
                  <p className="tabular text-body font-extrabold text-white">86%</p>
                  <p className="text-caption text-slate-400">Top match</p>
                </div>
              </div>
            </div>
            <p className="relative mt-3 text-center text-caption text-slate-400">Illustrative profile — for demonstration only.</p>
          </div>
        </div>
      </Container>
    </Section>
  );
}