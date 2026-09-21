import { Bot, Sparkles, User } from 'lucide-react';
import { Container, Section } from '../ui/Container.jsx';
import { SectionHeader } from '../ui/SectionHeader.jsx';
import { Button } from '../ui/Button.jsx';

const ACTIONS = ['Improve Power BI skills', 'Explore relevant management programs', 'Find Operations Manager jobs', 'Improve resume'];

/**
 * Static preview of the AI Career Assistant — a screenshot-like demo rather
 * than a live chat, since the real one lives behind sign-in at /assistant
 * (it reads the visitor's own profile).
 */
export function AiAssistantPreview() {
  return (
    <Section tone="ink">
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <p className="eyebrow-dark">DutyLaunch AI Career Assistant</p>
            <h2 className="mt-4 text-h1 font-extrabold text-white">Ask it what to do next.</h2>
            <p className="mt-4 text-lead text-slate-300">
              Tell it a role you're aiming for, and it compares that against your actual profile —
              then hands you concrete actions, not just advice.
            </p>
            <p className="mt-3 text-caption text-slate-400">
              A demo assistant today, reasoning over your saved profile — not a live model.
            </p>
            <Button to="/register" size="lg" variant="onInk" className="mt-6">
              Try the AI Career Assistant
            </Button>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
              <div className="flex justify-end gap-3">
                <div className="max-w-[80%] rounded-xl bg-white/10 px-4 py-3 text-small text-white">
                  I want to become an Operations Manager.
                </div>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-white">
                  <User className="h-4 w-4" aria-hidden />
                </span>
              </div>

              <div className="mt-4 flex gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-btn-grad text-white shadow-blue">
                  <Bot className="h-4 w-4" aria-hidden />
                </span>
                <div className="max-w-[85%] rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 text-small leading-relaxed text-slate-200">
                  Based on your current profile, you already have strong operations experience. Your
                  profile could be strengthened by improving analytics skills and adding a relevant
                  management qualification depending on the roles you are targeting.
                </div>
              </div>

              <div className="ml-11 mt-3 flex flex-wrap gap-2">
                {ACTIONS.map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-caption font-semibold text-slate-200"
                  >
                    <Sparkles className="h-3 w-3 text-azure-300" aria-hidden />
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
