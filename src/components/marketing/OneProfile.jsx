import { Check } from 'lucide-react';
import { Container, Section } from '../ui/Container.jsx';
import { SectionHeader } from '../ui/SectionHeader.jsx';
import { ProgressRing } from '../ui/Progress.jsx';
import { GlassPanel } from '../premium/GlassPanel.jsx';

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
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          <div className="min-w-0 lg:col-span-6">
            <SectionHeader
              align="stack"
              label="One profile. Multiple opportunities."
              title={
                <span className="block max-w-[24ch]">Fill it in once. It works everywhere.</span>
              }
            />
            <ul className="mt-8 grid gap-x-6 gap-y-3 min-[400px]:grid-cols-2">
              {POWERS.map((label) => (
                <li key={label} className="flex items-start gap-2.5 text-small text-slate-700">
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-gradient-to-br from-frost-400 to-aurora-500">
                    <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} aria-hidden />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative min-w-0 lg:col-span-6">
            {/* A soft, localized glow behind just the card — this section's
                one moment of depth. The section background itself stays
                plain white on purpose: Hero directly above already carries
                its own glacier tone and grid texture, and repeating a full
                mesh here would blur the two into one undifferentiated band
                instead of reading as a rich section followed by a quiet one. */}
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-frost-300/50 via-aurora-300/40 to-cream-200/40 blur-3xl"
              aria-hidden
            />
            <GlassPanel className="relative mx-auto max-w-md p-5 transition-transform duration-300 hover:-translate-y-1 sm:p-6">
              <div className="flex items-center gap-4">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-frost-500 via-azure-500 to-aurora-500 text-lead font-extrabold text-white shadow-crystal">
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
                  <span
                    key={s}
                    className="rounded-full border border-frost-200 bg-white/70 px-2.5 py-1 text-caption font-semibold text-azure-700"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-glacier-400/60 pt-5 text-center">
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
            </GlassPanel>
            <p className="relative mt-3 text-center text-caption text-slate-400">Illustrative profile — for demonstration only.</p>
          </div>
        </div>
      </Container>
    </Section>
  );
}