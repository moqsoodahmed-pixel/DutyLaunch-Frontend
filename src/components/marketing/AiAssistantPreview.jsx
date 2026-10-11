import { Bot, User } from 'lucide-react';
import { Container, Section } from '../ui/Container.jsx';
import { Button } from '../ui/Button.jsx';
import { RevealGroup, RevealItem, Reveal } from '../ui/Reveal.jsx';

const ACTIONS = ['Improve Power BI skills', 'Explore relevant management programs', 'Find Operations Manager jobs', 'Improve resume'];

/**
 * Static preview of the AI Career Assistant: a screenshot-like demo rather
 * than a live chat, since the real one lives behind sign-in at /assistant
 * (it reads the visitor's own profile). The exchange below is illustrative;
 * the messages reveal in sequence as the section scrolls into view.
 *
 * Pale mist-blue section, white chat window, dark readable text.
 */
export function AiAssistantPreview() {
  return (
    <Section tone="mist">
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <Reveal className="lg:col-span-5">
            <p className="inline-flex items-center gap-2 rounded-full border border-azure-200 bg-white px-3 py-1 text-caption font-bold uppercase tracking-wider text-azure-700">
              DutyLaunch AI Career Assistant
            </p>
            <h2 className="mt-4 text-h1 font-extrabold text-ink">
              Ask it what to do{' '}
              <span className="-mb-[0.14em] bg-gradient-to-r from-azure via-azure-400 to-violet bg-clip-text pb-[0.14em] text-transparent">
                next.
              </span>
            </h2>
            <p className="mt-4 text-lead text-slate-700">
              Tell it a role you're aiming for, and it compares that against your actual profile,
              then hands you concrete actions, not just advice.
            </p>
            <p className="mt-3 text-caption text-slate-600">
              Answers come from a live AI model grounded in DutyLaunch's own services, pricing and
              courses, and your saved profile.
            </p>
            <Button to="/register" size="lg" variant="premium" magnetic className="mt-6">
              Try the AI Career Assistant
            </Button>
          </Reveal>

          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-xl border-2 border-mist-line bg-white shadow-[0_22px_50px_-22px_rgba(29,93,184,0.45)]">
              {/* Window header */}
              <div className="flex items-center justify-between border-b border-mist-line px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-azure text-white">
                    <Bot className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <span className="text-caption font-semibold text-ink">Career Assistant</span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-caption font-medium text-slate-600">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/60 motion-reduce:animate-none" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                  </span>
                  Online
                </span>
              </div>

              <RevealGroup className="p-5" staggerDelay={0.35}>
                <RevealItem className="flex justify-end gap-3">
                  <div className="max-w-[80%] rounded-xl bg-azure px-4 py-3 text-small text-white">
                    I want to become an Operations Manager.
                  </div>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-mist-chip text-azure-700">
                    <User className="h-4 w-4" aria-hidden />
                  </span>
                </RevealItem>

                <RevealItem className="mt-4 flex gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-azure text-white">
                    <Bot className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="max-w-[85%] rounded-xl border border-mist-line bg-mist-soft px-4 py-3 text-small leading-relaxed text-ink">
                    Based on your current profile, you already have strong operations experience. Your
                    profile could be strengthened by improving analytics skills and adding a relevant
                    management qualification depending on the roles you are targeting.
                  </div>
                </RevealItem>

                <RevealItem className="ml-11 mt-3 flex flex-wrap gap-2">
                  {ACTIONS.map((a) => (
                    <span
                      key={a}
                      className="inline-flex items-center rounded-full border border-azure-200 bg-white px-3 py-1.5 text-caption font-semibold text-azure-700 transition-colors hover:border-azure hover:bg-mist-chip"
                    >
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
