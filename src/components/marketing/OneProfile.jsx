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
                <li key={label} className="flex items-start gap-2.5 text-small text-slate-100">
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-gradient-to-br from-frost-400 to-aurora-500">
                    <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} aria-hidden />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative min-w-0 lg:col-span-6">
            <div className="relative mx-auto max-w-md rounded-2xl border-2 border-[#5B4FB0] bg-[#1B1238] p-5 shadow-[0_24px_60px_-18px_rgba(0,0,0,0.7)] transition-transform duration-300 hover:-translate-y-1 sm:p-6 text-white">
              <div className="flex items-center gap-4">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#0E7FB8] via-[#2557C9] to-[#6A47D9] text-lead font-extrabold text-white shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                  DS
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body font-bold text-white">Devika R. Shah</p>
                  <p className="text-small leading-snug text-slate-200">Product Marketing Manager · Mumbai</p>
                </div>
                <ProgressRing value={88} size={56} strokeWidth={6} sublabel="" tone="dark" />
              </div>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {['Marketing Strategy', 'Content Marketing', 'SEO', 'Analytics'].map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-frost-300/60 bg-[#2E2160] px-2.5 py-1 text-caption font-semibold text-white"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/25 pt-5 text-center">
                <div>
                  <p className="tabular text-body font-extrabold text-white">6</p>
                  <p className="text-caption text-slate-200">Years exp.</p>
                </div>
                <div>
                  <p className="tabular text-body font-extrabold text-white">15</p>
                  <p className="text-caption text-slate-200">Applications</p>
                </div>
                <div>
                  <p className="tabular text-body font-extrabold text-white">91%</p>
                  <p className="text-caption text-slate-200">Top match</p>
                </div>
              </div>
            </div>
            <p className="relative mt-3 text-center text-caption text-slate-200">Illustrative profile — for demonstration only.</p>
          </div>
        </div>
      </Container>
    </Section>
  );
}