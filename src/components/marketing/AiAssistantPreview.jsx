import { Sparkles, User } from 'lucide-react';
import { Container, Section } from '../ui/Container.jsx';
import { Button } from '../ui/Button.jsx';
import { RevealGroup, RevealItem, Reveal } from '../ui/Reveal.jsx';
import { GlacierBackdrop } from '../premium/GlacierBackdrop.jsx';

const ACTIONS = ['Improve Power BI skills', 'Explore relevant management programs', 'Find Operations Manager jobs', 'Improve resume'];

// Same conic gradient the real assistant (pages/dashboard/Assistant.jsx) uses
// for its orb and avatar, so this preview matches what a visitor actually
// sees after signing up rather than a generic chat mock-up.
const AI_GRADIENT = 'bg-[conic-gradient(from_140deg,#6D4AE8,#2B72D4,#8C6DFB,#1D5DB8,#6D4AE8)]';

/**
 * Static preview of the AI Career Assistant — a screenshot-like demo rather
 * than a live chat, since the real one lives behind sign-in at /assistant
 * (it reads the visitor's own profile). The exchange below is illustrative;
 * the messages reveal in sequence as the section scrolls into view.
 */
export function AiAssistantPreview() {
  return (
    <Section tone="ink" backdrop={<GlacierBackdrop tone="dark" dense />}>
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <Reveal className="lg:col-span-5">
            {/* Was bg-ink-900/70 — matched to the new dark-section palette's
                deeper shade (.seam-tone-ink900 in index.css). */}
            <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-[#160F29]/70 px-3 py-1 text-caption font-bold uppercase tracking-wider text-frost-200 shadow-lg backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              DutyLaunch AI Career Assistant
            </p>
            <h2 className="mt-4 text-h1 font-extrabold text-white [text-shadow:0_2px_28px_rgba(11,31,72,0.6)]">
              Ask it what to do{' '}
              <span className="-mb-[0.14em] bg-gradient-to-r from-frost-300 via-azure-200 to-aurora-400 bg-clip-text pb-[0.14em] text-transparent">
                next.
              </span>
            </h2>
            <p className="mt-4 text-lead text-slate-200 [text-shadow:0_1px_14px_rgba(11,31,72,0.5)]">
              Tell it a role you're aiming for, and it compares that against your actual profile —
              then hands you concrete actions, not just advice.
            </p>
            <p className="mt-3 text-caption text-slate-300">
              Answers come from a live AI model grounded in DutyLaunch's own services, pricing and
              courses — and your saved profile.
            </p>
            <Button to="/register" size="lg" variant="premium" magnetic className="mt-6">
              Try the AI Career Assistant
            </Button>
          </Reveal>

          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.05] shadow-crystal-lg backdrop-blur-xl">
              {/* Window header */}
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <span className={`grid h-6 w-6 place-items-center rounded-full ${AI_GRADIENT} shadow-glow`}>
                    <Sparkles className="h-3 w-3 text-white" aria-hidden />
                  </span>
                  <span className="text-caption font-semibold text-white">Career Assistant</span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-caption text-slate-400">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/60 motion-reduce:animate-none" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                  </span>
                  Online
                </span>
              </div>

              <RevealGroup className="p-5" staggerDelay={0.35}>
                <RevealItem className="flex justify-end gap-3">
                  <div className="max-w-[80%] rounded-xl bg-white/10 px-4 py-3 text-small text-white">
                    I want to become an Operations Manager.
                  </div>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-white">
                    <User className="h-4 w-4" aria-hidden />
                  </span>
                </RevealItem>

                <RevealItem className="mt-4 flex gap-3">
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${AI_GRADIENT} text-white shadow-glow`}>
                    <Sparkles className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  {/* Was bg-ink-900/60 — matched to the new dark-section
                      palette's deeper shade (.seam-tone-ink900 in index.css). */}
                  <div className="max-w-[85%] rounded-xl border border-white/10 bg-[#160F29]/60 px-4 py-3 text-small leading-relaxed text-slate-100">
                    Based on your current profile, you already have strong operations experience. Your
                    profile could be strengthened by improving analytics skills and adding a relevant
                    management qualification depending on the roles you are targeting.
                  </div>
                </RevealItem>

                <RevealItem className="ml-11 mt-3 flex flex-wrap gap-2">
                  {ACTIONS.map((a) => (
                    <span
                      key={a}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-caption font-semibold text-white transition-colors hover:border-frost-300/50 hover:bg-white/[0.16]"
                    >
                      <Sparkles className="h-3 w-3 text-frost-300" aria-hidden />
                      {a}
                    </span>
                  ))}
                </RevealItem>
              </RevealGroup>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}